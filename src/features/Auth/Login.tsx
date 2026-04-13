'use client'

import { useState } from 'react';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['landlord', 'tenant']),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    bg: "bg-indigo-400",
    title: "Smart Analytics",
    desc: "Real-time insights & reports",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
      </svg>
    ),
    bg: "bg-blue-400",
    title: "Easy Payments",
    desc: "Automated rent tracking",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    bg: "bg-yellow-400",
    title: "Instant Notifications",
    desc: "Stay updated on everything",
  },
];

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, setLoading, isLoading } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'landlord',
      remember: true,
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
  const currentRole = watch('role');

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
     try {
       const response = await apiClient.post<any>('/auth/login', {
         email: data.email,
         password: data.password,
         role: data.role
       });

       login(response.user, response.accessToken);
       toast.success('Login successful!');

       const redirectPath = searchParams.get('redirect');
       const defaultDashboard = data.role === 'landlord' ? '/landlord-dashboard' : '/tenant-dashboard';
       router.push(redirectPath || defaultDashboard);
     } catch (error: any) {
       toast.error(error.message || 'Login failed. Please check your credentials.');
     } finally {
       setLoading(false);
     }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-500"
      style={{ background: "linear-gradient(135deg, #6b74d6 0%, #7b5ea7 100%)" }}>
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex bg-white/10 backdrop-blur-md"
        style={{ minHeight: 480 }}>

        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-center px-10 py-12 w-5/12 border-r border-white/10">
          <Link href="/" className="flex items-center gap-3 mb-10 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">🏠</div>
            <span className="text-white text-xl font-bold tracking-wide">RentEase</span>
          </Link>

          <h1 className="text-white text-3xl font-extrabold leading-tight mb-3">
            Simplify Your Rental Management
          </h1>
          <p className="text-indigo-100/80 text-sm mb-10 leading-relaxed">
            Streamline property management, track payments, and enhance tenant relationships all in one place.
          </p>

          <div className="flex flex-col gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-4 group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${f.bg} shadow-lg group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-indigo-100/60 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white flex flex-col justify-center px-8 md:px-12 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
            <p className="text-gray-500 text-sm">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Toggle */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              {[
                { id: 'landlord', label: 'Landlord', icon: '👤' },
                { id: 'tenant', label: 'Tenant', icon: '🏘️' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setValue('role', r.id as any)}
                  className={`flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all font-medium text-sm
                    ${currentRole === r.id
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-gray-100 bg-white text-gray-400 hover:border-indigo-200"}`}>
                  <span className="text-xl">{r.icon}</span>
                  {r.label}
                </button>
              ))}
            </div>
            {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Email Address</label>
              <input
                {...register('email')}
                type="email"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-100
                  ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-500'}`}
                placeholder="nnamdi@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? "text" : "password"}
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-100 pr-11
                    ${errors.password ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-500'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
                  {showPass ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs font-medium">{errors.password.message}</p>}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  {...register('remember')}
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                />
                <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
              </label>
              <button type="button" onClick={() => router.push('/forgot-password')} className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(90deg, #6b74d6, #7b5ea7)" }}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : 'Sign In'}
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/google`}
              className="w-full py-3 cursor-pointer rounded-xl border-2 border-gray-100 flex items-center justify-center gap-3 font-semibold text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98]">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{" "}
              <Link href="/signup" className="text-indigo-600 cursor-pointer font-bold hover:text-indigo-700 transition-colors">
                Sign up now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
