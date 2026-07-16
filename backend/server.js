// Webhook Backend Server
// ------------------------
// A Node.js + Express + PostgreSQL REST API for managing webhook endpoints
// and triggering event deliveries.
//
// Endpoints:
//   POST   /webhooks              – Create a new webhook
//   GET    /webhooks              – List all webhooks
//   DELETE /webhooks/:id          – Delete a webhook
//   PATCH  /webhooks/:id          – Toggle is_active on a webhook
//   POST   /events/trigger        – Trigger an event to all subscribed webhooks
//   GET    /delivery-logs         – List delivery log entries
//   POST   /__test/receiver       – Local test endpoint (echoes back the payload)
//
// Run:  node server.js

import express from "express";
import cors from "cors";
import pg from "pg";
import crypto from "node:crypto";
import "dotenv/config";
import { webhookQueue } from "./queue.js";

// ---------------------------------------------------------------------------
// Database setup
// ---------------------------------------------------------------------------

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query("SELECT 1").catch((err) => {
  console.error("ERROR: Could not connect to PostgreSQL.");
  console.error(err.message);
  process.exit(1);
});

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

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

function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function generateSecret() {
  return "whsec_" + crypto.randomBytes(24).toString("hex");
}

// ---------------------------------------------------------------------------
// Webhook CRUD routes
// ---------------------------------------------------------------------------

app.post("/webhooks", async (req, res) => {
  try {
    const { url, eventType } = req.body;
    const errors = [];

    if (!url || typeof url !== "string" || !isValidUrl(url.trim())) {
      errors.push("url must be a valid HTTP or HTTPS URL.");
    }
    if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
      errors.push(`eventType must be one of: ${VALID_EVENT_TYPES.join(", ")}`);
    }
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed.", details: errors });
    }

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

app.get("/webhooks", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, url, event_type AS "eventType", secret, is_active AS "isActive", created_at AS "createdAt"
       FROM webhooks ORDER BY created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("GET /webhooks error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.delete("/webhooks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id parameter." });

    const result = await pool.query("DELETE FROM webhooks WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Webhook not found." });

    return res.json({ message: "Webhook deleted.", id });
  } catch (err) {
    console.error("DELETE /webhooks/:id error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.patch("/webhooks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id parameter." });

    const result = await pool.query(
      `UPDATE webhooks SET is_active = NOT is_active
       WHERE id = $1
       RETURNING id, url, event_type AS "eventType", secret, is_active AS "isActive", created_at AS "createdAt"`,
      [id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Webhook not found." });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("PATCH /webhooks/:id error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ---------------------------------------------------------------------------
// Delivery logs
// ---------------------------------------------------------------------------

app.get("/delivery-logs", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT dl.id,
              dl.webhook_id   AS "webhookId",
              w.url           AS "webhookUrl",
              dl.event_type   AS "eventType",
              dl.status_code  AS "httpStatus",
              dl.success,
              dl.response_body AS "responseBody",
              dl.attempted_at AS "attemptedAt"
       FROM delivery_logs dl
       LEFT JOIN webhooks w ON w.id = dl.webhook_id
       ORDER BY dl.attempted_at DESC
       LIMIT 100`
    );

    // Map to the shape the frontend DeliveryLogsTable expects.
    const mapped = result.rows.map((r) => ({
      id: r.id,
      timestamp: r.attemptedAt,
      webhookUrl: r.webhookUrl || "(deleted)",
      eventType: r.eventType,
      httpStatus: r.httpStatus,
      attempt: 1, // simplified; real system would track attempt number
      result: r.success ? "success" : r.httpStatus === null ? "retrying" : "failed",
    }));

    return res.json(mapped);
  } catch (err) {
    console.error("GET /delivery-logs error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ---------------------------------------------------------------------------
// Event trigger (async via BullMQ)
// ---------------------------------------------------------------------------
//
// Validates the request, finds subscribed webhooks, pushes one job per
// webhook to the "webhook-delivery" queue, and returns immediately.
// The actual HTTP delivery happens in the worker process (worker.js).

app.post("/events/trigger", async (req, res) => {
  try {
    const { event_type, payload } = req.body;

    // -- Validate --
    if (!event_type || !VALID_EVENT_TYPES.includes(event_type)) {
      return res.status(400).json({
        error: "Validation failed.",
        details: [`event_type must be one of: ${VALID_EVENT_TYPES.join(", ")}`],
      });
    }
    if (payload === undefined || payload === null) {
      return res.status(400).json({
        error: "Validation failed.",
        details: ["payload is required."],
      });
    }

    // -- Fetch matching active webhooks --
    const { rows: webhooks } = await pool.query(
      `SELECT id, url, secret FROM webhooks
       WHERE event_type = $1 AND is_active = TRUE`,
      [event_type]
    );

    if (webhooks.length === 0) {
      return res.json({
        message: "No active webhooks found for this event type.",
        queued: 0,
      });
    }

    // -- Push one job per webhook to the queue --
    const jobs = webhooks.map((wh) => ({
      name: `deliver-${wh.id}`,
      data: {
        webhookId: wh.id,
        url: wh.url,
        secret: wh.secret,
        eventType: event_type,
        payload,
      },
    }));

    await webhookQueue.addBulk(jobs);

    console.log(`Trigger: queued ${jobs.length} job(s) for "${event_type}"`);

    return res.json({
      message: `${jobs.length} job(s) queued for delivery.`,
      queued: jobs.length,
    });
  } catch (err) {
    console.error("POST /events/trigger error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ---------------------------------------------------------------------------
// Local test receiver
// ---------------------------------------------------------------------------
// A simple echo endpoint for end-to-end testing without an external service.
// Create a webhook pointing to http://localhost:3000/__test/receiver, then
// trigger an event – you will see the delivery logged in delivery_logs.

app.post("/__test/receiver", (req, res) => {
  console.log("Test receiver got:", JSON.stringify(req.body, null, 2));
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  return res.json({ received: true, yourPayload: req.body });
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get("/health", (_req, res) => {
  return res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// 404 catch-all
// ---------------------------------------------------------------------------

app.use((_req, res) => {
  return res.status(404).json({ error: "Route not found." });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Webhook API running on http://localhost:${PORT}`);
});
