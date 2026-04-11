export default function StatCard({
  label,
  value,
  change,
  positive,
  icon: Icon,
  color,
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 
                    hover:shadow-lg transition-all duration-300 hover:-translate-y-1">

      {/* Top */}
      <div className="flex items-center justify-between mb-4">
        
        <span className="text-sm text-gray-500 font-medium">
          {label}
        </span>

        <div className={`w-11 h-11 ${color} bg-opacity-10 
                        rounded-xl flex items-center justify-center`}>
          <Icon size={22} className={color.replace("bg-", "text-")} />
        </div>

      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-800 tracking-tight">
        {value}
      </p>

      {/* Change */}
      <div className="flex items-center gap-1 mt-2 text-sm font-medium">
        
        <span className={positive ? "text-green-500" : "text-red-500"}>
          {positive ? "▲" : "▼"} {change}
        </span>

        <span className="text-gray-400 text-xs">
          vs last month
        </span>

      </div>

    </div>
  );
}