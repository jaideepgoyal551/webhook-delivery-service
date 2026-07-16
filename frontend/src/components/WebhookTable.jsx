import StatusBadge from "./StatusBadge";

export default function WebhookTable({ webhooks, onToggle, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">URL</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Event Type</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Last Delivery</th>
            <th className="px-6 py-3 text-right font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {webhooks.map((wh) => (
            <tr key={wh.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 max-w-xs truncate text-gray-700 font-mono text-xs">{wh.url}</td>
              <td className="px-6 py-4 text-gray-700">{wh.eventType}</td>
              <td className="px-6 py-4"><StatusBadge status={wh.status} /></td>
              <td className="px-6 py-4 text-gray-500 text-xs">{wh.lastDelivery}</td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <button
                  onClick={() => onToggle(wh.id)}
                  className={`mr-2 rounded px-3 py-1 text-xs font-medium transition-colors ${
                    wh.status === "active"
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  {wh.status === "active" ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => onDelete(wh.id)}
                  className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {webhooks.length === 0 && (
            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No webhooks configured yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
