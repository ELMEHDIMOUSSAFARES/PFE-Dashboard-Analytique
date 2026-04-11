export default function Notifications() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
      <p className="text-gray-400 mt-2">All your notifications</p>

      <div className="mt-6 space-y-3">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          🔔 New user registered
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          💬 New message received
        </div>
      </div>
    </div>
  );
}