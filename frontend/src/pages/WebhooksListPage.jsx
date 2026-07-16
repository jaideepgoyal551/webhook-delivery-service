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
    <div className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Webhook Endpoints</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage endpoints that receive events from your account.</p>
        </div>
        <button onClick={onOpenForm}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Webhook
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by URL or event type..."
            className="w-64 rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-3.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
          />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">{webhooks.filter((w) => w.status === "active").length}</strong> active
          </span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-gray-500 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">{webhooks.filter((w) => w.status === "disabled").length}</strong> disabled
          </span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-gray-500 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">{webhooks.length}</strong> total
          </span>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : filtered.length > 0 ? (
        <WebhookTable webhooks={filtered} onToggle={onToggle} onDelete={onDelete} />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {search ? (
            <>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200">No results found</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try a different search term.</p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <svg className="h-7 w-7 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200">No webhooks configured</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding your first webhook endpoint.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
