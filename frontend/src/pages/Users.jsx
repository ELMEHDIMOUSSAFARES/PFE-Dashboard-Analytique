import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function Users() {
  const [users, setUsers] = useState([
    { id: 1, name: "Hamza", email: "hamza@gmail.com" },
    { id: 2, name: "Ali", email: "ali@gmail.com" },
    { id: 3, name: "Sara", email: "sara@gmail.com" },
  ]);

  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const addUser = () => {
    if (!name || !email) return;
    setUsers([...users, { id: users.length + 1, name, email }]);
    setName("");
    setEmail("");
  };

  // Common input class for glassy style
  const inputClass = "w-full bg-white/5 border border-white/10 p-3 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <p className="text-slate-400">Manage your team members and their access.</p>
      </div>

      {/* Add User Section - Glassy Card */}
      <Card className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md p-6">
        <h2 className="text-lg font-bold text-white mb-4">Add New User</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Full Name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          <input type="email" placeholder="Email Address" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          <button onClick={addUser} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20">
            Add User
          </button>
        </div>
      </Card>

      {/* Search Section */}
      <input
        type="text"
        placeholder="🔍 Search users by name..."
        className={`${inputClass} !p-4`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table Section */}
      <Card className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-6 text-slate-400 font-medium">ID</th>
                <th className="p-6 text-slate-400 font-medium">Name</th>
                <th className="p-6 text-slate-400 font-medium">Email</th>
                <th className="p-6 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-6 text-slate-300">#{user.id}</td>
                    <td className="p-6 text-white font-medium">{user.name}</td>
                    <td className="p-6 text-slate-300">{user.email}</td>
                    <td className="p-6">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}