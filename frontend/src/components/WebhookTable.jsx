import { useState } from "react";
import StatusBadge from "./StatusBadge";
import toast from "react-hot-toast";

export default function WebhookTable({ webhooks, onToggle, onDelete }) {
  const [copiedId, setCopiedId] = useState(null);

  const copyUrl = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 animate-slide-up">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-800">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-gray-800/50">
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">URL</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Event Type</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Last Delivery</th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {webhooks.map((wh) => (
              <tr key={wh.id} className="group transition-all duration-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="max-w-[240px] truncate font-mono text-xs text-gray-700 dark:text-gray-300">{wh.url}</span>
                    <button
                      onClick={() => copyUrl(wh.id, wh.url)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-400 opacity-0 transition-all hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      title="Copy URL"
                    >
                      {copiedId === wh.id ? (
                        <svg className="h-3.5 w-3.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <code className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">{wh.eventType}</code>
                </td>
                <td className="px-6 py-4"><StatusBadge status={wh.status} /></td>
                <td className="px-6 py-4 text-xs text-gray-400 dark:text-gray-500">{wh.lastDelivery}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onToggle(wh.id)}
                    className={`mr-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 ${
                      wh.status === "active"
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                        : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                    }`}
                  >
                    {wh.status === "active" ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => onDelete(wh.id)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-all duration-200 hover:bg-red-100 hover:scale-105 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {webhooks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <svg className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">No webhooks configured</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Click "Add Webhook" to create your first endpoint.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
