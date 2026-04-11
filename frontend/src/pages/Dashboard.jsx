import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import StatCard from "../components/StatCard";
import RecentOrders from "../components/RecentOrders";
import SalesChart from "../components/SalesChart";
import DonutChart from "../components/DonutChart";
import TodoList from "../components/TodoList";

const stats = [
  { label: "Total Revenue", value: "$48,295", change: "+12.5%", positive: true, icon: DollarSign, color: "bg-green-500" },
  { label: "Total Orders", value: "1,429", change: "+8.2%", positive: true, icon: ShoppingCart, color: "bg-blue-500" },
  { label: "Total Customers", value: "3,842", change: "+5.1%", positive: true, icon: Users, color: "bg-purple-500" },
  { label: "Growth Rate", value: "18.6%", change: "-2.4%", positive: false, icon: TrendingUp, color: "bg-orange-500" },
];

export default function Dashboard() {
  return (
    <div className="p-6 md:p-8 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, John 👋</p>
        </div>

        <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm shadow">
          Download Report
        </button>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SalesChart />
        </div>
        <DonutChart />
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentOrders />
        </div>
        <TodoList />
      </div>

    </div>
  );
}