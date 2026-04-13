'use client'

import React, { useState } from 'react'
import NavBar from '../../components/general/NavBar'
import { Download, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

interface PaymentReport {
    year: number;
    totalRevenue: number;
    monthlyBreakdown: number[];
    propertyBreakdown: Record<string, { name: string; total: number }>;
}

function exportReportCsv(propertyBreakdown: Record<string, { name: string; total: number }>, year: number) {
    const rows = Object.values(propertyBreakdown);
    const header = 'Property Name,Total Revenue';
    const lines = rows.map(r => `"${r.name.replace(/"/g, '""')}",${r.total}`);
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

const Reports = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [yearInput, setYearInput] = useState(new Date().getFullYear());

    const { data: report, isLoading, error } = useQuery<PaymentReport>({
        queryKey: ['payment-report', selectedYear],
        queryFn: () => apiClient.get<PaymentReport>(`/payments/report?year=${selectedYear}`),
    });

    const chartData = Object.values(report?.propertyBreakdown ?? {}).map(p => ({
        name: p.name,
        revenue: p.total,
    }));

    const totalRevenue = report?.totalRevenue ?? 0;
    const propertyCount = Object.keys(report?.propertyBreakdown ?? {}).length;

    const summaryStats = [
        {
            label: "Total Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            change: `${propertyCount} propert${propertyCount === 1 ? 'y' : 'ies'}`,
            positive: true,
        },
        {
            label: "Properties",
            value: String(propertyCount),
            change: "Active this year",
            positive: true,
        },
    ];

    return (
        <>
            <NavBar title="Reports" subtitle="View and manage reports" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Reports &amp; Analytics</h2>
                        <p className="text-sm text-gray-400">Financial insights and performance metrics</p>
                    </div>
                    <button
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => exportReportCsv(report?.propertyBreakdown ?? {}, selectedYear)}
                        disabled={!report || isLoading}
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>

                {/* Date range */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Year:</span>
                    <input
                        type="number"
                        value={yearInput}
                        onChange={e => setYearInput(parseInt(e.target.value, 10) || yearInput)}
                        min={2000}
                        max={new Date().getFullYear() + 1}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-28"
                    />
                    <button
                        className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        onClick={() => setSelectedYear(yearInput)}
                    >
                        Apply
                    </button>
                </div>

                {/* Loading state */}
                {isLoading && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="ml-2 text-gray-500">Loading report...</span>
                    </div>
                )}

                {/* Error state */}
                {error && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                        <p className="text-gray-600 font-medium">Failed to load report</p>
                        <p className="text-sm text-gray-400 mb-4">There was an error fetching the report data.</p>
                    </div>
                )}

                {/* Chart and stats */}
                {!isLoading && !error && (
                    <>
                        {/* Bar chart */}
                        <div className="mb-6 p-5 border border-gray-100 rounded-xl">
                            <h3 className="text-base font-bold text-gray-900 mb-4">Revenue by Property</h3>
                            {chartData.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-10">No data available for {selectedYear}.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={chartData} barSize={32}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
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
                            )}
                        </div>

                        {/* Summary stats */}
                        <div className="grid grid-cols-2 gap-4">
                            {summaryStats.map((s, i) => (
                                <div key={i} className="border border-gray-100 rounded-xl p-4">
                                    <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 mb-1">{s.value}</p>
                                    <p className={`text-xs font-medium flex items-center gap-1 ${s.positive ? "text-green-600" : "text-red-500"}`}>
                                        <TrendingUp className="w-3 h-3" />
                                        {s.change}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    )
}

export default Reports
