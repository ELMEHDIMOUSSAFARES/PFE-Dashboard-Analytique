import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { useEffect, useState } from "react";

const COLORS = ["#22c55e", "#ef4444"];

export default function DonutChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8000/kpi/attendance-summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      const formatted = [
        {
          name: "Present",
          value: result.present,
        },
        {
          name: "Absent",
          value: result.absent,
        },
      ];

      setData(formatted);
    };

    fetchAttendance();
  }, []);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
      <div className="mb-6">
        <h2 className="font-semibold text-gray-800">Attendance Distribution</h2>

        <p className="text-sm text-gray-400">Present vs absent students</p>
      </div>

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

        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <p className="text-2xl font-bold text-gray-800">{total}</p>

          <span className="text-sm text-gray-400">Records</span>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: COLORS[index],
                }}
              />

              <span className="text-gray-600">{item.name}</span>
            </div>

            <span className="font-medium text-gray-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
