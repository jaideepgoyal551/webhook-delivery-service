import StatusBadge from "./StatusBadge";

export default function DeliveryLogsTable({ logs, onRetry }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead>
          <tr className="bg-gray-50/80">
            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Timestamp</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Webhook URL</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Event Type</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">HTTP Status</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Attempt</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Result</th>
            <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.map((log) => (
            <tr key={log.id} className="transition-colors hover:bg-gray-50/50">
              <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-500">{log.timestamp}</td>
              <td className="max-w-[200px] truncate px-6 py-4 font-mono text-xs text-gray-700">{log.webhookUrl}</td>
              <td className="px-6 py-4">
                <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{log.eventType}</code>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 font-mono text-xs font-bold ${
                  log.httpStatus >= 200 && log.httpStatus < 300 ? "bg-green-50 text-green-700"
                    : log.httpStatus === 0 ? "bg-gray-100 text-gray-500" : "bg-red-50 text-red-700"
                }`}>
                  {log.httpStatus || "\u2014"}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-700">{log.attempt}</td>
              <td className="px-6 py-4"><StatusBadge status={log.result} /></td>
              <td className="px-6 py-4 text-right">
                {log.result === "failed" && (
                  <button
                    onClick={() => onRetry(log.id)}
                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-all hover:bg-blue-100"
                  >
                    Retry Now
                  </button>
                )}
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-16 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p className="text-sm font-medium text-gray-900">No delivery logs yet</p>
                <p className="mt-1 text-sm text-gray-500">Logs appear after you trigger an event.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
