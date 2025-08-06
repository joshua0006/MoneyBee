-- Update user_id columns from UUID to TEXT to support Clerk user IDs
ALTER TABLE public.expenses ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.accounts ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.budgets ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.recurring_transactions ALTER COLUMN user_id TYPE TEXT;