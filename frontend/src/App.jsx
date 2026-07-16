import { useState, useEffect, useCallback } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import WebhooksListPage from "./pages/WebhooksListPage";
import DeliveryLogsPage from "./pages/DeliveryLogsPage";
import WebhookForm from "./components/WebhookForm";
import { dummyDeliveryLogs } from "./data/dummyData";

const API_BASE = "http://localhost:3000";

// Map backend snake_case fields to frontend camelCase + derived fields.
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

export default function App() {
  const [webhooks, setWebhooks] = useState([]);
  const [deliveryLogs] = useState(dummyDeliveryLogs);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // ---- Fetch webhooks on mount --------------------------------------------
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/webhooks`)
      .then((r) => {
        if (!r.ok) throw new Error(`GET /webhooks failed (${r.status})`);
        return r.json();
      })
      .then((data) => {
        setWebhooks(data.map(mapWebhook));
        toast.success("Webhooks loaded");
      })
      .catch((err) => {
        toast.error("Failed to load webhooks: " + err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // ---- Toggle (PATCH) -----------------------------------------------------
  const handleToggle = useCallback((id) => {
    setWebhooks((prev) =>
      prev.map((wh) => ({ ...wh, status: wh.status === "active" ? "disabled" : "active" }))
    );

    fetch(`${API_BASE}/webhooks/${id}`, { method: "PATCH" })
      .then((r) => {
        if (!r.ok) throw new Error(`PATCH failed (${r.status})`);
        return r.json();
      })
      .then((data) => {
        setWebhooks((prev) =>
          prev.map((wh) => (wh.id === id ? mapWebhook(data) : wh))
        );
        toast.success("Webhook toggled");
      })
      .catch((err) => {
        toast.error("Toggle failed: " + err.message);
        // Revert optimistic update by re-fetching
        fetch(`${API_BASE}/webhooks`)
          .then((r) => r.json())
          .then((data) => setWebhooks(data.map(mapWebhook)));
      });
  }, []);

  // ---- Delete (DELETE) ----------------------------------------------------
  const handleDelete = useCallback((id) => {
    const prev = webhooks;
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id));

    fetch(`${API_BASE}/webhooks/${id}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) throw new Error(`DELETE failed (${r.status})`);
        toast.success("Webhook deleted");
      })
      .catch((err) => {
        toast.error("Delete failed: " + err.message);
        setWebhooks(prev);
      });
  }, [webhooks]);

  // ---- Add (POST) ---------------------------------------------------------
  const handleAdd = useCallback((newWebhook, { setSubmitting }) => {
    fetch(`${API_BASE}/webhooks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: newWebhook.url,
        eventType: newWebhook.eventType,
      }),
    })
      .then((r) => {
        if (!r.ok) {
          return r.json().then((err) => {
            throw new Error(err.details ? err.details.join("; ") : "POST failed");
          });
        }
        return r.json();
      })
      .then((data) => {
        setWebhooks((prev) => [mapWebhook(data), ...prev]);
        setShowForm(false);
        toast.success("Webhook created");
      })
      .catch((err) => {
        toast.error("Create failed: " + err.message);
      })
      .finally(() => setSubmitting(false));
  }, []);

  const handleRetry = useCallback((logId) => {
    console.log("Retrying delivery for log entry", logId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            Webhook Dashboard
          </h1>
          <nav className="flex gap-6 text-sm font-medium">
            <NavLink to="/" end className={({ isActive }) =>
              isActive ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-600 hover:text-gray-900 pb-1"
            }>
              Webhooks
            </NavLink>
            <NavLink to="/logs" className={({ isActive }) =>
              isActive ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-600 hover:text-gray-900 pb-1"
            }>
              Delivery Logs
            </NavLink>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={
          <WebhooksListPage
            webhooks={webhooks}
            loading={loading}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onOpenForm={() => setShowForm(true)}
          />
        } />
        <Route path="/logs" element={
          <DeliveryLogsPage logs={deliveryLogs} onRetry={handleRetry} />
        } />
      </Routes>

      {showForm && (
        <WebhookForm onSubmit={handleAdd} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
