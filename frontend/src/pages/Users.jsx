import { Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import userIcon from "@/assets/user_icon.svg";
import adminIcon from "@/assets/admin_icon.svg";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(null);
  useEffect(() => {
    const fetchCurr = async () => {
      const token = localStorage.getItem("token");

      const currRes = await fetch("http://127.0.0.1:8000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const currentUser = await currRes.json();
      setIsAdmin(currentUser.role === "admin");
    };

    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8000/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        console.error("Failed:", res.status);
        return;
      }
      const data = await res.json();

      setUsers(data);
    };

    fetchCurr();
    fetchUsers();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-400 text-sm">Manage your team</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Add Button */}
          {isAdmin && (
            <button className="cursor-pointer flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">
              <Plus size={16} />
              Add User
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-400 uppercase">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.role === "admin" ? adminIcon : userIcon}
                      className="w-10 h-10 rounded-xl object-cover"
                      alt={user.email}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-400">ID: #{user.id}</p>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
                    {user.role}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full
                    ${
                      user.is_active === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
