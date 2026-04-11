import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  MessageCircle,
  Bell,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, path: "/", label: "Dashboard" },
  { icon: BarChart3, path: "/analytics", label: "Analytics" },
  { icon: MessageCircle, path: "/messages", label: "Messages" },
  { icon: Users, path: "/users", label: "Users" },
  { icon: Settings, path: "/settings", label: "Settings" },
  { icon: Bell, path: "/notifications", label: "Notifications" },
];

export default function Sidebar() {
  return (
    <aside className="
      fixed left-0 top-0 h-screen w-20
      bg-white border-r border-gray-100
      flex flex-col items-center py-6 gap-6
      shadow-sm z-50
    ">
      {/* Logo */}
      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
        <span className="text-white font-bold text-lg">D</span>
      </div>

      {/* Nav */}
      <div className="flex flex-col gap-4 mt-6">
        {navItems.map(({ icon: Icon, path, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) => `
              relative w-12 h-12 flex items-center justify-center
              rounded-xl transition-all duration-200 group
              ${isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"}
            `}
          >
            <Icon size={22} />

            {/* Active line */}
            <span className={`
              absolute left-0 top-1/2 -translate-y-1/2
              w-[3px] h-6 rounded-r bg-indigo-600
              opacity-0 group-[.active]:opacity-100
            `} />

            {/* Tooltip */}
            <span className="
              absolute left-14 bg-gray-800 text-white text-xs
              px-2 py-1 rounded-md opacity-0 group-hover:opacity-100
              transition-opacity whitespace-nowrap
            ">
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}