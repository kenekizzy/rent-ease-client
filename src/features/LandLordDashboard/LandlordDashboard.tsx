'use client'

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { Loader2, Plus, Building2, CheckCircle2, DollarSign, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import NavBar from '@/components/general/NavBar';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const LandlordDashboard = () => {
    const { user } = useAuthStore();

    // Fetch summary stats
    const { data: summary, isLoading: isSummaryLoading } = useQuery({
        queryKey: ['landlord-summary'],
        queryFn: () => apiClient.get<any>('/stats/landlord-summary'),
    });

    // Fetch recent activities
    const { data: activities, isLoading: isActivitiesLoading } = useQuery({
        queryKey: ['recent-activities'],
        queryFn: () => apiClient.get<any[]>('/activities/recent'),
    });

    const currentYear = new Date().getFullYear();

    // Fetch payment report for income chart
    const { data: report, isLoading: isReportLoading } = useQuery({
        queryKey: ['income-report', currentYear],
        queryFn: () => apiClient.get<any>(`/payments/report?year=${currentYear}`),
    });

    if (isSummaryLoading || isActivitiesLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const statCards = [
        {
            label: "Total Properties",
            value: summary?.totalProperties || 0,
            badge: "+12%",
            badgeColor: "text-indigo-600 bg-indigo-50",
            icon: Building2,
            iconBg: "bg-indigo-50",
            iconColor: "text-indigo-600",
        },
        {
            label: "Occupied Units",
            value: `${summary?.occupiedUnits || 0} / ${summary?.totalUnits || 0}`,
            badge: `${summary?.occupancyRate || 0}%`,
            badgeColor: (summary?.occupancyRate || 0) > 80 ? "text-green-600 bg-green-50" : "text-yellow-600 bg-yellow-50",
            icon: CheckCircle2,
            iconBg: "bg-green-50",
            iconColor: "text-green-600",
        },
        {
            label: "Monthly Income",
            value: `₦${Number(summary?.monthlyIncome || 0).toLocaleString()}`,
            badge: `${summary?.incomeGrowth || 0}%`,
            badgeColor: (summary?.incomeGrowth || 0) >= 0 ? "text-blue-600 bg-blue-50" : "text-red-600 bg-red-50",
            icon: DollarSign,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            label: "Outstanding Payments",
            value: `₦${Number(summary?.outstandingAmount || 0).toLocaleString()}`,
            badge: `${summary?.outstandingPayments || 0} Late`,
            badgeColor: (summary?.outstandingPayments || 0) > 0 ? "text-orange-600 bg-orange-50" : "text-green-600 bg-green-50",
            icon: AlertTriangle,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500",
        },
    ];

    const incomeData = MONTHS.map((month, i) => ({
        month,
        income: report?.monthlyBreakdown?.[i] ?? 0,
    }));

    const occupancyData = [
        { name: "Occupied", value: summary?.occupiedUnits || 0 },
        { name: "Available", value: (summary?.totalUnits || 0) - (summary?.occupiedUnits || 0) },
    ];

    if (!summary?.totalProperties) {
        return (
            <>
                <NavBar title="Dashboard" subtitle={`Welcome back, ${user?.firstName}`} />
                <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-2xl border border-dashed border-gray-200 mt-6 text-center px-4">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No properties found</h2>
                    <p className="text-gray-500 max-w-sm mb-6">You haven't added any properties yet. Start by adding your first property to track income and manage tenants.</p>
                    <Button asChild className="gap-2">
                        <Link href="/landlord-dashboard/properties">
                            <Plus className="w-4 h-4" />
                            Add First Property
                        </Link>
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <NavBar title="Dashboard" subtitle={`Welcome back, ${user?.firstName}`} />
            {/* Stat Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${card.badgeColor}`}>
                                    {card.badge}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h2 className="text-base font-bold text-gray-900 mb-4">Monthly Income</h2>
                    {isReportLoading ? (
                        <div className="h-[220px] flex flex-col gap-3 animate-pulse">
                            <div className="flex items-end gap-2 h-full px-2">
                                {MONTHS.map((m) => (
                                    <div key={m} className="flex-1 bg-gray-100 rounded" style={{ height: `${Math.random() * 60 + 20}%` }} />
                                ))}
                            </div>
                        </div>
                    ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={incomeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={{ fontSize: 12, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip formatter={(v: any) => [`₦${Number(v).toLocaleString()}`, "Income"]} />
                            <Line
                                type="monotone"
                                dataKey="income"
                                stroke="#6366f1"
                                strokeWidth={2.5}
                                dot={{ fill: "#6366f1", r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    )}
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h2 className="text-base font-bold text-gray-900 mb-4">Occupancy Rate</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={occupancyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                <Cell fill="#22c55e" />
                                <Cell fill="#d1d5db" />
                            </Pie>
                            <Legend
                                iconType="square"
                                iconSize={10}
                                formatter={(v) => <span className="text-xs text-gray-600">{v}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-base font-bold text-gray-900 mb-4">Recent Activities</h2>
                <div className="space-y-4">
                    {activities && activities.length > 0 ? activities.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${a.icon === "tenant"
                                    ? "bg-indigo-50"
                                    : a.icon === "payment"
                                        ? "bg-blue-50"
                                        : "bg-orange-50"
                                    }`}
                            >
                                {a.icon === "tenant" ? (
                                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                ) : a.icon === "payment" ? (
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                ) : (
                                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                                <p className="text-sm text-gray-500">{a.desc}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{new Date(a.time).toLocaleString()}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="py-8 text-center text-gray-400">
                            No recent activities to show.
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}


export default LandlordDashboard