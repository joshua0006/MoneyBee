-- Create credit cards table to store user's cards and their reward structures
CREATE TABLE public.credit_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  network TEXT NOT NULL, -- visa, mastercard, amex
  last_four_digits TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reward categories table for flexible reward structures
CREATE TABLE public.card_reward_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  miles_per_dollar NUMERIC NOT NULL DEFAULT 1,
  monthly_cap_amount NUMERIC, -- spending cap amount (e.g., $1000)
  cap_reset_day INTEGER DEFAULT 1, -- day of month when cap resets
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(card_id, category)
);

-- Create monthly spending tracker for caps
CREATE TABLE public.monthly_card_spending (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_spent NUMERIC DEFAULT 0,
  miles_earned NUMERIC DEFAULT 0,
  cap_reached_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(card_id, category, year, month)
);

-- Add credit card reference to expenses table
ALTER TABLE public.expenses 
ADD COLUMN credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL,
ADD COLUMN miles_earned NUMERIC DEFAULT 0,
ADD COLUMN miles_rate NUMERIC DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_reward_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_card_spending ENABLE ROW LEVEL SECURITY;

-- RLS policies for credit_cards
CREATE POLICY "Allow all operations on credit_cards" 
ON public.credit_cards 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS policies for card_reward_categories
CREATE POLICY "Allow all operations on card_reward_categories" 
ON public.card_reward_categories 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS policies for monthly_card_spending
CREATE POLICY "Allow all operations on monthly_card_spending" 
ON public.monthly_card_spending 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Function to update monthly spending when expense is added/updated
CREATE OR REPLACE FUNCTION public.update_monthly_card_spending()
RETURNS TRIGGER AS $$
DECLARE
  reward_record RECORD;
  spending_record RECORD;
  current_year INTEGER;
  current_month INTEGER;
  miles_to_earn NUMERIC;
BEGIN
  -- Only process if credit card is specified
  IF NEW.credit_card_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get current year and month
  current_year := EXTRACT(YEAR FROM NEW.date);
  current_month := EXTRACT(MONTH FROM NEW.date);
  
  -- Find reward rate for this card and category
  SELECT miles_per_dollar, monthly_cap_amount 
  INTO reward_record
  FROM public.card_reward_categories 
  WHERE card_id = NEW.credit_card_id 
    AND category = NEW.category 
    AND is_active = true;
  
  -- If no specific reward category, check for 'All' category
  IF NOT FOUND THEN
    SELECT miles_per_dollar, monthly_cap_amount 
    INTO reward_record
    FROM public.card_reward_categories 
    WHERE card_id = NEW.credit_card_id 
      AND category = 'All' 
      AND is_active = true;
  END IF;
  
  -- Use default 1 mile per dollar if no reward structure found
  IF NOT FOUND THEN
    reward_record.miles_per_dollar := 1;
    reward_record.monthly_cap_amount := NULL;
  END IF;
  
  -- Get or create monthly spending record
  SELECT * INTO spending_record
  FROM public.monthly_card_spending 
  WHERE card_id = NEW.credit_card_id 
    AND category = NEW.category 
    AND year = current_year 
    AND month = current_month;
  
  -- Calculate miles to earn based on cap
  miles_to_earn := NEW.amount * reward_record.miles_per_dollar;
  
  IF spending_record IS NOT NULL THEN
    -- Check if adding this expense would exceed the cap
    IF reward_record.monthly_cap_amount IS NOT NULL THEN
      IF spending_record.total_spent + NEW.amount > reward_record.monthly_cap_amount THEN
        -- Calculate miles only for the amount within the cap
        IF spending_record.total_spent < reward_record.monthly_cap_amount THEN
          miles_to_earn := (reward_record.monthly_cap_amount - spending_record.total_spent) * reward_record.miles_per_dollar;
        ELSE
          miles_to_earn := 0;
        END IF;
      END IF;
    END IF;
    
    -- Update existing record
    UPDATE public.monthly_card_spending 
    SET 
      total_spent = total_spent + NEW.amount,
      miles_earned = miles_earned + miles_to_earn,
      cap_reached_date = CASE 
        WHEN reward_record.monthly_cap_amount IS NOT NULL 
          AND total_spent + NEW.amount >= reward_record.monthly_cap_amount 
          AND cap_reached_date IS NULL 
        THEN NOW()
        ELSE cap_reached_date
      END,
      updated_at = NOW()
    WHERE id = spending_record.id;
  ELSE
    -- Check cap for new record
    IF reward_record.monthly_cap_amount IS NOT NULL AND NEW.amount > reward_record.monthly_cap_amount THEN
      miles_to_earn := reward_record.monthly_cap_amount * reward_record.miles_per_dollar;
    END IF;
    
    -- Create new record
    INSERT INTO public.monthly_card_spending (
      card_id, category, year, month, total_spent, miles_earned,
      cap_reached_date
    ) VALUES (
      NEW.credit_card_id, NEW.category, current_year, current_month, 
      NEW.amount, miles_to_earn,
      CASE 
        WHEN reward_record.monthly_cap_amount IS NOT NULL AND NEW.amount >= reward_record.monthly_cap_amount 
        THEN NOW()
        ELSE NULL
      END
    );
  END IF;
  
  -- Update the expense with miles earned info
  NEW.miles_earned := miles_to_earn;
  NEW.miles_rate := reward_record.miles_per_dollar;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for updating monthly spending
CREATE TRIGGER update_monthly_spending_trigger
BEFORE INSERT OR UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_monthly_card_spending();

-- Add updated_at trigger for new tables
CREATE TRIGGER update_credit_cards_updated_at
BEFORE UPDATE ON public.credit_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_card_reward_categories_updated_at
BEFORE UPDATE ON public.card_reward_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_card_spending_updated_at
BEFORE UPDATE ON public.monthly_card_spending
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();