export default function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 
                    hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Top */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500 font-medium">{label}</span>

        <div
          className={`w-11 h-11 ${color} bg-opacity-10 
                        rounded-xl flex items-center justify-center`}
        >
          {typeof Icon === "string" ? (
            <img src={Icon} alt="icon" className="w-5 h-5" />
          ) : (
            <Icon size={22} className={color.replace("bg-", "text-")} />
          )}{" "}
        </div>
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-800 tracking-tight">{value}</p>
    </div>
  );
}
