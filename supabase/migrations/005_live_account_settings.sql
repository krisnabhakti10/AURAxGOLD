-- ============================================================
-- Migration 005: Table live_account untuk data akun live trading
-- Jalankan di Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.live_account (
  id               integer PRIMARY KEY DEFAULT 1,
  login_id         text    NOT NULL DEFAULT '257261514',
  server           text    NOT NULL DEFAULT 'Exness-MT5Real36',
  investor_password text   NOT NULL DEFAULT 'AURAxGOLD1@',
  description      text    NULL,
  updated_at       timestamptz DEFAULT now()
);

-- Constraint agar hanya ada 1 row
ALTER TABLE public.live_account
  ADD CONSTRAINT live_account_single_row CHECK (id = 1);

-- Insert default row
INSERT INTO public.live_account (id, login_id, server, investor_password)
VALUES (1, '257261514', 'Exness-MT5Real36', 'AURAxGOLD1@')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE  public.live_account IS 'Data akun live trading yang ditampilkan di landing page';
COMMENT ON COLUMN public.live_account.login_id IS 'MT5 Account Number';
COMMENT ON COLUMN public.live_account.server   IS 'Broker Server';
COMMENT ON COLUMN public.live_account.investor_password IS 'Investor (read-only) password';
