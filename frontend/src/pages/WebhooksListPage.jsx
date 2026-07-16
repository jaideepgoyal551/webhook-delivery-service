import WebhookTable from "../components/WebhookTable";

export default function WebhooksListPage({ webhooks, onToggle, onDelete, onOpenForm }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhook Endpoints</h1>
          <p className="mt-1 text-sm text-gray-500">Manage endpoints that receive events from your account.</p>
        </div>
        <button onClick={onOpenForm}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
          + Add Webhook
        </button>
      </div>
      <div className="mb-4 text-sm text-gray-500">
        {webhooks.filter((w) => w.status === "active").length} active &middot; {webhooks.filter((w) => w.status === "disabled").length} disabled
      </div>
      <WebhookTable webhooks={webhooks} onToggle={onToggle} onDelete={onDelete} />
    </div>
  );
}
