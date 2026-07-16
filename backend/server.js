// Webhook Backend Server
// ------------------------
// A Node.js + Express + PostgreSQL REST API for managing webhook endpoints.
//
// Endpoints:
//   POST   /webhooks          – Create a new webhook
//   GET    /webhooks          – List all webhooks
//   DELETE /webhooks/:id      – Delete a webhook
//   PATCH  /webhooks/:id      – Toggle is_active on a webhook
//
// Run:  node server.js

import express from "express";
import cors from "cors";
import pg from "pg";
import crypto from "node:crypto";
import "dotenv/config";

// ---------------------------------------------------------------------------
// Database setup
// ---------------------------------------------------------------------------

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the connection on startup so the user sees a clear error if Postgres
// is not reachable.
pool.query("SELECT 1").catch((err) => {
  console.error("ERROR: Could not connect to PostgreSQL.");
  console.error(err.message);
  process.exit(1);
});

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

// The only event types we accept (mirrors the front-end select options).
const VALID_EVENT_TYPES = [
  "payment_intent.succeeded",
  "payment_intent.failed",
  "checkout.session.completed",
  "customer.created",
  "customer.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "notification.alert",
  "subscription.created",
  "subscription.canceled",
];

// Very basic URL check – must start with http:// or https://.
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Generate a random signing secret.
function generateSecret() {
  return "whsec_" + crypto.randomBytes(24).toString("hex");
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// ----- POST /webhooks (create) --------------------------------------------

app.post("/webhooks", async (req, res) => {
  try {
    const { url, eventType } = req.body;

    // -- Validation --
    const errors = [];

    if (!url || typeof url !== "string" || !isValidUrl(url.trim())) {
      errors.push("url must be a valid HTTP or HTTPS URL.");
    }

    if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
      errors.push(
        `eventType must be one of: ${VALID_EVENT_TYPES.join(", ")}`
      );
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed.", details: errors });
    }

    // -- Insert --
    const secret = generateSecret();

    const result = await pool.query(
      `INSERT INTO webhooks (url, event_type, secret, is_active)
       VALUES ($1, $2, $3, TRUE)
       RETURNING id, url, event_type AS "eventType", secret, is_active AS "isActive", created_at AS "createdAt"`,
      [url.trim(), eventType, secret]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /webhooks error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ----- GET /webhooks (list) -----------------------------------------------

app.get("/webhooks", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id,
              url,
              event_type AS "eventType",
              secret,
              is_active  AS "isActive",
              created_at AS "createdAt"
       FROM webhooks
       ORDER BY created_at DESC`
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("GET /webhooks error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ----- DELETE /webhooks/:id -----------------------------------------------

app.delete("/webhooks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid id parameter." });
    }

    const result = await pool.query(
      "DELETE FROM webhooks WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Webhook not found." });
    }

    return res.json({ message: "Webhook deleted.", id });
  } catch (err) {
    console.error("DELETE /webhooks/:id error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ----- PATCH /webhooks/:id (toggle active) --------------------------------

app.patch("/webhooks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid id parameter." });
    }

    // Toggle the is_active boolean in one atomic query.
    const result = await pool.query(
      `UPDATE webhooks
       SET is_active = NOT is_active
       WHERE id = $1
       RETURNING id, url, event_type AS "eventType", secret, is_active AS "isActive", created_at AS "createdAt"`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Webhook not found." });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("PATCH /webhooks/:id error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ----- 404 catch-all ------------------------------------------------------

app.use((_req, res) => {
  return res.status(404).json({ error: "Route not found." });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Webhook API running on http://localhost:${PORT}`);
});
