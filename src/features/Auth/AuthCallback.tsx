'use client'

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { apiClient } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      if (!accessToken) {
        toast.error('Authentication failed: No token received');
        router.push('/login');
        return;
      }

      try {
        // Set token in localStorage for apiClient interceptor to pick up
        localStorage.setItem('auth_token', accessToken);
        
        // Fetch user profile
        const user = await apiClient.get<any>('/auth/me');
        
        // Update auth store
        login(user, accessToken);
        
        toast.success(`Welcome back, ${user.firstName}!`);

        // Redirect based on role
        if (user.role === 'landlord') {
          router.push('/landlord-dashboard');
        } else if (user.role === 'tenant') {
          router.push('/tenant-dashboard');
        } else {
          // Fallback if role is unknown
          toast.error('Unknown user role. Please contact support.');
          router.push('/login');
        }
      } catch (error: any) {
        console.error('Callback error:', error);
        toast.error('Failed to complete sign in. Please try again.');
        router.push('/login');
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Completing sign in...</h2>
        <p className="text-gray-500">Please wait while we set up your dashboard.</p>
      </div>
    </div>
  );
}

const AuthCallback = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}

export default AuthCallback