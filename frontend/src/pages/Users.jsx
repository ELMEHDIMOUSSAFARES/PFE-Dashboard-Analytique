import { Search, Plus } from "lucide-react";

const users = [
  { id: 1, name: "Alice Martin", email: "alice@email.com", role: "Admin", status: "Active" },
  { id: 2, name: "Bob Johnson", email: "bob@email.com", role: "Editor", status: "Active" },
  { id: 3, name: "Sara Williams", email: "sara@email.com", role: "Viewer", status: "Inactive" },
  { id: 4, name: "Mike Brown", email: "mike@email.com", role: "Editor", status: "Active" },
  { id: 5, name: "Emma Davis", email: "emma@email.com", role: "Viewer", status: "Active" },
];

export default function Users() {
  return (
    <div className="p-6 md:p-8 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-400 text-sm">Manage your team</p>
        </div>

        <div className="flex items-center gap-3">
          
          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-2 rounded-xl">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="outline-none text-sm bg-transparent"
            />
          </div>

          {/* Add Button */}
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition">
            <Plus size={16} />
            Add User
          </button>

        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full">
          
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-400 uppercase">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">

                {/* User */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://i.pravatar.cc/40?u=${user.id}`}
                      className="w-10 h-10 rounded-xl object-cover"
                      alt={user.name}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: #{user.id}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.email}
                </td>

                {/* Role */}
                <td className="px-6 py-4">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
                    {user.role}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full
                    ${user.status === "Active"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500"
                    }`}>
                    {user.status}
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