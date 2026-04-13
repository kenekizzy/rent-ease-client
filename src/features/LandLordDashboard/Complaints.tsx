'use client'

import React, { useState } from 'react'
import NavBar from '../../components/general/NavBar'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Filter, AlertTriangle, CheckCircle2, Eye, MessageSquareOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ComplaintDetailPanel } from './components/ComplaintDetailPanel';

const priorityStyle: Record<string, string> = {
    high: "bg-red-50 text-red-600 border-red-200 shadow-sm",
    medium: "bg-amber-50 text-amber-600 border-amber-200 shadow-sm",
    low: "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm",
};

const statusStyle: Record<string, string> = {
    'in-progress': "bg-blue-50 text-blue-700 border-blue-200 shadow-sm",
    'in_progress': "bg-blue-50 text-blue-700 border-blue-200 shadow-sm",
    open: "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm",
};

const Complaints = () => {
    const queryClient = useQueryClient();
    const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const { data: complaints, isLoading, error } = useQuery({
        queryKey: ['landlord-complaints'],
        queryFn: () => apiClient.get<any[]>('/complaints'),
    });

    const resolveMutation = useMutation({
        mutationFn: (complaintId: string) =>
            apiClient.patch(`/complaints/${complaintId}`, { status: 'resolved' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['landlord-complaints'] });
            toast.success('Complaint resolved successfully');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to resolve complaint');
        }
    });

    const updateComplaintMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { status: string; resolutionNotes: string } }) =>
            apiClient.patch(`/complaints/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['landlord-complaints'] });
            setIsDetailOpen(false);
            setSelectedComplaint(null);
            toast.success('Complaint updated successfully');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to update complaint');
        }
    });

    function handleOpenDetail(complaint: any) {
        setSelectedComplaint(complaint);
        setIsDetailOpen(true);
    }

    function handleCloseDetail() {
        setIsDetailOpen(false);
        setSelectedComplaint(null);
    }

    function handleSubmitDetail(id: string, data: { status: string; resolutionNotes: string }) {
        updateComplaintMutation.mutate({ id, data });
    }

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                <AlertTriangle className="w-12 h-12 text-red-400" />
                <p className="text-gray-900 font-bold">Failed to load requests</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
        );
    }

    return (
        <>
        <>
            <NavBar title="Service Requests" subtitle="Manage tenant maintenance and support issues" />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-7 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50 bg-gradient-to-br from-white to-gray-50/50">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Active Inquiries</h2>
                        <p className="text-sm text-gray-400">Showing {complaints?.length || 0} maintenance issues from your portfolio</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input placeholder="Search request ID or tenant..." className="pl-10 w-[240px] h-11 bg-gray-50 border-gray-100 focus:bg-white rounded-xl transition-all" />
                        </div>
                        <Button variant="outline" className="h-11 rounded-xl px-5 gap-2 border-gray-200 font-bold hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all">
                            <Filter className="w-4 h-4" />
                            Refine
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/30">
                                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest px-8 py-5">Initiator</th>
                                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest px-8 py-5">Property</th>
                                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest px-8 py-5">Request Details</th>
                                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest px-8 py-5 text-center">Priority</th>
                                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest px-8 py-5">Status</th>
                                <th className="text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest px-8 py-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {complaints && complaints.length > 0 ? (
                                complaints.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-indigo-50/10 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center font-bold text-xs text-indigo-600 shadow-sm border border-indigo-100/50">
                                                    {c.tenant ? `${c.tenant.firstName[0]}${c.tenant.lastName[0]}` : 'T'}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-gray-900 leading-none mb-1 group-hover:text-indigo-700 transition-colors">
                                                        {c.tenant ? `${c.tenant.firstName} ${c.tenant.lastName}` : 'System User'}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 font-medium tracking-tight">Opened {new Date(c.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                                <p className="text-[13px] text-gray-600 font-bold whitespace-nowrap">{c.property?.name ?? 'Main Property'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="max-w-[280px]">
                                                <p className="text-[14px] text-gray-900 font-bold mb-1 truncate">{c.title}</p>
                                                <p className="text-xs text-gray-400 line-clamp-1 leading-relaxed">{c.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-lg border tracking-wider leading-none
                                                ${priorityStyle[c.priority.toLowerCase()]}`}>
                                                {c.priority}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-lg border tracking-wider leading-none shadow-sm
                                                ${statusStyle[c.status.toLowerCase()] || statusStyle.open}`}>
                                                {c.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" onClick={() => handleOpenDetail(c)}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                {c.status !== 'resolved' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 px-4 text-emerald-600 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-700 rounded-xl border border-emerald-100/50 bg-emerald-50/30 transition-all"
                                                        onClick={() => resolveMutation.mutate(c.id)}
                                                        disabled={resolveMutation.isPending}
                                                    >
                                                        {resolveMutation.isPending ? 'Processing' : (
                                                            <div className="flex items-center gap-1.5">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Resolve
                                                            </div>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                                            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-100 border border-gray-100/50">
                                                <MessageSquareOff className="w-10 h-10 text-indigo-100" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Service Requests</h3>
                                            <p className="text-sm text-gray-400 mb-10 leading-relaxed text-center">
                                                Everything is running smoothly. Your tenants haven't reported any issues or maintenance requests currently.
                                            </p>
                                            <div className="flex items-center gap-2 p-2 px-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Awaiting Live Feed</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>

        <ComplaintDetailPanel
            complaint={isDetailOpen ? selectedComplaint : null}
            onClose={handleCloseDetail}
            onSubmit={handleSubmitDetail}
        />
        </>
    );
};

export default Complaints