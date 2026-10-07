CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  country TEXT NOT NULL,
  method TEXT NOT NULL,            -- 'upi_qr' or 'stripe_card'
  status TEXT DEFAULT 'pending',   -- pending, paid, failed
  reference_id TEXT,               -- UPI deep link string or Stripe payment_intent id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
