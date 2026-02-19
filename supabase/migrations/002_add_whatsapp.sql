-- ============================================================
-- AURAxGOLD Licensing Portal - Migration 002
-- Adds whatsapp column to existing licenses table
-- Run this in your Supabase SQL Editor if you already ran 001
-- ============================================================

ALTER TABLE public.licenses
  ADD COLUMN IF NOT EXISTS whatsapp text NULL;

COMMENT ON COLUMN public.licenses.whatsapp IS 'User WhatsApp number for admin contact';
