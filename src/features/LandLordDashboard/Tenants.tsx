'use client'

import React from 'react'
import NavBar from '../../components/general/NavBar'

const tenants = [
    {
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        initials: "SJ",
        color: "bg-purple-100 text-purple-700",
        property: "Sunset Plaza 3B",
        leasePeriod: "Jan 1, 2024 - Dec 31, 2024",
        rent: "$2,100/mo",
        status: "Active",
    },
    {
        name: "Michael Chen",
        email: "m.chen@email.com",
        initials: "MC",
        color: "bg-blue-100 text-blue-700",
        property: "Oak Tower 5A",
        leasePeriod: "Mar 1, 2024 - Feb 28, 2025",
        rent: "$2,800/mo",
        status: "Active",
    },
];

const Tenants = () => {
    return (
        <>
            <NavBar title="Tenant Management" subtitle="View and manage tenant leases" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Tenant Management</h2>
                    <p className="text-sm text-gray-400">View and manage tenant leases</p>
                </div>

                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Tenant</th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Property</th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Lease Period</th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Rent</th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Status</th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map((t, i) => (
                            <tr key={i} className="border-b border-gray-50 last:border-0">
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${t.color}`}>
                                            {t.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                                            <p className="text-xs text-gray-400">{t.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 text-sm text-gray-600">{t.property}</td>
                                <td className="py-4 text-sm text-gray-600">{t.leasePeriod}</td>
                                <td className="py-4 text-sm font-semibold text-gray-900">{t.rent}</td>
                                <td className="py-4">
                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                                        {t.status}
                                    </span>
                                </td>
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View Lease</button>
                                        <button className="text-sm text-red-500 hover:text-red-700 font-medium">End Lease</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Tenants