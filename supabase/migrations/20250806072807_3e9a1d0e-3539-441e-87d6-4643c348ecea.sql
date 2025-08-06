-- Create expenses table for user expense tracking
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
  account_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create accounts table for financial accounts
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'checking' CHECK (type IN ('checking', 'savings', 'credit', 'cash', 'investment')),
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budgets table for budget tracking
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recurring_transactions table
CREATE TABLE public.recurring_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
  account_id UUID,
  next_due_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expenses
CREATE POLICY "Users can view their own expenses" 
ON public.expenses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" 
ON public.expenses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
ON public.expenses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for accounts
CREATE POLICY "Users can view their own accounts" 
ON public.accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts" 
ON public.accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" 
ON public.accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" 
ON public.accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for budgets
CREATE POLICY "Users can view their own budgets" 
ON public.budgets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets" 
ON public.budgets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" 
ON public.budgets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" 
ON public.budgets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for recurring transactions
CREATE POLICY "Users can view their own recurring transactions" 
ON public.recurring_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring transactions" 
ON public.recurring_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions" 
ON public.recurring_transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions" 
ON public.recurring_transactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create foreign key relationships
ALTER TABLE public.expenses ADD CONSTRAINT fk_expenses_accounts 
FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;

ALTER TABLE public.recurring_transactions ADD CONSTRAINT fk_recurring_accounts 
FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_recurring_user_id ON public.recurring_transactions(user_id);
CREATE INDEX idx_recurring_next_due ON public.recurring_transactions(next_due_date);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_updated_at
BEFORE UPDATE ON public.recurring_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();