-- HOLBERY Marketplace — first-party orders (Duitku POP production)
-- Minimal personal data: buyer name (<=60 chars) and email only.

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,                       -- public opaque id (random)
  merchant_order_id TEXT NOT NULL UNIQUE,    -- sent to Duitku
  access_hash TEXT NOT NULL,                 -- SHA-256 of the buyer's private access token
  product_id TEXT NOT NULL,
  sku TEXT NOT NULL,
  product_title TEXT NOT NULL,
  product_version TEXT NOT NULL,
  amount_idr INTEGER NOT NULL CHECK (amount_idr >= 10000),
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  terms_version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING_PAYMENT','PAID','FAILED','EXPIRED','REFUNDED')),
  provider TEXT NOT NULL DEFAULT 'duitku',
  provider_reference TEXT UNIQUE,
  provider_payment_code TEXT,
  paid_at TEXT,
  download_count INTEGER NOT NULL DEFAULT 0,
  download_limit INTEGER NOT NULL,
  download_expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- Append-only audit trail. No raw callback payloads, signatures, or secrets are stored.
CREATE TABLE IF NOT EXISTS order_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  type TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id);

-- Fixed-window rate limiting keyed by a hash (never raw IP).
CREATE TABLE IF NOT EXISTS rate_limits (
  key_hash TEXT PRIMARY KEY,
  window INTEGER NOT NULL,
  count INTEGER NOT NULL
);

-- Paid state can only be reached once and never reverts except to REFUNDED.
CREATE TRIGGER IF NOT EXISTS orders_paid_is_final
BEFORE UPDATE OF status ON orders
WHEN OLD.status = 'PAID' AND NEW.status NOT IN ('PAID','REFUNDED')
BEGIN
  SELECT RAISE(ABORT, 'INVALID_TRANSITION');
END;

CREATE TRIGGER IF NOT EXISTS orders_amount_immutable
BEFORE UPDATE OF amount_idr, merchant_order_id, product_id ON orders
BEGIN
  SELECT RAISE(ABORT, 'IMMUTABLE_ORDER_FIELD');
END;
