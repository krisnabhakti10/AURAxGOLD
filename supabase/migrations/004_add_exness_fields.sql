-- ============================================================
-- Migration 004: Tambah kolom Exness client_uid & exness_status
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Tambah client_uid (dari response affiliation check)
ALTER TABLE public.licenses
ADD COLUMN IF NOT EXISTS client_uid text NULL;

-- Tambah exness_status (ACTIVE / INACTIVE dari Exness API)
ALTER TABLE public.licenses
ADD COLUMN IF NOT EXISTS exness_status text NULL;

-- Index untuk mempercepat query by client_uid (dipakai cron sync)
CREATE INDEX IF NOT EXISTS idx_licenses_client_uid
  ON public.licenses (client_uid)
  WHERE client_uid IS NOT NULL;

COMMENT ON COLUMN public.licenses.client_uid IS 'Exness client UID dari Partnership API affiliation check';
COMMENT ON COLUMN public.licenses.exness_status IS 'Status klien di Exness: ACTIVE | INACTIVE (di-sync via cron)';
