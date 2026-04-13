import React, { Suspense } from 'react';
import AuthCallback from "@/features/Auth/AuthCallback";
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-indigo-600">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    }>
      <AuthCallback />
    </Suspense>
  );
}
