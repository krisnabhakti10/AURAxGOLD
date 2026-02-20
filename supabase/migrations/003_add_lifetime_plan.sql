-- ============================================================
-- AURAxGOLD Licensing Portal - Migration 003
-- Adds lifetime plan support (plan_days = 0)
-- Run this in your Supabase SQL Editor if you already ran 001
-- ============================================================

-- Drop old check constraint and replace with new one that includes 0 (lifetime)
ALTER TABLE public.licenses
  DROP CONSTRAINT IF EXISTS licenses_plan_days_check;

ALTER TABLE public.licenses
  ADD CONSTRAINT licenses_plan_days_check
  CHECK (plan_days IN (0, 30, 90));

COMMENT ON COLUMN public.licenses.plan_days IS '0 = lifetime, 30 or 90 days subscription';
