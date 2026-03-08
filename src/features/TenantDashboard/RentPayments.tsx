"use client"

import NavBar from '@/components/general/NavBar'
import { Download } from "lucide-react";

const paymentHistory = [
  {
    date: "May 1, 2024",
    amount: "$2,100",
    method: "Credit Card",
    status: "Paid",
  },
  {
    date: "Apr 1, 2024",
    amount: "$2,100",
    method: "Bank Transfer",
    status: "Paid",
  },
];

const RentPayments = () => {
  return (
    <>
    <NavBar title="Rent Payments" subtitle="Manage your rent payments" />
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Upcoming Payment</h2>
          <p className="text-sm text-gray-400 mt-0.5">Due on June 1, 2024</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-3xl font-bold text-gray-900">$2,100</p>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
            Pay Now
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-5">Payment History</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Date</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Amount</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Method</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.map((p, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="py-4 text-sm text-gray-700">{p.date}</td>
                <td className="py-4 text-sm font-semibold text-gray-900">{p.amount}</td>
                <td className="py-4 text-sm text-gray-500">{p.method}</td>
                <td className="py-4">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                    {p.status}
                  </span>
                </td>
                <td className="py-4">
                  <button className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default RentPayments