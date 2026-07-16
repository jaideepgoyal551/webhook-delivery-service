import { useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import WebhooksListPage from "./pages/WebhooksListPage";
import WebhookForm from "./components/WebhookForm";
import { dummyWebhooks } from "./data/dummyData";

// Root application component.
// Holds the webhooks state (initialised with dummy data) and provides
// callbacks for toggling status, deleting, and adding webhooks.
export default function App() {
  // ----- State ----------------------------------------------------------
  // Webhooks list; starts with dummy data until a backend is connected.
  const [webhooks, setWebhooks] = useState(dummyWebhooks);

  // Controls whether the "Add Webhook" modal is visible.
  const [showForm, setShowForm] = useState(false);

  // ----- Callbacks ------------------------------------------------------

  // Toggle a webhook between active and disabled.
  const handleToggle = useCallback((id) => {
    setWebhooks((prev) =>
      prev.map((wh) =>
        wh.id === id
          ? { ...wh, status: wh.status === "active" ? "disabled" : "active" }
          : wh
      )
    );
  }, []);

  // Delete a webhook by id.
  const handleDelete = useCallback((id) => {
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id));
  }, []);

  // Add a new webhook from the form data.
  // A simple auto-increment id is derived from the current max id.
  const handleAdd = useCallback(
    (newWebhook) => {
      const maxId = webhooks.reduce((max, wh) => Math.max(max, wh.id), 0);
      setWebhooks((prev) => [...prev, { ...newWebhook, id: maxId + 1 }]);
      setShowForm(false);
    },
    [webhooks]
  );

  // ----- Render ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple top navigation bar */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            Webhook Dashboard
          </h1>
        </div>
      </header>

      {/* Route definitions – currently only one page but easily extensible */}
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
      </Routes>

      {/* Conditionally render the "Add Webhook" modal */}
      {showForm && (
        <WebhookForm
          onSubmit={handleAdd}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
