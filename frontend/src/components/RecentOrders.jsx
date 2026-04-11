const orders = [
  { id: '#ORD-001', customer: 'Alice Martin',  amount: '$120.00', status: 'Delivered' },
  { id: '#ORD-002', customer: 'Bob Johnson',   amount: '$89.50',  status: 'Pending'   },
  { id: '#ORD-003', customer: 'Sara Williams', amount: '$340.00', status: 'Delivered' },
  { id: '#ORD-004', customer: 'Mike Brown',    amount: '$55.00',  status: 'Cancelled' },
  { id: '#ORD-005', customer: 'Emma Davis',    amount: '$210.00', status: 'Pending'   },
];

const statusStyle = {
  Delivered: 'bg-green-100 text-green-700',
  Pending:   'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function RecentOrders() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">Recent Orders</h2>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-gray-400 uppercase">
            <th className="px-6 py-3">Order ID</th>
            <th className="px-6 py-3">Customer</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                {order.id}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {order.customer}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                {order.amount}
              </td>
              <td className="px-6 py-4">
                <span className={`text-xs font-medium px-3 py-1
                                 rounded-full ${statusStyle[order.status]}`}>
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}