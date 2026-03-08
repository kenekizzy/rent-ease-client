import React from 'react';
import Sidebar from '@/features/LandLordDashboard/components/Sidebar';


interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function LandlordDashboardLayout({
    children,
}: DashboardLayoutProps) {
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
