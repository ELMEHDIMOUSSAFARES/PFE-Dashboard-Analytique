import { Search } from "lucide-react";

const chats = [
  { id: 1, name: "John Doe", message: "Hey bro 👋", time: "2m", online: true },
  { id: 2, name: "Sara Smith", message: "Can we meet?", time: "10m", online: false },
  { id: 3, name: "Mike Johnson", message: "Project done ✅", time: "1h", online: true },
];

export default function Messages() {
  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">

      {/* LEFT - chat list */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col">
        
        {/* Search */}
        <div className="p-4">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
            <Search size={16} className="text-gray-400" />
            <input
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
        </div>

        {/* Users */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
            >
              <div className="relative">
                <img
                  src={`https://i.pravatar.cc/40?u=${chat.id}`}
                  className="w-10 h-10 rounded-xl"
                />
                {chat.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{chat.name}</p>
                <p className="text-xs text-gray-400 truncate">{chat.message}</p>
              </div>

              <span className="text-xs text-gray-400">{chat.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT - chat content */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-gray-100 flex items-center">
          <h2 className="font-semibold text-gray-800">John Doe</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          
          <div className="flex">
            <div className="bg-gray-100 px-4 py-2 rounded-xl text-sm">
              Hello 👋
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm">
              Hi bro 🔥
            </div>
          </div>

        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100">
          <input
            placeholder="Type a message..."
            className="w-full bg-gray-50 px-4 py-3 rounded-xl outline-none text-sm"
          />
        </div>

      </div>
    </div>
  );
}