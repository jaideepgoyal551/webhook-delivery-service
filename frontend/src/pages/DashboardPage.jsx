import StatCard from "../components/StatCard";
import { StatsCardSkeleton } from "../components/SkeletonLoader";

export default function DashboardPage({ webhooks, deliveryLogs, loading }) {
  const activeCount = webhooks.filter((w) => w.status === "active").length;
  const disabledCount = webhooks.filter((w) => w.status === "disabled").length;
  const successCount = deliveryLogs.filter((l) => l.result === "success").length;
  const failedCount = deliveryLogs.filter((l) => l.result === "failed").length;
  const retryingCount = deliveryLogs.filter((l) => l.result === "retrying").length;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-4 w-72 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <StatsCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your webhook endpoints and delivery performance.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Webhooks" value={activeCount} color="green" />
        <StatCard label="Disabled Webhooks" value={disabledCount} color="gray" />
        <StatCard label="Successful Deliveries" value={successCount} color="blue" />
        <StatCard label="Failed" value={failedCount} color="red" />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Delivery Success Rate</h3>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-gray-900">
            {deliveryLogs.length > 0
              ? `${Math.round((successCount / deliveryLogs.length) * 100)}%`
              : "\u2014"}
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
              style={{ width: deliveryLogs.length > 0 ? `${(successCount / deliveryLogs.length) * 100}%` : "0%" }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Retrying</h3>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-amber-600">{retryingCount}</p>
          <p className="mt-1 text-xs text-gray-400">Delivery attempts currently being retried.</p>
        </div>
      </div>
    </div>
  );
}
