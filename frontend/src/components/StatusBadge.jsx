const config = {
  active:   { dot: "bg-green-500", bg: "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30" },
  disabled: { dot: "bg-gray-400", bg: "bg-gray-50 text-gray-600 ring-gray-500/20 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/30" },
  success:  { dot: "bg-green-500", bg: "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30" },
  failed:   { dot: "bg-red-500", bg: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30" },
  retrying: { dot: "bg-amber-400", bg: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30" },
};

const labels = {
  active: "Active", disabled: "Disabled", success: "Success", failed: "Failed", retrying: "Retrying",
};

export default function StatusBadge({ status }) {
  const c = config[status] || config.disabled;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${c.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {labels[status] || status}
    </span>
  );
}
