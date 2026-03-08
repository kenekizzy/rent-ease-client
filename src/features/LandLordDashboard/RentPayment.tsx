'use client'

import React from 'react'
import NavBar from '../../components/general/NavBar'
import { TrendingUp, Clock, AlertTriangle, FileText, Download } from "lucide-react";

const payments = [
    {
        tenant: "Sarah Johnson",
        property: "Sunset Plaza 3B",
        dueDate: "May 1, 2024",
        amount: "$2,100",
        status: "Paid",
        action: "View Receipt",
    },
    {
        tenant: "Michael Chen",
        property: "Oak Tower 5A",
        dueDate: "May 1, 2024",
        amount: "$2,800",
        status: "Pending",
        action: "Send Reminder",
    },
];

const RentPayment = () => {
    return (
        <>
            <NavBar title="Rent Payments" subtitle="Track and manage rent payments" />
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Total Collected</p>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$44,300</p>
                    <p className="text-xs text-green-600 font-medium mt-1">This month</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Pending Payments</p>
                        <Clock className="w-5 h-5 text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$4,200</p>
                    <p className="text-xs text-gray-400 mt-1">2 tenants</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Overdue</p>
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$0</p>
                    <p className="text-xs text-gray-400 mt-1">No overdue payments</p>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option>All Status</option>
                            <option>Paid</option>
                            <option>Pending</option>
                            <option>Overdue</option>
                        </select>
                        <input
                            type="date"
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                            <FileText className="w-4 h-4" />
                            Generate Report
                        </button>
                        <button className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Tenant</th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Property</th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Due Date</th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Amount</th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Status</th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((p, i) => (
                            <tr key={i} className="border-b border-gray-50 last:border-0">
                                <td className="py-4 text-sm font-semibold text-gray-900">{p.tenant}</td>
                                <td className="py-4 text-sm text-gray-600">{p.property}</td>
                                <td className="py-4 text-sm text-gray-600">{p.dueDate}</td>
                                <td className="py-4 text-sm font-semibold text-gray-900">{p.amount}</td>
                                <td className="py-4">
                                    <span
                                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.status === "Paid"
                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                : p.status === "Pending"
                                                    ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                                    : "bg-red-50 text-red-700 border border-red-200"
                                            }`}
                                    >
                                        {p.status}
                                    </span>
                                </td>
                                <td className="py-4">
                                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                        {p.action}
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

export default RentPayment