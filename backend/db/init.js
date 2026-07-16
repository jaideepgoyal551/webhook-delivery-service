// Database initialisation / migration script.
// Run with:  node db/init.js
//
// This script connects to PostgreSQL, creates the `webhooks` table if it
// does not already exist, and inserts a couple of sample rows so you have
// data to work with immediately.

import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ---------------------------------------------------------------------------
// Migration SQL
// ---------------------------------------------------------------------------

const createTableSQL = `
  CREATE TABLE IF NOT EXISTS webhooks (
    id          SERIAL PRIMARY KEY,
    url         TEXT        NOT NULL,
    event_type  TEXT        NOT NULL,
    secret      TEXT        NOT NULL,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

const seedSQL = `
  INSERT INTO webhooks (url, event_type, secret, is_active)
  VALUES
    ('https://api.example.com/webhooks/payments',    'payment_intent.succeeded',    'whsec_abc123def456ghi789jkl', TRUE),
    ('https://api.example.com/webhooks/orders',       'checkout.session.completed',  'whsec_mno456pqr789stu012vwx', TRUE),
    ('https://api.example.com/webhooks/customers',    'customer.created',            'whsec_yza345bcd678efg901hij', FALSE)
  ON CONFLICT DO NOTHING;
`;

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

try {
  console.log("Running migration...");
  await pool.query(createTableSQL);
  console.log('Table "webhooks" is ready.');

  await pool.query(seedSQL);
  console.log("Seed data inserted (if table was empty).");

  console.log("Migration complete.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
