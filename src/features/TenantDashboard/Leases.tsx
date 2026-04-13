"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { fetchDocumentsByLease, downloadDocument } from "@/services/useFileServiceApi";
import NavBar from "@/components/general/NavBar";
import { 
    Home, 
    Calendar, 
    DollarSign, 
    User, 
    ArrowRight, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    Loader2,
    FileText,
    ExternalLink,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Leases = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [selectedPendingLease, setSelectedPendingLease] = useState<any | null>(null);
    const [isPdfLoading, setIsPdfLoading] = useState(false);

    const { data: leases, isLoading: isLeasesLoading } = useQuery({
        queryKey: ['tenant-leases'],
        queryFn: () => apiClient.get<any[]>('/leases/tenant'),
    });

    const acceptMutation = useMutation({
        mutationFn: (token: string) => apiClient.post('/leases/accept-invite', { token }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-leases'] });
            toast.success('Lease agreement accepted successfully!');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to accept lease');
        }
    });

    if (isLeasesLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const activeLease = leases?.find(l => l.status === 'active');
    const pendingLeases = leases?.filter(l => l.status === 'pending_acceptance');
    const pastLeases = leases?.filter(l => l.status === 'expired' || l.status === 'terminated');

    const handleSignedPdf = async () => {
        if (!activeLease) return;
        setIsPdfLoading(true);
        try {
            const docs = await fetchDocumentsByLease(activeLease.id);
            const pdf = docs.find(
                (d) => d.fileName?.toLowerCase().endsWith('.pdf') || d.mimeType?.includes('pdf')
            );
            if (!pdf) {
                toast.info('No signed PDF found for this lease.');
                return;
            }
            await downloadDocument(pdf.id, pdf.fileName);
        } catch {
            toast.error('Failed to download signed PDF.');
        } finally {
            setIsPdfLoading(false);
        }
    };

    const handleContactLandlord = () => {
        const email = activeLease?.landlord?.email;
        if (!email) {
            toast.info('Landlord email is not available.');
            return;
        }
        window.location.href = `mailto:${email}`;
    };

    return (
        <>
            <NavBar title="My Leases" subtitle="Manage your tenancy agreements and invitations" />

            {pendingLeases && pendingLeases.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4 text-orange-600">
                        <Clock className="w-5 h-5" />
                        <h2 className="text-lg font-bold">Pending Invitations</h2>
                    </div>
                    <div className="grid gap-4">
                        {pendingLeases.map((lease) => (
                            <div key={lease.id} className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 text-orange-600">
                                        <Home className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{lease.property?.addressLine1 || 'Property Invitation'}</h3>
                                        <p className="text-sm text-gray-500">{lease.property?.city}, {lease.property?.state}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-xs font-medium px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md">
                                                ₦{Number(lease.annualRent).toLocaleString()}/yr
                                            </span>
                                            <span className="text-xs font-medium px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md">
                                                {new Date(lease.startDate).toLocaleDateString()} Start
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" className="rounded-xl" onClick={() => setSelectedPendingLease(lease)}>View Details</Button>
                                    <Button 
                                        className="bg-orange-600 hover:bg-orange-700 rounded-xl px-6"
                                        onClick={() => acceptMutation.mutate(lease.inviteToken)}
                                        disabled={acceptMutation.isPending}
                                    >
                                        {acceptMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept & Sign"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <div className="flex items-center gap-2 mb-4 text-indigo-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <h2 className="text-lg font-bold">Active Tenancy</h2>
                </div>
                {activeLease ? (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 md:p-10 grid md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{activeLease.property?.addressLine1}</h3>
                                    <p className="text-gray-400">{activeLease.property?.city}, {activeLease.property?.state}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs font-semibold uppercase tracking-wider">Start Date</span>
                                        </div>
                                        <p className="font-bold text-gray-900">{new Date(activeLease.startDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs font-semibold uppercase tracking-wider">End Date</span>
                                        </div>
                                        <p className="font-bold text-gray-900">{new Date(activeLease.endDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="p-4 bg-indigo-50 rounded-2xl">
                                        <div className="flex items-center gap-2 text-indigo-400 mb-1">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Annual Rent</span>
                                        </div>
                                        <p className="font-bold text-indigo-700 text-lg">₦{Number(activeLease.annualRent).toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <User className="w-4 h-4" />
                                            <span className="text-xs font-semibold uppercase tracking-wider">Landlord</span>
                                        </div>
                                        <p className="font-bold text-gray-900 truncate">{activeLease.landlord?.firstName} {activeLease.landlord?.lastName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-3xl p-8 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-indigo-600" />
                                        Lease Summary
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                                            <span className="text-gray-400">Unit Number</span>
                                            <span className="font-medium text-gray-900">{activeLease.unit?.name || 'Main House'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                                            <span className="text-gray-400">Next Payment</span>
                                            <span className="font-medium text-gray-900">{new Date(activeLease.annualDueDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                                            <span className="text-gray-400">Security Deposit</span>
                                            <span className="font-medium text-gray-900">₦{Number(activeLease.securityDeposit).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-3">
                                    <Button
                                        className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-2xl font-bold shadow-sm flex gap-2"
                                        onClick={handleSignedPdf}
                                        disabled={isPdfLoading}
                                    >
                                        {isPdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                                        Signed PDF
                                    </Button>
                                    <Button
                                        className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold shadow-indigo-100 shadow-lg"
                                        onClick={handleContactLandlord}
                                    >
                                        Contact Landlord
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-20 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No active lease found</h3>
                        <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
                            You don't have an active tenancy agreement yet. Check your invitations or contact your property manager.
                        </p>
                        <Button variant="outline" className="rounded-2xl px-8 h-12 font-bold group" onClick={() => router.push('/')}>
                            Explore Properties
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                )}
            </section>

            {pastLeases && pastLeases.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4 text-gray-500">
                        <Clock className="w-5 h-5" />
                        <h2 className="text-lg font-bold">Past Agreements</h2>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                        {pastLeases.map((lease) => (
                            <div key={lease.id} className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                        <Home className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{lease.property?.addressLine1}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(lease.startDate).getFullYear()} - {new Date(lease.endDate).getFullYear()}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                    {lease.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {selectedPendingLease && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedPendingLease(null)}>
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            onClick={() => setSelectedPendingLease(null)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Lease Invitation Details</h2>
                                <p className="text-sm text-gray-400">{selectedPendingLease.property?.addressLine1}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Start Date</span>
                                    </div>
                                    <p className="font-bold text-gray-900">{new Date(selectedPendingLease.startDate).toLocaleDateString()}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">End Date</span>
                                    </div>
                                    <p className="font-bold text-gray-900">{new Date(selectedPendingLease.endDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-indigo-50 rounded-2xl">
                                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                                    <DollarSign className="w-4 h-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Annual Rent</span>
                                </div>
                                <p className="font-bold text-indigo-700 text-lg">₦{Number(selectedPendingLease.annualRent).toLocaleString()}</p>
                            </div>
                            {selectedPendingLease.termsText && (
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Lease Terms</p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedPendingLease.termsText}</p>
                                </div>
                            )}
                        </div>
                        <Button className="w-full mt-6 rounded-2xl" variant="outline" onClick={() => setSelectedPendingLease(null)}>
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Leases;
