import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 4800 },
  { month: "May", sales: 7000 },
  { month: "Jun", sales: 6500 },
  { month: "Jul", sales: 8000 },
];

export default function SalesChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-semibold text-gray-800">Sales Overview</h2>
          <p className="text-sm text-gray-400">Last 7 months</p>
        </div>

        <span className="text-green-500 text-sm font-medium">
          +12.5%
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          />

          <Area
            type="monotone"
            dataKey="sales"
            stroke="#6366f1"
            strokeWidth={3}
            fill="url(#salesGrad)"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />

        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}