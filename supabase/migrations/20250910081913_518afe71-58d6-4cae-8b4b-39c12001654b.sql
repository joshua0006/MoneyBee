-- Add value_tags column to expenses table for value-based spending reflection
ALTER TABLE public.expenses ADD COLUMN value_tags TEXT[];