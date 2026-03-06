import React from 'react';

export default function LandlordDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">🏠</div>
                    <span className="font-bold text-gray-800 tracking-tight">RentEase Landlord</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition">Dashboard</button>
                    <button className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition">Properties</button>
                    <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300" />
                </div>
            </nav>

            <main>
                {children}
            </main>
        </div>
    );
}
