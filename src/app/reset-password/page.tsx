'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';

const schema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      toast.error('Invalid or missing reset token. Please request a new link.');
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword: data.newPassword });
      toast.success('Password reset successfully. You can now log in.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #6b74d6 0%, #7b5ea7 100%)' }}
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl px-8 py-10 text-center">
          <p className="text-red-600 font-semibold mb-4">Invalid or missing reset token.</p>
          <Link href="/forgot-password" className="text-indigo-600 font-semibold text-sm hover:text-indigo-700">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #6b74d6 0%, #7b5ea7 100%)' }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h2>
        <p className="text-gray-500 text-sm mb-8">Enter your new password below.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">New Password</label>
            <div className="relative">
              <input
                {...register('newPassword')}
                type={showPass ? 'text' : 'password'}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-100 pr-11 transition-all
                  ${errors.newPassword ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-500'}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                {showPass ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500 text-xs font-medium">{errors.newPassword.message}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-100 pr-11 transition-all
                  ${errors.confirmPassword ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-500'}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                {showConfirm ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs font-medium">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(90deg, #6b74d6, #7b5ea7)' }}
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password'}
          </button>

          <p className="text-center text-sm text-gray-500">
            <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
