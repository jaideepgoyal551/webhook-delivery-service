import { useState, useCallback } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import WebhooksListPage from "./pages/WebhooksListPage";
import DeliveryLogsPage from "./pages/DeliveryLogsPage";
import WebhookForm from "./components/WebhookForm";
import { dummyWebhooks, dummyDeliveryLogs } from "./data/dummyData";

export default function App() {
  const [webhooks, setWebhooks] = useState(dummyWebhooks);
  const [deliveryLogs] = useState(dummyDeliveryLogs);
  const [showForm, setShowForm] = useState(false);

  const handleToggle = useCallback((id) => {
    setWebhooks((prev) =>
      prev.map((wh) =>
        wh.id === id
          ? { ...wh, status: wh.status === "active" ? "disabled" : "active" }
          : wh
      )
    );
  }, []);

  const handleDelete = useCallback((id) => {
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id));
  }, []);

  const handleAdd = useCallback(
    (newWebhook) => {
      const maxId = webhooks.reduce((max, wh) => Math.max(max, wh.id), 0);
      setWebhooks((prev) => [...prev, { ...newWebhook, id: maxId + 1 }]);
      setShowForm(false);
    },
    [webhooks]
  );

  const handleRetry = useCallback((logId) => {
    console.log(`Retrying delivery for log entry ${logId}...`);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            Webhook Dashboard
          </h1>
          <nav className="flex gap-6 text-sm font-medium">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-900 pb-1"
              }
            >
              Webhooks
            </NavLink>
            <NavLink
              to="/logs"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-900 pb-1"
              }
            >
              Delivery Logs
            </NavLink>
          </nav>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <WebhooksListPage
              webhooks={webhooks}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onOpenForm={() => setShowForm(true)}
            />
          }
        />
        <Route
          path="/logs"
          element={
            <DeliveryLogsPage logs={deliveryLogs} onRetry={handleRetry} />
          }
        />
      </Routes>

      {showForm && (
        <WebhookForm
          onSubmit={handleAdd}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
