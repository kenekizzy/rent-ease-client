'use client'

import React from 'react'
import NavBar from '@/components/general/NavBar'
import { CreditCard, AlertCircle, Bell, CheckCircle2 } from "lucide-react";

const notifications = [
  { icon: CreditCard, iconBg: "bg-blue-50", iconColor: "text-blue-500", title: "Payment Received", desc: "Michael Chen paid $2,800 for Oak Tower 5A", time: "2 hours ago", unread: true },
  { icon: AlertCircle, iconBg: "bg-orange-50", iconColor: "text-orange-500", title: "New Complaint Submitted", desc: "Sarah Johnson reported a leaky faucet in Sunset Plaza 3B", time: "5 hours ago", unread: true },
  { icon: Bell, iconBg: "bg-yellow-50", iconColor: "text-yellow-500", title: "Rent Due Reminder", desc: "Rent payment for Emma Davis is due in 3 days", time: "1 day ago", unread: true },
  { icon: CheckCircle2, iconBg: "bg-green-50", iconColor: "text-green-500", title: "Maintenance Completed", desc: "Heating issue in Maple Court 2C has been resolved", time: "2 days ago", unread: false },
];

const Notifications = () => {
  return (
    <>
    <NavBar title="Notifications" subtitle="Manage your notifications" />
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-400">Stay updated with important alerts</p>
          </div>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Mark all as read</button>
        </div>
        <div className="space-y-1">
          {notifications.map((n, i) => {
            const Icon = n.icon;
            return (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${n.unread ? "bg-indigo-50/40" : "hover:bg-gray-50"}`}>
                <div className={`w-10 h-10 ${n.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${n.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{n.desc}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
                {n.unread && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>
    </>
  )
}

export default Notifications