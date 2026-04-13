"use client"

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import NavBar from "@/components/general/NavBar";
import Link from "next/link";
import { 
    CreditCard, 
    AlertCircle, 
    FileText, 
    CheckCircle2, 
    Bell, 
    Wrench, 
    Home, 
    ChevronRight, 
    ArrowUpRight,
    Loader2,
    Calendar,
    DollarSign,
    Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";

const Dashboard = () => {
    const { user } = useAuthStore();
    const router = useRouter();

    // Fetch tenant summary stats
    const { data: summary, isLoading: isSummaryLoading } = useQuery({
        queryKey: ['tenant-summary'],
        queryFn: () => apiClient.get<any>('/stats/tenant-summary'),
    });

    // Fetch recent activities/notifications
    const { data: notifications, isLoading: isNotisLoading } = useQuery({
        queryKey: ['recent-notifications'],
        queryFn: () => apiClient.get<any[]>('/notifications'),
    });

    if (isSummaryLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    const { activeLease, stats } = summary || {};

    const annualRent = activeLease?.annualRent ?? 1;
    const totalPaid = stats?.totalPaid ?? 0;
    const progressPct = Math.min((totalPaid / annualRent) * 100, 100);

    const quickActions = [
        {
            href: "/tenant-dashboard/rent-payments",
            icon: CreditCard,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            title: "Pay Rent",
            desc: "Securely pay your rent",
        },
        {
            href: "/tenant-dashboard/complaints",
            icon: AlertCircle,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-600",
            title: "Maintenance",
            desc: "Report issues",
        },
        {
            href: "/tenant-dashboard/leases",
            icon: FileText,
            iconBg: "bg-green-50",
            iconColor: "text-green-600",
            title: "Lease",
            desc: "View agreement",
        },
    ];

    return (
        <>
            <NavBar title="Dashboard" subtitle={`Welcome back, ${user?.firstName}`} />

            {/* Financial Overview Banner */}
            <div className="relative group">
                <div className="absolute inset-0 bg-indigo-600 rounded-[2.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-indigo-100 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
                    
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-3">Current Balance</p>
                            <h2 className="text-white text-5xl md:text-6xl font-black tracking-tighter mb-6 flex items-start">
                                <span className="text-2xl mt-2 mr-1 opacity-60">₦</span>
                                {Number(stats?.monthlyRent || 0).toLocaleString()}
                            </h2>
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
                                    <Calendar className="w-5 h-5 text-indigo-200" />
                                    <div>
                                        <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Next Due Date</p>
                                        <p className="text-white font-bold">{stats?.nextDueDate ? new Date(stats.nextDueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'No pending due date'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                    <p className="text-indigo-100 text-sm font-medium">Auto-pay Active</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button className="bg-white hover:bg-indigo-50 text-indigo-600 h-14 px-10 rounded-2xl font-black shadow-xl transition-all hover:scale-[1.02] active:scale-95 text-lg" onClick={() => router.push('/tenant-dashboard/rent-payments')}>
                                Pay Rent Now
                            </Button>
                            <Button variant="ghost" className="text-indigo-100 hover:text-white hover:bg-white/10 rounded-xl font-bold flex gap-2 mx-auto md:mx-0" onClick={() => router.push('/tenant-dashboard/rent-payments')}>
                                View History
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Stats */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-3 gap-4">
                    {quickActions.map((action, i) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={i}
                                href={action.href}
                                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="w-4 h-4 text-gray-300" />
                                </div>
                                <div className={`w-14 h-14 ${action.iconBg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-6 h-6 ${action.iconColor}`} />
                                </div>
                                <p className="text-base font-bold text-gray-900 mb-1">{action.title}</p>
                                <p className="text-xs text-gray-400 leading-relaxed">{action.desc}</p>
                            </Link>
                        );
                    })}
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Financial Health</h2>
                        <Activity className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400 font-medium">Total Paid Year-to-date</span>
                                <span className="text-green-600 font-bold">₦{Number(stats?.totalPaid || 0).toLocaleString()}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                <div className="h-full bg-green-500" style={{ width: `${progressPct}%` }} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Open Issues</p>
                                <p className="text-2xl font-black text-orange-600">{stats?.openComplaints || 0}</p>
                            </div>
                            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Pending Pay</p>
                                <p className="text-2xl font-black text-indigo-600">₦{Number(stats?.pendingAmount || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Lease Overview */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Active Lease Summary</h2>
                        <Link href="/tenant-dashboard/leases">
                            <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl">View Details</Button>
                        </Link>
                    </div>
                    {activeLease ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-5 p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                                    <Home className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">{activeLease.property?.addressLine1}</p>
                                    <p className="text-sm text-gray-400">{activeLease.property?.city}, {activeLease.property?.state}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Start Date</p>
                                        <p className="text-sm font-bold text-gray-900">{new Date(activeLease.startDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Security Deposit</p>
                                        <p className="text-sm font-bold text-gray-900">₦{Number(activeLease.securityDeposit).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Renewal Date</p>
                                        <p className="text-sm font-bold text-red-500">{new Date(activeLease.endDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Unit Number</p>
                                        <p className="text-sm font-bold text-indigo-600">{activeLease.unit?.name || 'Main Residence'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <p className="text-gray-400 font-bold mb-4">No active lease found</p>
                            <Link href="/tenant-dashboard/leases">
                                <Button variant="outline" className="rounded-xl border-indigo-100 text-indigo-600 font-bold">Check Invitations</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Notifications Feed */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Activity</h2>
                        <Link href="/tenant-dashboard/notifications">
                            <Button variant="ghost" size="sm" className="text-gray-400 font-bold hover:bg-gray-50 rounded-xl">Mark as Read</Button>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {notifications && notifications.length > 0 ? (
                            notifications.slice(0, 5).map((n, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-600 group-hover:scale-110 transition-transform">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className="text-sm font-bold text-gray-900 truncate">{n.title}</p>
                                            <span className="text-[10px] font-bold text-gray-300 whitespace-nowrap">{new Date(n.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-1">{n.message}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <p className="text-gray-400 font-bold">All caught up!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;