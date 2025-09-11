-- Fix user_investments table to use text instead of uuid for user_id to match Clerk authentication
-- This matches the pattern used by other tables like expenses, accounts, budgets

ALTER TABLE public.user_investments 
ALTER COLUMN user_id TYPE text;