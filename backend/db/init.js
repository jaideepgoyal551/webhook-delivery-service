// Database initialisation / migration script.
// Run with:  node db/init.js
//
// Creates both the `webhooks` and `delivery_logs` tables, then seeds a few
// sample webhook rows.

import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ---------------------------------------------------------------------------
// Migration SQL
// ---------------------------------------------------------------------------

const createWebhooksTable = `
  CREATE TABLE IF NOT EXISTS webhooks (
    id          SERIAL PRIMARY KEY,
    url         TEXT        NOT NULL,
    event_type  TEXT        NOT NULL,
    secret      TEXT        NOT NULL,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

const createDeliveryLogsTable = `
  CREATE TABLE IF NOT EXISTS delivery_logs (
    id            SERIAL    PRIMARY KEY,
    webhook_id    INTEGER   NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type    TEXT      NOT NULL,
    payload       JSONB     NOT NULL DEFAULT '{}',
    status_code   INTEGER,
    success       BOOLEAN   NOT NULL DEFAULT FALSE,
    response_body TEXT,
    attempted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

  await pool.query(createWebhooksTable);
  console.log('Table "webhooks" is ready.');

  await pool.query(createDeliveryLogsTable);
  console.log('Table "delivery_logs" is ready.');

  await pool.query(seedSQL);
  console.log("Seed data inserted (if table was empty).");

  console.log("Migration complete.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
