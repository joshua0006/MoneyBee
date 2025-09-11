-- Fix user_investments table to use text instead of uuid for user_id
-- First drop the existing policy, then alter the column, then recreate the policy

-- Drop the existing RLS policy
DROP POLICY IF EXISTS "Users can manage own investments" ON public.user_investments;

-- Alter the column type from uuid to text
ALTER TABLE public.user_investments 
ALTER COLUMN user_id TYPE text;

-- Recreate the RLS policy with text comparison
CREATE POLICY "Users can manage own investments" 
ON public.user_investments 
FOR ALL 
USING (auth.jwt() ->> 'sub' = user_id)
WITH CHECK (auth.jwt() ->> 'sub' = user_id);