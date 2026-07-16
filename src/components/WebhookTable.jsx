import StatusBadge from "./StatusBadge";

// Table component that renders a list of webhooks.
// Props:
//   webhooks   – array of webhook objects to display
//   onToggle   – callback fired when the toggle-status button is clicked
//   onDelete   – callback fired when the delete button is clicked
export default function WebhookTable({ webhooks, onToggle, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        {/* Table header */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">
              URL
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">
              Event Type
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">
              Status
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">
              Last Delivery
            </th>
            <th className="px-6 py-3 text-right font-semibold text-gray-900">
              Actions
            </th>
          </tr>
        </thead>

        {/* Table body – one row per webhook */}
        <tbody className="divide-y divide-gray-100 bg-white">
          {webhooks.map((wh) => (
            <tr key={wh.id} className="hover:bg-gray-50 transition-colors">
              {/* URL column – truncated with tooltip-like full value */}
              <td className="px-6 py-4 max-w-xs truncate text-gray-700 font-mono text-xs">
                {wh.url}
              </td>

              {/* Event type column */}
              <td className="px-6 py-4 text-gray-700">{wh.eventType}</td>

              {/* Status badge column */}
              <td className="px-6 py-4">
                <StatusBadge status={wh.status} />
              </td>

              {/* Last delivery timestamp */}
              <td className="px-6 py-4 text-gray-500 text-xs">
                {wh.lastDelivery}
              </td>

              {/* Action buttons */}
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

          {/* Show a message when there are no webhooks */}
          {webhooks.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-12 text-center text-gray-400"
              >
                No webhooks configured yet. Click "Add Webhook" to create one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
