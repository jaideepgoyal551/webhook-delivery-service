// Reusable badge component that displays a status.
// Accepts a `status` prop and optional `variant` to control colour mapping.
//   variant "webhook" (default): "active" / "disabled"
//   variant "delivery":         "success" / "failed" / "retrying"

const colourMap = {
  // Webhook endpoint statuses
  active:    "bg-green-100 text-green-800 ring-green-600/20",
  disabled:  "bg-gray-100 text-gray-800 ring-gray-600/20",
  // Delivery attempt results
  success:   "bg-green-100 text-green-800 ring-green-600/20",
  failed:    "bg-red-100 text-red-700 ring-red-600/20",
  retrying:  "bg-yellow-100 text-yellow-800 ring-yellow-600/20",
};

export default function StatusBadge({ status }) {
  const classes = colourMap[status] || colourMap.disabled;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}
    >
      {status === "active"
        ? "Active"
        : status === "disabled"
        ? "Disabled"
        : status === "success"
        ? "Success"
        : status === "failed"
        ? "Failed"
        : status === "retrying"
        ? "Retrying"
        : status}
    </span>
  );
}
