import DeliveryLogsTable from "../components/DeliveryLogsTable";

export default function DeliveryLogsPage({ logs, onRetry }) {
  const successCount = logs.filter((l) => l.result === "success").length;
  const failedCount = logs.filter((l) => l.result === "failed").length;
  const retryingCount = logs.filter((l) => l.result === "retrying").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Logs</h1>
          <p className="mt-1 text-sm text-gray-500">Recent delivery attempts for all webhook endpoints.</p>
        </div>
      </div>
      <div className="mb-6 flex gap-6 text-sm">
        <span className="text-green-700 font-medium">{successCount} succeeded</span>
        <span className="text-red-700 font-medium">{failedCount} failed</span>
        <span className="text-yellow-700 font-medium">{retryingCount} retrying</span>
        <span className="text-gray-500">{logs.length} total</span>
      </div>
      <DeliveryLogsTable logs={logs} onRetry={onRetry} />
    </div>
  );
}
