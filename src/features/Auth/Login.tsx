'use client'

import { useState } from 'react';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

      login(response.user, response.token);
      toast.success('Login successful!');

      // Redirect based on role
      if (data.role === 'landlord') {
        router.push('/landlord-dashboard');
      } else {
        router.push('/tenant-dashboard');
      }
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
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
              <button type="button" className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(90deg, #6b74d6, #7b5ea7)" }}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : 'Sign In'}
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{" "}
              <Link href="/signup" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
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
