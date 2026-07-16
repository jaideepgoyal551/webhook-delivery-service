# webhook-delivery-service

> A reliable webhook delivery system with automatic retries, HMAC signature verification, and rate limiting — inspired by how Stripe and GitHub handle webhook infrastructure.

![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-in--development-yellow)

---

## 📖 Overview

`webhook-relay` lets any application register webhook endpoints and reliably deliver events to them — even when the receiving server is slow, down, or unreachable. It solves the same problem faced by companies like Stripe, GitHub, and Shopify: **how do you guarantee an event reaches a third-party server, even under network failures?**

### Core Features

- ✅ **Webhook Management** — Register, update, disable, and delete webhook endpoints per event type
- ✅ **Async Delivery via Queue** — Events are pushed to a background queue (BullMQ + Redis) instead of blocking the API
- ✅ **Automatic Retries with Exponential Backoff** — Failed deliveries retry at increasing intervals (1min → 5min → 30min → 2hr), then move to a dead-letter queue
- ✅ **HMAC-SHA256 Signature Verification** — Every payload is cryptographically signed so receivers can verify authenticity
- ✅ **Rate Limiting** — Redis-based sliding window limiter prevents any single webhook/tenant from overwhelming the system
- ✅ **Delivery Logs Dashboard** — Real-time visibility into every delivery attempt, status code, and retry count
- ✅ **JWT Authentication** — Webhooks are scoped per user account

---

## 🏗️ Architecture

```
                     ┌─────────────────┐
                     │  React Frontend  │
                     │   (Dashboard)    │
                     └────────┬─────────┘
                              │ REST API
                              ▼
                     ┌─────────────────┐
                     │  Express Backend │
                     │   (API Server)   │
                     └────────┬─────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
          ┌───────────┐ ┌───────────┐ ┌───────────┐
          │ PostgreSQL│ │   Redis   │ │  BullMQ   │
          │(Webhooks, │ │(Rate      │ │  Queue    │
          │ Logs)     │ │ Limiting) │ │           │
          └───────────┘ └───────────┘ └─────┬─────┘
                                             │
                                             ▼
                                     ┌───────────────┐
                                     │ Worker Process │
                                     │ (Delivery +    │
                                     │  Retry Logic)  │
                                     └───────┬────────┘
                                             │ HTTPS POST
                                             │ + HMAC Signature
                                             ▼
                                    ┌──────────────────┐
                                    │ Third-Party       │
                                    │ Webhook Endpoint   │
                                    └──────────────────┘
```

### Delivery Flow

1. Client calls `POST /events/trigger` with an event payload
2. API finds all active webhooks subscribed to that event type
3. One job per webhook is pushed to the BullMQ queue — API responds immediately
4. Worker process picks up jobs, signs the payload (HMAC-SHA256), and sends the HTTP request
5. On failure, BullMQ retries with exponential backoff (max 4 attempts)
6. After exhausting retries, the job moves to a dead-letter queue and is marked `permanently_failed`
7. Every attempt is logged to `delivery_logs` for the dashboard

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS, React Router |
| Backend API | Node.js, Express |
| Queue | BullMQ |
| Cache / Rate Limiter | Redis |
| Database | PostgreSQL |
| Auth | JWT |
| Deployment | Vercel (frontend), Render/Railway (backend + worker), Upstash (Redis) |
| Containerization | Docker, Docker Compose |

---

## 📂 Project Structure

```
webhook-relay/
├── frontend/                 # React dashboard
│   ├── src/
│   │   ├── components/       # WebhookTable, WebhookForm, StatusBadge
│   │   ├── pages/            # Webhooks, DeliveryLogs
│   │   └── api/               # API client functions
│   └── package.json
│
├── backend/                  # Express API server
│   ├── src/
│   │   ├── routes/            # webhooks.js, events.js, auth.js
│   │   ├── middleware/        # auth, rateLimiter, validation
│   │   ├── db/                 # migrations, schema
│   │   └── server.js
│   └── package.json
│
├── worker/                    # BullMQ background worker
│   ├── src/
│   │   ├── deliveryWorker.js  # processes queue jobs
│   │   ├── signPayload.js     # HMAC signing logic
│   │   └── worker.js
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6
- Docker & Docker Compose (optional, for full local stack)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/<your-username>/webhook-relay.git
cd webhook-relay

# Install dependencies for each service
cd frontend && npm install
cd ../backend && npm install
cd ../worker && npm install

# Copy environment variables
cp .env.example .env
# Fill in DATABASE_URL, REDIS_URL, JWT_SECRET, etc.

# Run database migrations
cd backend && npm run migrate

# Start services (in separate terminals)
cd backend && npm run dev      # API server
cd worker && npm run dev       # Queue worker
cd frontend && npm run dev     # React dashboard
```

### Using Docker Compose (all services at once)

```bash
docker-compose up --build
```

---

## 🔑 Environment Variables

```env
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/webhook_relay
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
PORT=3000

# Frontend
VITE_API_BASE_URL=http://localhost:3000
```

---

## 📡 API Reference

### Webhooks

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/webhooks` | Register a new webhook |
| `GET` | `/webhooks` | List all webhooks for the authenticated user |
| `PATCH` | `/webhooks/:id` | Enable/disable a webhook |
| `DELETE` | `/webhooks/:id` | Delete a webhook |

### Events

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/events/trigger` | Trigger an event, queues delivery to all subscribed webhooks |

### Delivery Logs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/delivery-logs` | List delivery attempts with status, retry count |
| `POST` | `/delivery-logs/:id/retry` | Manually retry a failed delivery |

---

## 🔐 Verifying Webhook Signatures (for receivers)

Every request includes an `X-Webhook-Signature` header, computed as `HMAC-SHA256(payload, webhook_secret)`.

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
```

---

## 🧠 Key Engineering Decisions

- **Why BullMQ over a custom queue?** Built-in retry/backoff, delayed jobs, and dead-letter queue support out of the box — avoids reinventing job-processing infrastructure.
- **Why Redis for rate limiting?** Sliding-window counters via sorted sets give accurate per-webhook throttling without the overhead of a SQL query per request.
- **Why separate worker process from API?** Keeps webhook delivery (slow, network-bound) from blocking the API's response time — the API only enqueues jobs.
- **Why HMAC over API keys for verification?** HMAC signatures prove payload integrity (nothing was tampered with in transit), not just sender identity.

---

## 🗺️ Roadmap

- [ ] Multi-channel notification support (email/SMS alongside webhooks)
- [ ] Per-tenant analytics dashboard
- [ ] Configurable retry policies per webhook
- [ ] Webhook payload transformation/filtering rules

---

