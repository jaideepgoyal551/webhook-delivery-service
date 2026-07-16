// Shared BullMQ queue used by both the API server (producer) and the worker.
import { Queue } from "bullmq";
import IORedis from "ioredis";
import "dotenv/config";

// `rediss://` enables TLS automatically for Upstash.
// `enableOfflineQueue: false` avoids issues with serverless Redis providers.
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: false,
});

export const webhookQueue = new Queue("webhook-delivery", { connection });

export { connection as redisConnection };
