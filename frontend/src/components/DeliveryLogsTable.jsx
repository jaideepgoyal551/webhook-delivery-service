import StatusBadge from "./StatusBadge";

export default function DeliveryLogsTable({ logs, onRetry }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Timestamp</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Webhook URL</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Event Type</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">HTTP Status</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Attempt</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Result</th>
            <th className="px-6 py-3 text-right font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">{log.timestamp}</td>
              <td className="px-6 py-4 max-w-xs truncate text-gray-700 font-mono text-xs">{log.webhookUrl}</td>
              <td className="px-6 py-4 text-gray-700">{log.eventType}</td>
              <td className="px-6 py-4">
                <span className={`font-mono text-sm font-medium ${
                  log.httpStatus >= 200 && log.httpStatus < 300 ? "text-green-700"
                    : log.httpStatus === 0 ? "text-gray-400" : "text-red-700"
                }`}>
                  {log.httpStatus || "\u2014"}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-700">{log.attempt}</td>
              <td className="px-6 py-4"><StatusBadge status={log.result} /></td>
              <td className="px-6 py-4 text-right">
                {log.result === "failed" && (
                  <button onClick={() => onRetry(log.id)}
                    className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors">
                    Retry Now
                  </button>
                )}
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No delivery logs yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
