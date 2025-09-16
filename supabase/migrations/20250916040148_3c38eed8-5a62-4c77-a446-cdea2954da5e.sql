-- Fix the handle_new_user trigger to properly set user_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.id,  -- Set user_id to the auth user's ID
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;