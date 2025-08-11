-- Critical Security Fixes for MoneyBee App
-- Phase 1: Enable RLS and create proper policies

-- 1. Enable RLS on tables that don't have it
ALTER TABLE public.push_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_verification_codes ENABLE ROW LEVEL SECURITY;

-- 2. Create secure RLS policies for push_devices (user-specific access)
CREATE POLICY "Users can manage their own push devices"
ON public.push_devices
FOR ALL
USING (user_id = (auth.jwt() ->> 'sub'::text) OR user_email = (auth.jwt() ->> 'email'::text))
WITH CHECK (user_id = (auth.jwt() ->> 'sub'::text) OR user_email = (auth.jwt() ->> 'email'::text));

-- 3. Create secure RLS policies for phone_verification_codes (temporary access during verification)
CREATE POLICY "Users can access verification codes for their phone number"
ON public.phone_verification_codes
FOR ALL
USING (
  user_id = auth.uid() OR 
  (user_id IS NULL AND expires_at > now())
)
WITH CHECK (
  user_id = auth.uid() OR 
  (user_id IS NULL AND expires_at > now())
);

-- 4. Categories - public read access, admin manage
CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage categories"
ON public.categories
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE uid = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE uid = auth.uid() AND role = 'admin'
  )
);

-- 5. Vendors - public read access, admin manage
CREATE POLICY "Anyone can view vendors"
ON public.vendors
FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage vendors"
ON public.vendors
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE uid = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE uid = auth.uid() AND role = 'admin'
  )
);

-- 6. Fix function search paths for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;