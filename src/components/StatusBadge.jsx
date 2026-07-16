// Reusable badge component that displays a webhook's status.
// It accepts a `status` prop ("active" | "disabled") and renders
// the appropriate coloured pill.

export default function StatusBadge({ status }) {
  // Determine Tailwind classes based on the status value.
  // Active endpoints get a green badge, disabled ones get a gray badge.
  const styles = {
    active:
      "bg-green-100 text-green-800 ring-green-600/20",
    disabled:
      "bg-gray-100 text-gray-800 ring-gray-600/20",
  };

  const current = styles[status] || styles.disabled;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${current}`}
    >
      {status === "active" ? "Active" : "Disabled"}
    </span>
  );
}
