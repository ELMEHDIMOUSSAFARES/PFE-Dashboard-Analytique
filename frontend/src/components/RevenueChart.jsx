import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useEffect, useState } from "react";

export default function RevenueChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchRevenue = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8000/kpi/revenue/monthly", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      const formatted = result.map((item) => ({
        month: new Date(item.month).toLocaleString("default", {
          month: "short",
        }),
        revenue: item.revenue,
      }));

      setData(formatted);
    };

    fetchRevenue();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
      <div className="mb-6">
        <h2 className="font-semibold text-gray-800">Monthly Revenue</h2>

        <p className="text-sm text-gray-400">Payments evolution</p>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueGrad">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            fill="url(#revenueGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
