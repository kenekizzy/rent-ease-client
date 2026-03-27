'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api';
import { Lease } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Building2, Calendar, BadgeDollarSign, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth';

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5">{icon}</div>
            <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-sm text-gray-800 font-medium">{value}</p>
            </div>
        </div>
    );
}

const AcceptInvite = () => {
  const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const { user } = useAuthStore();

    const [lease, setLease] = useState<Lease | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [accepting, setAccepting] = useState(false);
    const [accepted, setAccepted] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('No invite token provided.');
            setLoading(false);
            return;
        }
        apiClient.get<Lease>(`/leases/invite/${token}`)
            .then((data) => setLease(data))
            .catch(() => setError('This invitation is invalid or has already been used.'))
            .finally(() => setLoading(false));
    }, [token]);

    const handleAccept = async () => {
        if (!user) {
            // Redirect to login, then come back
            router.push(`/login?redirect=/accept-invite?token=${token}`);
            return;
        }
        setAccepting(true);
        try {
            await apiClient.post('/leases/accept-invite', { token });
            setAccepted(true);
            toast.success('Lease accepted! Welcome to your new home.');
        } catch (err: any) {
            toast.error(err?.message ?? 'Failed to accept invitation.');
        } finally {
            setAccepting(false);
        }
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    // ── Error state ──────────────────────────────────────────────────────────
    if (error || !lease) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <KeyRound className="w-7 h-7 text-red-400" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Invalid Invitation</h1>
                    <p className="text-gray-500 text-sm">{error ?? 'Something went wrong.'}</p>
                    <Button variant="outline" onClick={() => router.push('/')}>Go Home</Button>
                </div>
            </div>
        );
    }

    // ── Success state ────────────────────────────────────────────────────────
    if (accepted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-5">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">You're all set! 🎉</h1>
                    <p className="text-gray-500 text-sm">
                        Your lease has been activated. You can now access your tenant dashboard.
                    </p>
                    <Button onClick={() => router.push('/tenant-dashboard')} className="w-full">
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const p = lease.property;
    const address = p ? `${p.addressLine1}${lease.unit ? ` – ${lease.unit}` : ''}` : '—';
    const startDate = new Date(lease.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const endDate = new Date(lease.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    // ── Main invite view ─────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full space-y-6">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-8 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-white text-2xl font-bold">Rental Invitation</h1>
                        <p className="text-indigo-200 text-sm mt-1">You've been invited to sign a lease</p>
                    </div>

                    {/* Lease details */}
                    <div className="px-6 py-6 space-y-4">
                        <DetailRow icon={<Building2 className="w-4 h-4 text-indigo-400" />} label="Property" value={address} />
                        <DetailRow
                            icon={<Calendar className="w-4 h-4 text-indigo-400" />}
                            label="Lease Period"
                            value={`${startDate} → ${endDate}`}
                        />
                        <DetailRow
                            icon={<BadgeDollarSign className="w-4 h-4 text-indigo-400" />}
                            label="Annual Rent"
                            value={`₦${Number(lease.annualRent).toLocaleString()}`}
                        />
                        <DetailRow
                            icon={<KeyRound className="w-4 h-4 text-indigo-400" />}
                            label="Security Deposit"
                            value={`₦${Number(lease.securityDeposit).toLocaleString()}`}
                        />
                    </div>

                    {/* CTA */}
                    <div className="px-6 pb-6 space-y-3">
                        {!user && (
                            <p className="text-xs text-center text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                You need to be <strong>logged in</strong> to accept this invitation.
                            </p>
                        )}
                        <Button
                            className="w-full flex items-center gap-2"
                            onClick={handleAccept}
                            disabled={accepting}
                        >
                            {accepting
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Accepting...</>
                                : <><CheckCircle2 className="w-4 h-4" /> {user ? 'Accept Invitation' : 'Log In & Accept'}</>
                            }
                        </Button>
                        <Button variant="ghost" className="w-full text-gray-400" onClick={() => router.push('/')}>
                            Decline
                        </Button>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400">
                    This invitation was sent by your landlord. If you did not expect this, you can safely ignore it.
                </p>
            </div>
        </div>
    );
}

export default AcceptInvite