-- Create table to store device push tokens
CREATE TABLE IF NOT EXISTS public.push_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  push_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios','android','web')),
  user_id TEXT,
  user_email TEXT,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_device_platform UNIQUE (device_id, platform)
);

-- Enable RLS and keep it locked down (edge functions will use service role)
ALTER TABLE public.push_devices ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_devices_device ON public.push_devices (device_id);
CREATE INDEX IF NOT EXISTS idx_push_devices_platform ON public.push_devices (platform);
CREATE INDEX IF NOT EXISTS idx_push_devices_user ON public.push_devices (user_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

DROP TRIGGER IF EXISTS trg_push_devices_updated_at ON public.push_devices;
CREATE TRIGGER trg_push_devices_updated_at
BEFORE UPDATE ON public.push_devices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();