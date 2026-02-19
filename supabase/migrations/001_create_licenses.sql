-- ============================================================
-- AURAxGOLD Licensing Portal - Supabase Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Create the licenses table
CREATE TABLE IF NOT EXISTS public.licenses (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        NOT NULL,
  login       bigint      NOT NULL,
  server      text        NOT NULL,
  broker      text        NULL,
  whatsapp    text        NULL,
  status      text        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','approved','rejected','revoked')),
  plan_days   int         NOT NULL DEFAULT 30
                          CHECK (plan_days IN (30, 90)),
  expires_at  timestamptz NULL,
  note        text        NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz NULL,

  CONSTRAINT licenses_login_server_unique UNIQUE (login, server)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_licenses_status     ON public.licenses (status);
CREATE INDEX IF NOT EXISTS idx_licenses_expires_at ON public.licenses (expires_at);
CREATE INDEX IF NOT EXISTS idx_licenses_login_server ON public.licenses (login, server);
CREATE INDEX IF NOT EXISTS idx_licenses_created_at ON public.licenses (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: All access goes through the service role key (server-side only).
-- No public policies are created intentionally; RLS blocks all anon/authenticated
-- direct access. Use SUPABASE_SERVICE_ROLE_KEY in server-side route handlers only.

-- Optional: allow service_role to bypass RLS (it does by default in Supabase)
-- No additional policy needed since service_role bypasses RLS automatically.

COMMENT ON TABLE public.licenses IS 'MT5 EA license records for AURAxGOLD licensing portal';
COMMENT ON COLUMN public.licenses.status IS 'pending | approved | rejected | revoked';
COMMENT ON COLUMN public.licenses.plan_days IS '30 or 90 days subscription';
COMMENT ON COLUMN public.licenses.login IS 'MT5 account login number';
COMMENT ON COLUMN public.licenses.server IS 'MT5 broker server name';
COMMENT ON COLUMN public.licenses.whatsapp IS 'User WhatsApp number for admin contact';