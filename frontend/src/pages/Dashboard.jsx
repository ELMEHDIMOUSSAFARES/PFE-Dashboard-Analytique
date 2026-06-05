import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import StatCard from "../components/StatCard";
import RecentOrders from "../components/RecentOrders";
import RevenueChart from "../components/RevenueChart";
import DonutChart from "../components/DonutChart";
import { useEffect, useState } from "react";
import DashStats from "../components/DashStats";

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
      <DashStats />
      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>
        <DonutChart />
      </div>
      {/* Bottom */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
