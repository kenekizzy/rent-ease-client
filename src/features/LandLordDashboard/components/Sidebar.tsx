'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  AlertCircle,
  FileText,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth";

const navItems = [
  { href: "/landlord-dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/landlord-dashboard/properties", icon: Building2, label: "Properties" },
  { href: "/landlord-dashboard/tenants", icon: Users, label: "Tenants" },
  { href: "/landlord-dashboard/rent_payments", icon: CreditCard, label: "Rent Payments" },
  { href: "/landlord-dashboard/complaints", icon: AlertCircle, label: "Complaints" },
  { href: "/landlord-dashboard/documents", icon: FileText, label: "Documents" },
  { href: "/landlord-dashboard/reports", icon: BarChart3, label: "Reports" },
  { href: "/landlord-dashboard/notifications", icon: Bell, label: "Notifications", badge: 3 },
  { href: "/landlord-dashboard/settings", icon: Settings, label: "Settings" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [view, setView] = useState("Landlord View");
  const { user } = useAuthStore();


  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gray-900 text-lg">RentFlow</span>
      </div>

      {/* View Switcher */}
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="relative">
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>Landlord View</option>
            <option>Tenant View</option>
          </select>
          <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href ;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-indigo-600" : "text-gray-400"}`} />
              <span>{label}</span>
              {badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-xs">
          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName + " " + user?.lastName}</p>
          <p className="text-xs text-gray-400 truncate">{user?.role}</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar