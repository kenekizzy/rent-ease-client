import React, { Suspense } from 'react'
import Login from '@/features/Auth/Login'
import { Loader2 } from 'lucide-react'

const page = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-indigo-600">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    }>
      <Login />
    </Suspense>
  )
}

export default page