// BullMQ worker – runs as a separate process to deliver webhooks.
//
// Reads jobs from the "webhook-delivery" queue, makes the HTTP POST to
// the target URL, and writes the result into delivery_logs.
//
// Run:  node worker.js

import { Worker } from "bullmq";
import IORedis from "ioredis";
import pg from "pg";
import axios from "axios";
import "dotenv/config";

// ---------------------------------------------------------------------------
// Database pool
// ---------------------------------------------------------------------------

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query("SELECT 1").catch((err) => {
  console.error("Worker: could not connect to PostgreSQL.", err.message);
  process.exit(1);
});

// ---------------------------------------------------------------------------
// Redis connection (must match queue.js)
// ---------------------------------------------------------------------------

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: false,
});

// ---------------------------------------------------------------------------
// Worker
// ---------------------------------------------------------------------------

const worker = new Worker(
  "webhook-delivery",
  async (job) => {
    const { webhookId, url, secret, eventType, payload } = job.data;

    console.log(`Worker: delivering to ${url} (webhook #${webhookId})`);

    let statusCode = null;
    let responseBody = null;
    let success = false;

    try {
      const axiosResp = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": secret,
          "X-Event-Type": eventType,
        },
        timeout: 5000,
        validateStatus: () => true,
      });

      statusCode = axiosResp.status;
      responseBody =
        typeof axiosResp.data === "string"
          ? axiosResp.data.substring(0, 2000)
          : JSON.stringify(axiosResp.data).substring(0, 2000);
      success = statusCode >= 200 && statusCode < 300;
    } catch (err) {
      statusCode = err.code === "ECONNABORTED" ? 0 : 0;
      responseBody = err.message.substring(0, 2000);
      success = false;
    }

    // Write to delivery_logs
    await pool.query(
      `INSERT INTO delivery_logs (webhook_id, event_type, payload, status_code, success, response_body)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [webhookId, eventType, JSON.stringify(payload), statusCode, success, responseBody]
    );

    console.log(`Worker: ${success ? "OK" : "FAIL"} -> ${url} (${statusCode})`);
  },
  { connection, concurrency: 5 }
);

worker.on("completed", (job) => {
  console.log(`Worker: job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Worker: job ${job.id} failed:`, err.message);
});

console.log("Worker started. Waiting for jobs...");
