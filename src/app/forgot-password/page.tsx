'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/services/api';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: data.email });
    } catch {
      // Swallow errors — always show success to prevent enumeration
    } finally {
      setIsLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #6b74d6 0%, #7b5ea7 100%)' }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl px-8 py-10">
        <Link href="/login" className="flex items-center gap-2 mb-8 text-indigo-600 hover:text-indigo-700 text-sm font-semibold">
          ← Back to Login
        </Link>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password</h2>
        <p className="text-gray-500 text-sm mb-8">
          Enter your email and we'll send you a reset link.
        </p>

        {submitted ? (
          <div className="rounded-xl bg-green-50 border border-green-200 p-5 text-center">
            <p className="text-green-700 font-semibold text-sm">
              If an account with that email exists, a password reset link has been sent. Please check your inbox.
            </p>
            <Link href="/login" className="mt-4 inline-block text-indigo-600 font-semibold text-sm hover:text-indigo-700">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Email Address</label>
              <input
                {...register('email')}
                type="email"
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all
                  ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-500'}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(90deg, #6b74d6, #7b5ea7)' }}
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
