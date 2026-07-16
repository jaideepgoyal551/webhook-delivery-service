// Dummy hardcoded webhook data used as a placeholder until a real backend is connected.
// Each webhook object represents a registered endpoint that receives events.

const dummyWebhooks = [
  {
    id: 1,
    url: "https://api.example.com/webhooks/payments",
    eventType: "payment_intent.succeeded",
    status: "active",
    lastDelivery: "2026-07-15 14:32:10 UTC",
    secret: "whsec_abc123def456ghi789jkl",
  },
  {
    id: 2,
    url: "https://api.example.com/webhooks/orders",
    eventType: "checkout.session.completed",
    status: "active",
    lastDelivery: "2026-07-16 09:15:42 UTC",
    secret: "whsec_mno456pqr789stu012vwx",
  },
  {
    id: 3,
    url: "https://api.example.com/webhooks/customers",
    eventType: "customer.created",
    status: "disabled",
    lastDelivery: "2026-07-10 18:22:33 UTC",
    secret: "whsec_yza345bcd678efg901hij",
  },
  {
    id: 4,
    url: "https://api.example.com/webhooks/billing",
    eventType: "invoice.paid",
    status: "active",
    lastDelivery: "2026-07-16 11:05:18 UTC",
    secret: "whsec_klm234nop567qrs890tuv",
  },
  {
    id: 5,
    url: "https://api.example.com/webhooks/notifications",
    eventType: "notification.alert",
    status: "disabled",
    lastDelivery: "2026-07-08 06:44:59 UTC",
    secret: "whsec_wxy123zab456cde789fgh",
  },
];

// Available event types the user can choose from when adding a new webhook.
const availableEventTypes = [
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

export { dummyWebhooks, availableEventTypes };
