"use client"

import { useState } from "react";
import NavBar from '@/components/general/NavBar';
import { 
    Plus, 
    Clock, 
    Loader2, 
    AlertTriangle, 
    CheckCircle2, 
    Search, 
    Filter,
    MessageSquare,
    ChevronRight,
    Wrench,
    AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { ComplaintForm } from "./components/ComplaintForm";
import { ComplaintDetailModal } from "./components/ComplaintDetailModal";
import { Input } from "@/components/ui/input";

const Complaints = () => {
    const { openModal } = useUIStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);

    // Fetch complaint history
    const { data: complaints, isLoading } = useQuery({
        queryKey: ['tenant-complaints'],
        queryFn: () => apiClient.get<any[]>('/complaints'),
    });

    const filteredComplaints = complaints?.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             c.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'resolved': return 'bg-green-50 text-green-600 border-green-200';
            case 'closed': return 'bg-gray-50 text-gray-500 border-gray-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-500 bg-red-50';
            case 'high': return 'text-orange-500 bg-orange-50';
            case 'medium': return 'text-blue-500 bg-blue-50';
            case 'low': return 'text-gray-500 bg-gray-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    return (
        <>
            <NavBar title="Maintenance" subtitle="Track and report property maintenance issues" />

            {/* Header / Stats Summary */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-400 mb-1">Active Requests</p>
                        <p className="text-3xl font-bold text-gray-900">{complaints?.filter(c => c.status !== 'resolved' && c.status !== 'closed').length || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                        <Wrench className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-400 mb-1">Total Resolved</p>
                        <p className="text-3xl font-bold text-gray-900">{complaints?.filter(c => c.status === 'resolved').length || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <Button 
                        onClick={() => openModal('createComplaint')}
                        className="bg-indigo-600 hover:bg-indigo-700 h-10 rounded-2xl font-bold shadow-lg shadow-indigo-100 gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Request
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-2">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <Input 
                        placeholder="Search requests..." 
                        className="pl-10 h-11 rounded-2xl bg-white border-gray-100 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
                    {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                                filterStatus === status 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'bg-white text-gray-500 border border-gray-100 hover:border-indigo-200'
                            }`}
                        >
                            {status.charAt(0) + status.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Section */}
            {isLoading ? (
                <div className="flex py-24 items-center justify-center bg-white rounded-3xl border border-gray-50 shadow-sm">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                        <p className="text-gray-400 font-medium">Fetching history...</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredComplaints?.map((c: any) => (
                        <div 
                            key={c.id} 
                            className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-gray-100/50 transition-all group flex flex-col md:flex-row md:items-center gap-6"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-md ${getPriorityColor(c.priority)}`}>
                                        {c.priority}
                                    </span>
                                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border ${getStatusColor(c.status)}`}>
                                        {c.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-[10px] text-gray-300 font-bold ml-auto md:hidden">#{c.id.slice(0, 8)}</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">{c.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{c.description}</p>
                                
                                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        Submitted {new Date(c.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        Property: {c.property?.addressLine1 || 'Main Residence'}
                                    </div>
                                    {c.status === 'resolved' && (
                                        <div className="flex items-center gap-1.5 text-green-600">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Resolved {new Date(c.resolvedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between md:justify-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                                <div className="hidden md:flex flex-col items-end mr-4">
                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Report ID</p>
                                    <p className="text-sm font-mono text-gray-400">#{c.id.slice(0, 8)}</p>
                                </div>
                                <Button variant="ghost" className="rounded-xl h-12 w-12 p-0 text-indigo-600 hover:bg-indigo-50" onClick={() => setSelectedComplaint(c)}>
                                    <MessageSquare className="w-5 h-5" />
                                </Button>
                                <Button variant="outline" className="rounded-xl px-6 h-12 font-bold group border-gray-100" onClick={() => setSelectedComplaint(c)}>
                                    Track
                                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    
                    {filteredComplaints?.length === 0 && (
                        <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <AlertTriangle className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No maintenance requests found</h3>
                            <p className="text-gray-400 max-w-sm mb-0">
                                {searchTerm || filterStatus !== 'all' 
                                    ? "No results matching your filters. Try clearing search or status."
                                    : "Everying looks good! When something breaks, report it here."}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* History Modal */}
            <Modal
                type="createComplaint"
                title="Submit New Request"
                description="Our maintenance team will review your report and get back to you shortly."
            >
                <ComplaintForm />
            </Modal>

            <ComplaintDetailModal
                complaint={selectedComplaint}
                onClose={() => setSelectedComplaint(null)}
            />
        </>
    );
};

export default Complaints;