import { Bell, Search, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const notifications = 3; // 🔔 عدد الإشعارات (تقدر تبدلو)

  return (
    <header className="
      h-20 px-8 bg-white border-b border-gray-100
      flex items-center justify-between sticky top-0 z-40
    ">

      {/* LEFT - Search */}
      <div className="flex items-center gap-3
                      bg-gray-50 rounded-xl px-4 py-2.5 w-80">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm text-gray-600
                     outline-none w-full placeholder-gray-400"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* 🔔 Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-10 h-10 rounded-xl bg-gray-50
                     flex items-center justify-center
                     hover:bg-gray-100 transition-all"
        >
          <Bell size={18} className="text-gray-600" />

          {/* Badge */}
          {notifications > 0 && (
            <span className="
              absolute -top-1 -right-1
              bg-red-500 text-white text-[10px]
              w-5 h-5 flex items-center justify-center
              rounded-full font-semibold
            ">
              {notifications}
            </span>
          )}
        </button>

        {/* USER */}
        <div className="flex items-center gap-3
                        hover:bg-gray-50 rounded-xl px-3 py-2
                        transition-all cursor-pointer">

          <img
            src="https://i.pravatar.cc/40"
            alt="User"
            className="w-9 h-9 rounded-xl object-cover"
          />

          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">John Doe</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>

          <ChevronDown size={16} className="text-gray-400" />
        </div>

      </div>
    </header>
  );
}