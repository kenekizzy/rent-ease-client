import React, { Suspense } from 'react';
import AcceptInvite from "@/features/Auth/AcceptInvite";
import { Loader2 } from 'lucide-react';

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-indigo-600">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
        }>
            <AcceptInvite />
        </Suspense>
    );
}
