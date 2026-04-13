'use client'

import React, { useState } from 'react'
import NavBar from '../../components/general/NavBar'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Property, Lease } from '@/types'
import { Building2, User, Loader2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { LeaseDetailModal } from './components/LeaseDetailModal'

const Tenants = () => {
    const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);
    const { data: properties, isLoading, error } = useQuery({
        queryKey: ['properties'],
        queryFn: () => apiClient.get<Property[]>('/properties'),
    });

    if (isLoading) {
        return (
            <>
                <NavBar title="Tenant Management" subtitle="View and manage tenant leases" />
                <div className="flex h-[400px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <NavBar title="Tenant Management" subtitle="View and manage tenant leases" />
                <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <div>
                        <p className="text-red-500 font-bold text-lg">Failed to load tenants</p>
                        <p className="text-gray-500 text-sm">Please check your connection and try again.</p>
                    </div>
                </div>
            </>
        );
    }

    // Filter properties to only those that have at least one lease (any status)
    const propertiesWithLeases = properties?.filter(p => p.leases && p.leases.length > 0) || [];

    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName) return '?';
        return `${firstName[0]}${lastName?.[0] || ''}`.toUpperCase();
    }

    return (
        <div className="space-y-6">
            <NavBar title="Tenants & Leases" subtitle="Manage active tenancies across your properties" />

            {propertiesWithLeases.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No active leases found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        You haven't invited any tenants or started any leases yet. Head over to the Properties page to invite your first tenant.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {propertiesWithLeases.map((property) => (
                        <div key={property.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Property Header */}
                            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{property.name}</h3>
                                        <p className="text-xs text-gray-400 truncate max-w-[300px]">{property.addressLine1}, {property.city}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Total Leases</span>
                                    <span className="text-sm font-bold text-indigo-600">{property.leases?.length}</span>
                                </div>
                            </div>

                            {/* Leases Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-white">
                                            <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Tenant</th>
                                            <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Unit</th>
                                            <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Lease Period</th>
                                            <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Rent/yr</th>
                                            <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Status</th>
                                            <th className="text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {property.leases?.map((lease) => (
                                            <tr key={lease.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                                                            {lease.tenant ? getInitials(lease.tenant.firstName, lease.tenant.lastName) : '?'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">
                                                                {lease.tenant ? `${lease.tenant.firstName} ${lease.tenant.lastName}` : (lease.tenantEmail ?? 'Unknown')}
                                                            </p>
                                                            <p className="text-xs text-gray-400">{lease.tenant ? lease.tenant.email : (lease.tenantEmail ?? 'No email')}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {lease.unit?.name || 'Main Unit'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-700 font-medium">
                                                            {format(new Date(lease.startDate), 'MMM d, yyyy')}
                                                        </span>
                                                        <span className="text-[11px] text-gray-400">to {format(new Date(lease.endDate), 'MMM d, yyyy')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        ₦{Number(lease.annualRent).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                                                        ${lease.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                            lease.status === 'pending_acceptance' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                        {lease.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button
                                                        onClick={() => setSelectedLeaseId(lease.id)}
                                                        className="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase tracking-wide cursor-pointer"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <LeaseDetailModal
                leaseId={selectedLeaseId}
                onClose={() => setSelectedLeaseId(null)}
            />
        </div>
    )
}

export default Tenants
