'use client'

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { apiClient } from '@/services/api';
import { 
    Loader2, 
    User, 
    Home, 
    ArrowRight, 
    ChevronLeft, 
    LogOut,
    CheckCircle2,
    Building2,
    Users
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, updateUser, logout } = useAuthStore();
  const initialized = useRef(false);
  
  const [isSelectingRole, setIsSelectingRole] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'landlord' | 'tenant' | null>(null);
  const [formData, setFormData] = useState({
      firstName: '',
      lastName: ''
  });

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      if (!accessToken) {
        toast.error('Authentication failed: No token received');
        router.push('/login');
        return;
      }

      try {
        localStorage.setItem('auth_token', accessToken);
        const user = await apiClient.get<any>('/auth/me');
        login(user, accessToken);
        
        if (user.role === 'undetermined') {
          setFormData({
              firstName: user.firstName || '',
              lastName: user.lastName || ''
          });
          setIsSelectingRole(true);
          setIsLoading(false);
        } else {
          toast.success(`Welcome back, ${user.firstName}!`);
          redirectByRole(user.role);
        }
      } catch (error: any) {
        console.error('Callback error:', error);
        toast.error('Failed to complete sign in.');
        router.push('/login');
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  const redirectByRole = (role: string) => {
    if (role === 'landlord') {
      router.push('/landlord-dashboard');
    } else if (role === 'tenant') {
      router.push('/tenant-dashboard');
    } else {
      router.push('/login');
    }
  };

  const handleCompleteOnboarding = async () => {
      if (!selectedRole) {
          toast.error('Please select a role to continue.');
          return;
      }
      if (!formData.firstName || !formData.lastName) {
          toast.error('Please provide your full name.');
          return;
      }

      try {
          setIsLoading(true);
          const updatedUser = await apiClient.patch('/users/profile', {
              firstName: formData.firstName,
              lastName: formData.lastName,
              role: selectedRole
          });
          
          updateUser(updatedUser);
          toast.success(`Account set up! Welcome to RentFlow, ${updatedUser.firstName}.`);
          redirectByRole(selectedRole);
      } catch (err: any) {
          toast.error(err.message || 'Failed to update profile');
          setIsLoading(false);
      }
  };

  if (isLoading && !isSelectingRole) {
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

  if (isSelectingRole) {
      return (
          <div className="min-h-screen bg-[#FDFDFF] flex flex-col items-center justify-center p-6 sm:p-12">
              <div className="max-w-2xl w-full">
                  {/* Header */}
                  <div className="text-center mb-10">
                      <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
                          <Building2 className="w-8 h-8 text-white" />
                      </div>
                      <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">One last step...</h1>
                      <p className="text-gray-500 font-medium">How will you be using RentFlow today?</p>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-50/50 border border-indigo-50/50 space-y-10">
                      {/* Name Inputs */}
                      <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                              <Input 
                                value={formData.firstName}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                placeholder="e.g. John"
                                className="h-14 rounded-2xl bg-gray-50 border-gray-100 focus:ring-indigo-500 text-lg font-medium px-6"
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                              <Input 
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                placeholder="e.g. Doe"
                                className="h-14 rounded-2xl bg-gray-50 border-gray-100 focus:ring-indigo-500 text-lg font-medium px-6"
                              />
                          </div>
                      </div>

                      {/* Role selection cards */}
                      <div className="grid sm:grid-cols-2 gap-6">
                            <button 
                                onClick={() => setSelectedRole('landlord')}
                                className={`group relative p-8 rounded-[2rem] border-2 transition-all duration-300 text-left ${
                                    selectedRole === 'landlord' 
                                    ? 'border-indigo-600 bg-indigo-50/30' 
                                    : 'border-gray-100 hover:border-indigo-200 bg-white'
                                }`}
                            >
                                {selectedRole === 'landlord' && (
                                    <div className="absolute top-4 right-4">
                                        <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                                    </div>
                                )}
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                                    selectedRole === 'landlord' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'
                                }`}>
                                    <Home className="w-7 h-7" />
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${selectedRole === 'landlord' ? 'text-indigo-900' : 'text-gray-900'}`}>Property Owner</h3>
                                <p className="text-sm text-gray-400 font-medium leading-relaxed">I want to list properties and manage tenants.</p>
                            </button>

                            <button 
                                onClick={() => setSelectedRole('tenant')}
                                className={`group relative p-8 rounded-[2rem] border-2 transition-all duration-300 text-left ${
                                    selectedRole === 'tenant' 
                                    ? 'border-indigo-600 bg-indigo-50/30' 
                                    : 'border-gray-100 hover:border-indigo-200 bg-white'
                                }`}
                            >
                                {selectedRole === 'tenant' && (
                                    <div className="absolute top-4 right-4">
                                        <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                                    </div>
                                )}
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                                    selectedRole === 'tenant' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'
                                }`}>
                                    <Users className="w-7 h-7" />
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${selectedRole === 'tenant' ? 'text-indigo-900' : 'text-gray-900'}`}>Property Seeker</h3>
                                <p className="text-sm text-gray-400 font-medium leading-relaxed">I am looking for a property to rent or lease.</p>
                            </button>
                      </div>

                      {/* Main Action */}
                      <Button 
                        onClick={handleCompleteOnboarding}
                        disabled={isLoading || !selectedRole}
                        className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-[0.98] flex gap-3"
                      >
                          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                              <>
                                Finish Setup
                                <ArrowRight className="w-5 h-5" />
                              </>
                          )}
                      </Button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="mt-8 flex items-center justify-between px-2">
                        <button 
                            onClick={() => router.push('/')}
                            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back to Home
                        </button>
                        <button 
                            onClick={() => {
                                logout();
                                router.push('/login');
                            }}
                            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Switch Account
                        </button>
                  </div>
              </div>
          </div>
      );
  }

  return null;
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