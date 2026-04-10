import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, ShoppingCart, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

const data = [
  { name: "Jan", users: 30, sales: 50 },
  { name: "Feb", users: 60, sales: 80 },
  { name: "Mar", users: 90, sales: 120 },
  { name: "Apr", users: 70, sales: 100 },
  { name: "May", users: 120, sales: 150 },
];

const stats = [
  { label: "Total Users", value: "370", change: "+12%", icon: Users, trend: "up" },
  { label: "Total Sales", value: "500", change: "+8%", icon: ShoppingCart, trend: "up" },
  { label: "Avg. Conversion", value: "24%", change: "-2%", icon: TrendingUp, trend: "down" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl p-4 backdrop-blur-sm text-sm">
        <p className="font-medium text-white mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" /> {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-6 py-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400 capitalize">{entry.name}</span>
            </div>
            <span className="font-semibold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  return (
   <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Analytics Overview</h1>
        <p className="text-slate-400 mt-1">Track performance metrics and growth trends.</p>
      </motion.div>

      {/* Stats Cards - Glass Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md p-6 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                <div className={`p-2 rounded-xl ${stat.trend === "up" ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                  {stat.trend === "up" ? <ArrowUpRight className="w-5 h-5 text-emerald-400" /> : <ArrowDownRight className="w-5 h-5 text-rose-400" />}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              <p className={`text-xs mt-2 font-bold ${stat.trend === "up" ? "text-emerald-400" : "text-rose-400"}`}>
                {stat.change} <span className="text-slate-500 font-normal">from last month</span>
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart Card - Glass Style */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
        <Card className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-white">Users & Sales Trend</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-400"><div className="w-3 h-3 rounded-full bg-blue-500" /> Users</div>
              <div className="flex items-center gap-2 text-slate-400"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Sales</div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 2 }} />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}