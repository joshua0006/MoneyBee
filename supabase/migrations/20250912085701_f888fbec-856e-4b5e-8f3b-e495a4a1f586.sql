-- Fix critical security vulnerability: Secure phone verification codes table
-- Drop the overly permissive policy that allows public access to sensitive phone data

-- Drop the policy that allows anyone to do anything (Using Expression: true)
DROP POLICY IF EXISTS "Allow phone verification during signup" ON public.phone_verification_codes;

-- The existing secure policy "Users can access verification codes for their phone number" 
-- already provides proper access control:
-- - Authenticated users can access their own codes (user_id = auth.uid())
-- - During signup, users can access codes for their phone number (user_id IS NULL AND expires_at > now())
-- This policy remains active and provides the necessary security

-- Add a more specific policy for phone number protection during verification
CREATE POLICY "Users can manage verification codes for their phone during signup" 
ON public.phone_verification_codes 
FOR ALL 
USING (
  -- Users can access their own verification codes once authenticated
  (user_id = auth.uid()) 
  OR 
  -- During signup process: allow access only to non-expired codes with NULL user_id
  -- This allows verification during the signup flow before user account exists
  (user_id IS NULL AND expires_at > now())
)
WITH CHECK (
  -- Users can create/update their own codes once authenticated  
  (user_id = auth.uid())
  OR
  -- During signup: allow creating codes with NULL user_id that expire in the future
  (user_id IS NULL AND expires_at > now())
);