import { useState, useMemo } from "react";
import WebhookTable from "../components/WebhookTable";
import { TableSkeleton } from "../components/SkeletonLoader";

export default function WebhooksListPage({ webhooks, loading, onToggle, onDelete, onOpenForm }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return webhooks;
    const q = search.toLowerCase();
    return webhooks.filter(
      (w) => w.url.toLowerCase().includes(q) || w.eventType.toLowerCase().includes(q)
    );
  }, [webhooks, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhook Endpoints</h1>
          <p className="mt-1 text-sm text-gray-500">Manage endpoints that receive events from your account.</p>
        </div>
        <button onClick={onOpenForm}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Webhook
        </button>
      </div>

      {/* Search + Stats */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by URL or event type..."
            className="w-64 rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">
            <strong className="text-gray-900">{webhooks.filter((w) => w.status === "active").length}</strong> active
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            <strong className="text-gray-900">{webhooks.filter((w) => w.status === "disabled").length}</strong> disabled
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            <strong className="text-gray-900">{webhooks.length}</strong> total
          </span>
        </div>
      </div>

      {/* Table / Loading / Empty */}
      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : filtered.length > 0 ? (
        <WebhookTable webhooks={filtered} onToggle={onToggle} onDelete={onDelete} />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-16 text-center shadow-sm">
          {search ? (
            <>
              <p className="text-sm font-medium text-gray-900">No results found</p>
              <p className="mt-1 text-sm text-gray-500">Try a different search term.</p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <p className="text-sm font-medium text-gray-900">No webhooks configured</p>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first webhook endpoint.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
