import React from 'react';
import Sidebar from '@/features/TenantDashboard/components/Sidebar';

export default function TenantDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 ml-56">
                <main className="pt-16">
                    <div className="p-6">{children}</div>
                </main>
            </div>
        </div>
    );
}
