'use client'

import React from 'react'
import NavBar from '../../components/general/NavBar'
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const revenueData = [
    { month: "Jan", revenue: 42000 },
    { month: "Feb", revenue: 45000 },
    { month: "Mar", revenue: 43000 },
    { month: "Apr", revenue: 47000 },
    { month: "May", revenue: 46000 },
    { month: "Jun", revenue: 49000 },
    { month: "Jul", revenue: 49500 },
    { month: "Aug", revenue: 51000 },
    { month: "Sep", revenue: 48000 },
    { month: "Oct", revenue: 52000 },
    { month: "Nov", revenue: 50500 },
    { month: "Dec", revenue: 53000 },
];

const summaryStats = [
    {
        label: "Total Revenue",
        value: "$582,000",
        change: "+15% from last year",
        positive: true,
    },
    {
        label: "Avg. Occupancy",
        value: "94%",
        change: "+3% from last year",
        positive: true,
    },
    {
        label: "Total Expenses",
        value: "$124,500",
        change: "+8% from last year",
        positive: false,
    },
    {
        label: "Net Profit",
        value: "$457,500",
        change: "+18% from last year",
        positive: true,
    },
];


const Reports = () => {
    return (
        <>
            <NavBar title="Reports" subtitle="View and manage reports" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Reports &amp; Analytics</h2>
                        <p className="text-sm text-gray-400">Financial insights and performance metrics</p>
                    </div>
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>

                {/* Date range */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Date Range:</span>
                    <input
                        type="date"
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-400">to</span>
                    <input
                        type="date"
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        Apply
                    </button>
                </div>

                {/* Bar chart */}
                <div className="mb-6 p-5 border border-gray-100 rounded-xl">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Revenue Overview</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={revenueData} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={{ fontSize: 12, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Revenue"]} />
                            <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-4 gap-4">
                    {summaryStats.map((s, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{s.value}</p>
                            <p className={`text-xs font-medium flex items-center gap-1 ${s.positive ? "text-green-600" : "text-red-500"}`}>
                                {s.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {s.change}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Reports