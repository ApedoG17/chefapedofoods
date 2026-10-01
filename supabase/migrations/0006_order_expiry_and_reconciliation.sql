-- Chef Apedo Foods — Order Expiration and Late Payment Reconciliation
-- Migration 0006: Add expires_at and manual_review_required flags to orders table

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS manual_review_required boolean DEFAULT false;

-- Index for scheduled cron and lazy expiration queries
CREATE INDEX IF NOT EXISTS idx_orders_expiry
  ON orders (order_status, payment_status, expires_at)
  WHERE order_status = 'awaiting_payment' AND payment_status = 'unpaid';
