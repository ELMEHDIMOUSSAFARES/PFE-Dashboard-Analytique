import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function MainLayout({ children }) {
  const [dark, setDark] = useState(true);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`flex min-h-screen w-full transition-colors duration-500 ${
        dark ? "bg-[#09090b] text-white" : "bg-[#f4f4f5] text-slate-900"
      }`}
    >
      {/* Sidebar - Rje3tha w-64 (kbira chwiya) bash tqad l'icone w smya */}
      <aside
        className={`w-64 shrink-0 h-screen sticky top-0 flex flex-col py-8 transition-colors duration-500 border-r ${
          dark ? "bg-[#18181b] border-white/5" : "bg-white border-black/5"
        }`}
      >
        {/* L'Fou9: Logo */}
        <div className="w-full flex justify-center px-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <span className="text-2xl font-black text-white">D</span>
          </div>
        </div>

        {/* L'Wast: Les Nav Links (Mcentryin f lwast dyal l'ecran) */}
        <div className="flex-1 w-full px-6 flex flex-col justify-center">
          <ul className="space-y-4 w-full">
            
            {/* 🏠 Dashboard */}
            <li>
              <Link
                to="/"
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                  isActive("/")
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : `hover:bg-indigo-500/10 hover:translate-x-1 ${
                        dark ? "text-slate-400 hover:text-indigo-400" : "text-slate-500 hover:text-indigo-600"
                      }`
                }`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🏠</span>
                <span className="text-base font-semibold tracking-wider">Dashboard</span>
              </Link>
            </li>

            {/* 👤 Users */}
            <li>
              <Link
                to="/users"
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                  isActive("/users")
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : `hover:bg-indigo-500/10 hover:translate-x-1 ${
                        dark ? "text-slate-400 hover:text-indigo-400" : "text-slate-500 hover:text-indigo-600"
                      }`
                }`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">👤</span>
                <span className="text-base font-semibold tracking-wider">Users</span>
              </Link>
            </li>

            {/* 📊 Analytics */}
            <li>
              <Link
                to="/analytics"
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                  isActive("/analytics")
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : `hover:bg-indigo-500/10 hover:translate-x-1 ${
                        dark ? "text-slate-400 hover:text-indigo-400" : "text-slate-500 hover:text-indigo-600"
                      }`
                }`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
                <span className="text-base font-semibold tracking-wider">Analytics</span>
              </Link>
            </li>

          </ul>
        </div>

        {/* L'Te7t: Theme Toggle */}
        <div className="w-full px-6 mt-auto">
          <button
            onClick={() => setDark(!dark)}
            className={`flex items-center justify-center gap-3 w-full p-4 rounded-2xl transition-all duration-300 ${
              dark
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-800"
            }`}
          >
            <span className="text-2xl">{dark ? "☀️" : "🌙"}</span>
            <span className="text-sm font-bold tracking-wider">
              {dark ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 w-full overflow-auto">
        <div className="w-full p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}