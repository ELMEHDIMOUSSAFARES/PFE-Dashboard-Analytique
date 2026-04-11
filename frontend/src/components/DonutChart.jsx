import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Desktop", value: 55 },
  { name: "Mobile", value: 30 },
  { name: "Tablet", value: 15 },
];

const COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

export default function DonutChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">

      {/* Header */}
      <div className="mb-6">
        <h2 className="font-semibold text-gray-800">Traffic Sources</h2>
        <p className="text-sm text-gray-400">Visitors by device</p>
      </div>

      {/* Chart */}
      <div className="relative w-full h-60">

        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <p className="text-2xl font-bold text-gray-800">100%</p>
          <span className="text-sm text-gray-400">Total</span>
        </div>

      </div>

      {/* Legend */}
      <div className="mt-6 space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-gray-600">{item.name}</span>
            </div>

            <span className="font-medium text-gray-800">
              {item.value}%
            </span>

          </div>
        ))}
      </div>

    </div>
  );
}