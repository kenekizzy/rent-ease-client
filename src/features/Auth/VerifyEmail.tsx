'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/services/api'
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const VerifyEmail = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email...')
  const verificationStarted = useRef(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Missing verification token.')
      return
    }

    if (verificationStarted.current) return
    verificationStarted.current = true

    const verify = async () => {
      try {
        await apiClient.post('/auth/verify-email', { token })
        setStatus('success')
        setMessage('Email verified successfully! Redirecting you to login...')
        
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } catch (error: any) {
        setStatus('error')
        setMessage(error.message || 'Verification failed. The link may be expired or invalid.')
      }
    }

    verify()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
      style={{ background: "linear-gradient(135deg, #6b74d6 0%, #7b5ea7 100%)" }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="mb-6 flex justify-center">
          {status === 'loading' && (
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center animate-shake">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {status === 'loading' && "Email Verification"}
          {status === 'success' && "Verification Successful"}
          {status === 'error' && "Verification Failed"}
        </h1>

        <p className={`text-gray-600 mb-8 leading-relaxed ${status === 'error' ? 'text-red-600' : ''}`}>
          {message}
        </p>

        {status === 'success' && (
          <button 
            onClick={() => router.push('/login')}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group"
          >
            Go to Login
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <Link 
              href="/signup"
              className="block w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all"
            >
              Back to Sign Up
            </Link>
            <Link 
              href="/login"
              className="block w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
            >
              Go to Login
            </Link>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 italic text-xs text-gray-400">
          Step toward a better property management experience.
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail