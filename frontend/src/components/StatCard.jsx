const colorMap = {
  blue: "from-blue-500 to-blue-600",
  green: "from-emerald-500 to-emerald-600",
  red: "from-red-500 to-red-600",
  yellow: "from-amber-500 to-amber-600",
  gray: "from-gray-500 to-gray-600",
};

export default function StatCard({ label, value, color = "blue" }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-gray-900/50 animate-slide-up">
      <div className={`absolute inset-0 opacity-[0.03] bg-gradient-to-br ${colorMap[color] || colorMap.blue} dark:opacity-[0.06]`} />
      <p className="relative text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`relative mt-1.5 text-3xl font-bold tracking-tight ${
        color === "red" ? "text-red-600 dark:text-red-400"
          : color === "green" ? "text-emerald-600 dark:text-emerald-400"
          : color === "yellow" ? "text-amber-600 dark:text-amber-400"
          : "text-gray-900 dark:text-white"
      }`}>
        {value}
      </p>
    </div>
  );
}
