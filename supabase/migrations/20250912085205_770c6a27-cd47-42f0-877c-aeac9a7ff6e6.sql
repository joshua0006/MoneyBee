-- Fix critical security vulnerability: Restrict access to personal financial data in pledge_sheets
-- Drop overly permissive policy that allows public access to sensitive financial information

-- Drop the existing policy that allows anyone to view all pledge sheets
DROP POLICY IF EXISTS "Anyone can view pledge sheets" ON public.pledge_sheets;

-- Create secure RLS policies for pledge_sheets table
-- Users can only view their own pledge sheets
CREATE POLICY "Users can view their own pledge sheets" 
ON public.pledge_sheets 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow managers and admins to view all pledge sheets for business purposes
CREATE POLICY "Managers and admins can view all pledge sheets" 
ON public.pledge_sheets 
FOR SELECT 
USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));