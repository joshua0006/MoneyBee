-- Phase 1b: Finish RLS enablement for remaining public tables and harden functions

-- Enable RLS on tables that currently have policies but may not have RLS enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Harden remaining function search paths
CREATE OR REPLACE FUNCTION public.log_checklist_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.audit_log (uid, item_id, prev_state, new_state, changed_by)
    VALUES (NEW.uid, NEW.item_id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$function$;