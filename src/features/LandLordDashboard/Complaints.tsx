'use client'

import React from 'react'
import NavBar from '../../components/general/NavBar'

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

const priorityStyle: Record<string, string> = {
    high: "bg-red-50 text-red-600 border-red-200",
    medium: "bg-yellow-50 text-yellow-600 border-yellow-200",
    low: "bg-green-50 text-green-600 border-green-200",
};

const statusStyle: Record<string, string> = {
    'in-progress': "bg-blue-50 text-blue-700 border-blue-200",
    open: "bg-orange-50 text-orange-700 border-orange-200",
    resolved: "bg-green-50 text-green-700 border-green-200",
};

/**
 * Landlord Complaints View
 * Displays all maintenance requests from tenants.
 */
const Complaints = () => {
    // Fetch all complaints for the landlord
    const { data: complaints, isLoading, error } = useQuery({
        queryKey: ['landlord-complaints'],
        queryFn: () => apiClient.get<any[]>('/complaints'),
    });

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <>
            <NavBar title="Complaints" subtitle="View and manage tenant maintenance requests" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Maintenance Requests</h2>
                        <p className="text-sm text-gray-400">Total requests: {complaints?.length || 0}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input placeholder="Search issues..." className="pl-9 w-[200px]" />
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Filter
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Tenant</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Property</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Issue</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Priority</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Status</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints?.map((c: any) => (
                                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4">
                                        <p className="text-sm font-semibold text-gray-900">{c.tenant?.name || 'Tenant'}</p>
                                        <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="py-4 text-sm text-gray-600">{c.property?.name}</td>
                                    <td className="py-4">
                                        <p className="text-sm text-gray-900 font-medium">{c.title}</p>
                                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{c.description}</p>
                                    </td>
                                    <td className="py-4">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${priorityStyle[c.priority.toLowerCase()]}`}>
                                            {c.priority}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${statusStyle[c.status.toLowerCase()]}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" className="text-indigo-600 font-medium">View</Button>
                                            {c.status !== 'resolved' && (
                                                <Button variant="ghost" size="sm" className="text-green-600 font-medium hover:text-green-700 hover:bg-green-50">Resolve</Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {complaints?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-400">
                                        No maintenance requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Complaints