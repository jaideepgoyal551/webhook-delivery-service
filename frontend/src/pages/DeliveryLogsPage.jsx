import DeliveryLogsTable from "../components/DeliveryLogsTable";
import { TableSkeleton } from "../components/SkeletonLoader";

export default function DeliveryLogsPage({ logs, onRetry, loading }) {
  const successCount = logs.filter((l) => l.result === "success").length;
  const failedCount = logs.filter((l) => l.result === "failed").length;
  const retryingCount = logs.filter((l) => l.result === "retrying").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Logs</h1>
        <p className="mt-1 text-sm text-gray-500">Recent delivery attempts for all webhook endpoints.</p>
      </div>

      {/* Stats chips */}
      <div className="mb-6 flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          {successCount} succeeded
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          {failedCount} failed
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          {retryingCount} retrying
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/20">
          {logs.length} total
        </span>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : (
        <DeliveryLogsTable logs={logs} onRetry={onRetry} />
      )}
    </div>
  );
}
