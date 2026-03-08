import React from 'react'
import { CreditCard, Building2, Bell, MessageSquare, BarChart3, FileText } from 'lucide-react';

const features = [
  {
    icon: CreditCard,
    title: "Effortless Rent Collection",
    desc: "Automate rent reminders, accept multiple payment methods, and track every payment in real time.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Building2,
    title: "Property Management",
    desc: "Manage unlimited properties, units, and lease agreements from one clean dashboard.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    desc: "Never miss a due date. Automated alerts for rent, maintenance requests, and lease renewals.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: MessageSquare,
    title: "Tenant Communication",
    desc: "Built-in messaging and complaint management keeps everything documented and organized.",
    color: "bg-pink-50 text-pink-600",
  },
  {
    icon: BarChart3,
    title: "Financial Reports",
    desc: "Detailed analytics on revenue, expenses, and occupancy rates to grow your portfolio.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: FileText,
    title: "Document Storage",
    desc: "Store lease agreements, inspection reports, and property documents securely in the cloud.",
    color: "bg-orange-50 text-orange-600",
  },
];

const HomeFeatures = () => {
  return (
    <section id="features" className="py-24 px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything you need to manage rentals</h2>
                <p className="text-lg text-gray-400 max-w-xl mx-auto">
                  From collecting rent to resolving maintenance issues — RentEasy has every tool you need in one place.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                      <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
  )
}

export default HomeFeatures