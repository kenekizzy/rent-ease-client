import React from 'react';

export default function TenantDashboard() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Tenant Dashboard</h1>
            <p className="text-gray-600">Welcome to your dashboard. Here you can manage your rent payments, view documents, and submit maintenance requests.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-lg mb-2">Upcoming Rent</h3>
                    <p className="text-3xl font-bold text-indigo-600">$1,200</p>
                    <p className="text-sm text-gray-400 mt-1">Due in 5 days</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-lg mb-2">Active Leases</h3>
                    <p className="text-3xl font-bold text-indigo-600">1</p>
                    <p className="text-sm text-gray-400 mt-1">Sunset Valley Apartments</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-lg mb-2">Open Requests</h3>
                    <p className="text-3xl font-bold text-indigo-600">0</p>
                    <p className="text-sm text-gray-400 mt-1">All issues resolved</p>
                </div>
            </div>
        </div>
    );
}