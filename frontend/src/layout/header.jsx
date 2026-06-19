import { House, ChevronDown, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import userIcon from "@/assets/user_icon.svg";
import adminIcon from "@/assets/admin_icon.svg";

export default function Header() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      const res = await fetch("http://127.0.0.1:8000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <header
      className="
      h-20 px-8 bg-white border-b border-gray-100
      flex items-center justify-between sticky top-0 z-40
    "
    >
      <div
        className="flex items-center gap-3
                       rounded-xl px-4 py-2.5 w-80"
      ></div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* Main Dashboard Shortcut */}
        <button
          onClick={() => navigate("/")}
          className="relative w-10 h-10 rounded-xl bg-gray-50
                     flex items-center justify-center
                     hover:bg-gray-100 transition-all cursor-pointer"
        >
          <House size={18} className="text-gray-600 w-8 h-8" />
        </button>

        {/* USER */}
        <div className="relative">
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-3 py-2 transition-all cursor-pointer select-none"
          >
            <img
              src={user?.role === "admin" ? adminIcon : userIcon}
              alt="Utilisateur"
              className="w-9 h-9 rounded-xl object-cover"
            />

            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">
                {user?.full_name || "Chargement..."}
              </p>
              <p className="text-xs text-gray-400">{user?.role || ""}</p>
            </div>

            <ChevronDown size={16} className="text-gray-400" />
          </div>

          {/* DROPDOWN */}
          {open && (
            <div className="absolute right-0 mt-2 w-44 overflow-hidden bg-white border border-gray-100 rounded-xl shadow-lg">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/settings");
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                <Settings size={16} />
                Paramètres
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full text-left items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <LogOut size={16} />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
