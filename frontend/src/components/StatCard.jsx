export default function StatCard({ label, value, color = "blue" }) {
  const colorMap = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    red: "from-red-500 to-red-600",
    yellow: "from-amber-500 to-amber-600",
    gray: "from-gray-500 to-gray-600",
  };
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className={`absolute inset-0 opacity-[0.03] bg-gradient-to-br ${colorMap[color] || colorMap.blue}`} />
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1.5 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
    </div>
  );
}
