'use client';

import React, { useEffect } from 'react';
import Sidebar from '@/features/LandLordDashboard/components/Sidebar';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function LandlordDashboardLayout({
    children,
}: DashboardLayoutProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  console.log(user);

  useEffect(() => {
    if (user?.role !== 'landlord' || !user) {
      router.push('/login');
      toast.error('You are not authorized to access this page');
    }
  }, [user]);
  
    return user ? (
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 ml-56">
            <main className="pt-16">
              <div className="p-6">{children}</div>
            </main>
          </div>
        </div>
    ) : null;
}
