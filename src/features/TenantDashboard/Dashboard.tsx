"use client"


import NavBar from "@/components/general/NavBar";
import Link from "next/link";
import { CreditCard, AlertCircle, FileText, CheckCircle2, Bell, Wrench, Home } from "lucide-react";

const quickActions = [
  {
    href: "/tenant/rent-payments",
    icon: CreditCard,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    title: "Pay Rent",
    desc: "Make your monthly payment",
  },
  {
    href: "/tenant/complaints",
    icon: AlertCircle,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    title: "Submit Complaint",
    desc: "Report maintenance issues",
  },
  {
    href: "/tenant/documents",
    icon: FileText,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    title: "View Documents",
    desc: "Access lease and contracts",
  },
];

const recentNotifications = [
  {
    icon: CheckCircle2,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    title: "Payment Confirmed",
    desc: "Your rent payment was received",
  },
  {
    icon: Bell,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    title: "Rent Due Reminder",
    desc: "Next payment due in 5 days",
  },
  {
    icon: Wrench,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    title: "Maintenance Update",
    desc: "Your complaint is being reviewed",
  },
];

const leaseSummary = [
  { label: "Property", value: "Apartment 3B, Sunset Plaza" },
  { label: "Lease Start", value: "Jan 1, 2024" },
  { label: "Lease End", value: "Dec 31, 2024" },
  { label: "Monthly Rent", value: "$2,100" },
];

const Dashboard = () => {
  return (
    <>
    <NavBar title="Dashboard" subtitle="Welcome to your dashboard"/>
    <div className="bg-indigo-600 rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
          <Home className="w-7 h-7 text-white/80" />
        </div>
        <p className="text-indigo-200 text-sm font-medium mb-1">Current Rent</p>
        <p className="text-white text-4xl font-bold mb-6">$2,100</p>
        <div className="border-t border-indigo-500 pt-4 flex items-end justify-between">
          <div>
            <p className="text-indigo-300 text-xs mb-0.5">Due Date</p>
            <p className="text-white font-semibold">May 1, 2024</p>
          </div>
          <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Paid
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {quickActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link
              key={i}
              href={action.href}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-11 h-11 ${action.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${action.iconColor}`} />
              </div>
              <p className="text-sm font-bold text-gray-900">{action.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Lease Summary */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Lease Summary</h2>
          <div className="space-y-3">
            {leaseSummary.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-400">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Recent Notifications</h2>
          <div className="space-y-3">
            {recentNotifications.map((n, i) => {
              const Icon = n.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 ${n.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${n.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-400">{n.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard