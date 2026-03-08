"use client"

import NavBar from '@/components/general/NavBar';
import { Plus, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { ComplaintForm } from "./components/ComplaintForm";

/**
 * Tenant Complaints Page
 * Allows tenants to view their complaint history and submit new requests.
 */
const Complaints = () => {
    const { openModal } = useUIStore();

    // Fetch complaint history using React Query
    const { data: complaints, isLoading } = useQuery({
        queryKey: ['complaints'],
        queryFn: () => apiClient.get<any[]>('/complaints'),
    });

    return (
        <>
            <NavBar title="Complaints" subtitle="Manage your maintenance requests" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">My Complaints</h2>
                    <p className="text-sm text-gray-400">Track and submit maintenance requests</p>
                </div>
                <Button
                    onClick={() => openModal('createComplaint')}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Complaint
                </Button>
            </div>

            {/* History Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Complaint History</h3>

                {isLoading ? (
                    <div className="flex py-12 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {complaints?.map((c: any) => (
                            <div key={c.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{c.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Submitted on {new Date(c.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${c.status === 'open'
                                        ? 'bg-orange-50 text-orange-600 border-orange-200'
                                        : 'bg-green-50 text-green-600 border-green-200'
                                        }`}>
                                        {c.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">{c.description}</p>
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    {c.priority.toUpperCase()} PRIORITY
                                    <span className="mx-2">•</span>
                                    Property: {c.property?.name || 'Unknown'}
                                </div>
                            </div>
                        ))}
                        {complaints?.length === 0 && (
                            <div className="py-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
                                No complaints submitted yet.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Submit Modal */}
            <Modal
                type="createComplaint"
                title="Submit New Complaint"
                description="Please provide details about the maintenance issue you're facing."
            >
                <ComplaintForm />
            </Modal>
        </>
    );
};

export default Complaints;