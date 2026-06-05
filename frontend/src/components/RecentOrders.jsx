import { useEffect, useState } from "react";

export default function RecentPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8000/kpi/recent-payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch payments");
        return;
      }

      const data = await res.json();

      setPayments(data);
    };

    fetchPayments();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">Recent Payments</h2>

        <p className="text-sm text-gray-400 mt-1">Latest student payments</p>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-gray-400 uppercase">
            <th className="px-6 py-3">Payment ID</th>
            <th className="px-6 py-3">Student</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Date</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                #{payment.id}
              </td>

              <td className="px-6 py-4 text-sm text-gray-700">
                {payment.student}
              </td>

              <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                {payment.amount} MAD
              </td>

              <td className="px-6 py-4 text-sm text-gray-500">
                {payment.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
