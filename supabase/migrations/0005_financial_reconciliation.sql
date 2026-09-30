-- Migration 0005: Financial Reconciliation
-- Adds a payment_collected flag for riders to confirm cash/MoMo collection on delivery.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_collected BOOLEAN DEFAULT FALSE;

-- Index for fast filtering in the finance dashboard
CREATE INDEX IF NOT EXISTS idx_orders_payment_collected
  ON public.orders (payment_collected)
  WHERE payment_collected = FALSE;

COMMENT ON COLUMN public.orders.payment_collected IS
  'TRUE when rider confirms cash/MoMo was collected on delivery, or when online payment is verified via webhook.';
