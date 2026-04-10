import { Card, CardContent } from "@/components/ui/card";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const stats = [
    { label: "Users", value: 120, icon: "👤", color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Sales", value: 350, icon: "💰", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Revenue", value: 900, icon: "📈", color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Visits", value: 1500, icon: "👁️", color: "text-orange-400", bg: "bg-orange-500/10" },
  ];

  // داتا جديدة للإضافات
  const recentActivity = [
    { id: 1, text: "New user registered", time: "2 min ago", type: "user" },
    { id: 2, text: "Payment received #5422", time: "1 hour ago", type: "money" },
    { id: 3, text: "Server maintenance", time: "3 hours ago", type: "system" },
  ];

  const topProducts = [
    { name: "Premium Plan", progress: 85 },
    { name: "Basic Plan", progress: 45 },
    { name: "Enterprise", progress: 20 },
  ];

  const chartData = [
    { name: "Jan", users: 30, sales: 45 },
    { name: "Feb", users: 50, sales: 60 },
    { name: "Mar", users: 80, sales: 75 },
    { name: "Apr", users: 60, sales: 55 },
    { name: "May", users: 90, sales: 85 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-slate-400">Welcome back, here is your business summary.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md p-6 hover:bg-white/10 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                <h2 className="text-2xl font-bold text-white mt-1">{stat.value.toLocaleString()}</h2>
              </div>
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts - Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart (Large) */}
        <Card className="lg:col-span-2 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md p-6">
           <h2 className="text-lg font-bold text-white mb-4">Monthly Growth</h2>
           <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }} />
                  <Bar dataKey="users" fill="#3b82f6" radius={[6, 6, 6, 6]} />
                  <Bar dataKey="sales" fill="#10b981" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </Card>

        {/* Top Products (New) */}
        <Card className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md p-6">
          <h2 className="text-lg font-bold text-white mb-6">Top Products</h2>
          <div className="space-y-6">
            {topProducts.map((p, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">{p.name}</span>
                  <span className="text-white font-bold">{p.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${p.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity (New Full Width Section) */}
      <Card className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md p-6">
        <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg">
                {activity.type === "user" ? "👤" : activity.type === "money" ? "💰" : "⚙️"}
              </div>
              <div>
                <p className="text-white font-medium">{activity.text}</p>
                <p className="text-slate-500 text-sm">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}