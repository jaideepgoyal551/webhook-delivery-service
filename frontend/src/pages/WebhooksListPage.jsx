import WebhookTable from "../components/WebhookTable";

export default function WebhooksListPage({ webhooks, loading, onToggle, onDelete, onOpenForm }) {
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

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <WebhookTable webhooks={webhooks} onToggle={onToggle} onDelete={onDelete} />
      )}
    </div>
  );
}
