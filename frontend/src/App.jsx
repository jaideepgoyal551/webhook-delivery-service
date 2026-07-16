import { useState, useEffect, useCallback } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardPage from "./pages/DashboardPage";
import WebhooksListPage from "./pages/WebhooksListPage";
import DeliveryLogsPage from "./pages/DeliveryLogsPage";
import WebhookForm from "./components/WebhookForm";

const API_BASE = "https://webhook-delivery-service-r41e.onrender.com";

function mapWebhook(wh) {
  return {
    id: wh.id,
    url: wh.url,
    eventType: wh.eventType,
    status: wh.isActive ? "active" : "disabled",
    lastDelivery: wh.lastDelivery || "\u2014",
    secret: wh.secret,
  };
}

function mapLog(log) {
  return {
    id: log.id,
    timestamp: log.timestamp,
    webhookUrl: log.webhookUrl || "(deleted)",
    eventType: log.eventType,
    httpStatus: log.httpStatus,
    attempt: log.attempt || 1,
    result: log.result,
  };
}

export default function App() {
  const location = useLocation();
  const [webhooks, setWebhooks] = useState([]);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loadingWebhooks, setLoadingWebhooks] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    setLoadingWebhooks(true);
    fetch(`${API_BASE}/webhooks`)
      .then((r) => { if (!r.ok) throw new Error(`GET /webhooks failed (${r.status})`); return r.json(); })
      .then((data) => setWebhooks(data.map(mapWebhook)))
      .catch((err) => toast.error("Failed to load webhooks: " + err.message))
      .finally(() => setLoadingWebhooks(false));
  }, []);

  useEffect(() => {
    setLoadingLogs(true);
    fetch(`${API_BASE}/delivery-logs`)
      .then((r) => { if (!r.ok) throw new Error(`GET /delivery-logs failed (${r.status})`); return r.json(); })
      .then((data) => setDeliveryLogs(data.map(mapLog)))
      .catch((err) => toast.error("Failed to load logs: " + err.message))
      .finally(() => setLoadingLogs(false));
  }, []);

  const handleToggle = useCallback((id) => {
    setWebhooks((prev) => prev.map((wh) => ({ ...wh, status: wh.status === "active" ? "disabled" : "active" })));
    fetch(`${API_BASE}/webhooks/${id}`, { method: "PATCH" })
      .then((r) => { if (!r.ok) throw new Error(`PATCH failed (${r.status})`); return r.json(); })
      .then((data) => {
        setWebhooks((prev) => prev.map((wh) => (wh.id === id ? mapWebhook(data) : wh)));
        toast.success("Status toggled");
      })
      .catch((err) => {
        toast.error("Toggle failed: " + err.message);
        fetch(`${API_BASE}/webhooks`).then((r) => r.json()).then((data) => setWebhooks(data.map(mapWebhook)));
      });
  }, []);

  const handleDelete = useCallback((id) => {
    const prev = webhooks;
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id));
    fetch(`${API_BASE}/webhooks/${id}`, { method: "DELETE" })
      .then((r) => { if (!r.ok) throw new Error(`DELETE failed (${r.status})`); toast.success("Webhook deleted"); })
      .catch((err) => { toast.error("Delete failed: " + err.message); setWebhooks(prev); });
  }, [webhooks]);

  const handleAdd = useCallback((newWebhook, { setSubmitting }) => {
    fetch(`${API_BASE}/webhooks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newWebhook.url, eventType: newWebhook.eventType }),
    })
      .then((r) => { if (!r.ok) return r.json().then((e) => { throw new Error(e.details ? e.details.join("; ") : "POST failed"); }); return r.json(); })
      .then((data) => { setWebhooks((prev) => [mapWebhook(data), ...prev]); setShowForm(false); toast.success("Webhook created"); })
      .catch((err) => toast.error("Create failed: " + err.message))
      .finally(() => setSubmitting(false));
  }, []);

  const handleRetry = useCallback((logId) => {
    toast.success(`Retry requested for log #${logId}`);
    console.log("Retrying delivery for log entry", logId);
  }, []);

  const navLinks = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/webhooks", label: "Webhooks", end: false },
    { to: "/logs", label: "Delivery Logs", end: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
              <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <span className="text-base font-bold text-gray-900 tracking-tight">Webhook Dashboard</span>
          </div>
          <nav className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                    isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<DashboardPage webhooks={webhooks} deliveryLogs={deliveryLogs} loading={loadingWebhooks && loadingLogs} />} />
        <Route path="/webhooks" element={
          <WebhooksListPage webhooks={webhooks} loading={loadingWebhooks} onToggle={handleToggle} onDelete={handleDelete} onOpenForm={() => setShowForm(true)} />
        } />
        <Route path="/logs" element={<DeliveryLogsPage logs={deliveryLogs} onRetry={handleRetry} loading={loadingLogs} />} />
      </Routes>

      {showForm && <WebhookForm onSubmit={handleAdd} onClose={() => setShowForm(false)} />}
    </div>
  );
}
