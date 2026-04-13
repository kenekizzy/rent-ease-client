'use client'

import React, { useState } from 'react'
import NavBar from '../../components/general/NavBar'
import { TrendingUp, Clock, AlertTriangle, FileText, Download, Loader2, BarChart2 } from "lucide-react";
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { useUIStore } from '@/stores/ui-store';

interface Payment {
    id: string;
    tenant?: { firstName?: string; lastName?: string };
    property?: { name?: string };
    unit?: { unitNumber?: string };
    dueDate: string;
    amount: number;
    status: string;
    transactionDocument?: string;
}

interface PropertyBreakdown {
    name: string;
    total: number;
}

interface PaymentReport {
    year: number;
    totalRevenue: number;
    monthlyBreakdown?: number[];
    propertyBreakdown: Record<string, PropertyBreakdown>;
}

function exportCsv(rows: Payment[]) {
    const headers = ['Tenant', 'Property', 'Unit', 'Due Date', 'Amount', 'Status'];
    const rowData = rows.map(p => [
        `${p.tenant?.firstName ?? ''} ${p.tenant?.lastName ?? ''}`.trim() || '—',
        p.property?.name ?? '—',
        p.unit?.unitNumber ?? '—',
        p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-US') : '—',
        p.amount.toFixed(2),
        p.status,
    ]);
    const csv = [headers, ...rowData].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payments.csv';
    a.click();
    URL.revokeObjectURL(url);
}

const RentPayment = () => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [reportData, setReportData] = useState<PaymentReport | null>(null);
    const currentYear = new Date().getFullYear();
    const { openModal, modalData } = useUIStore();
    const receiptPayment: Payment | null = modalData ?? null;

    const { data: payments, isLoading } = useQuery<Payment[]>({
        queryKey: ['landlord-payments'],
        queryFn: () => apiClient.get<Payment[]>('/payments'),
    });

    const reportMutation = useMutation({
        mutationFn: () => apiClient.get<PaymentReport>(`/payments/report?year=${currentYear}`),
        onSuccess: (data) => setReportData(data),
    });

    const filteredPayments = payments?.filter(p =>
        (statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase()) &&
        (!dateFilter || new Date(p.dueDate) >= new Date(dateFilter))
    );

    const totalCollected = payments
        ?.filter(p => p.status.toLowerCase() === 'paid')
        .reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0;

    const pendingTotal = payments
        ?.filter(p => p.status.toLowerCase() === 'pending')
        .reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0;

    const pendingCount = payments?.filter(p => p.status.toLowerCase() === 'pending').length ?? 0;

    const overdueTotal = payments
        ?.filter(p => p.status.toLowerCase() === 'overdue')
        .reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

    const getTenantName = (p: Payment) => {
        if (p.tenant?.firstName || p.tenant?.lastName) {
            return `${p.tenant.firstName ?? ''} ${p.tenant.lastName ?? ''}`.trim();
        }
        return '—';
    };

    const getPropertyLabel = (p: Payment) => {
        const parts = [p.property?.name, p.unit?.unitNumber].filter(Boolean);
        return parts.length ? parts.join(' ') : '—';
    };

    return (
        <>
            <NavBar title="Rent Payments" subtitle="Track and manage rent payments" />
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Total Collected</p>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCollected)}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">This month</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Pending Payments</p>
                        <Clock className="w-5 h-5 text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingTotal)}</p>
                    <p className="text-xs text-gray-400 mt-1">{pendingCount} tenant{pendingCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Overdue</p>
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(overdueTotal)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {overdueTotal === 0 ? 'No overdue payments' : 'Overdue'}
                    </p>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <select
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="overdue">Overdue</option>
                        </select>
                        <input
                            type="date"
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500"
                            value={dateFilter}
                            onChange={e => setDateFilter(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => reportMutation.mutate()}
                            disabled={reportMutation.isPending}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
                        >
                            {reportMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <FileText className="w-4 h-4" />
                            )}
                            Generate Report
                        </button>
                        <button
                            onClick={() => exportCsv(filteredPayments ?? [])}
                            className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        <span className="ml-2 text-sm text-gray-500">Loading payments...</span>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Tenant</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Property</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Due Date</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Amount</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Status</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments && filteredPayments.length > 0 ? (
                                filteredPayments.map((p) => (
                                    <tr key={p.id} className="border-b border-gray-50 last:border-0">
                                        <td className="py-4 text-sm font-semibold text-gray-900">{getTenantName(p)}</td>
                                        <td className="py-4 text-sm text-gray-600">{getPropertyLabel(p)}</td>
                                        <td className="py-4 text-sm text-gray-600">
                                            {p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="py-4 text-sm font-semibold text-gray-900">{formatCurrency(p.amount)}</td>
                                        <td className="py-4">
                                            <span
                                                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                                    p.status.toLowerCase() === 'paid'
                                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                                        : p.status.toLowerCase() === 'pending'
                                                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                                            : 'bg-red-50 text-red-700 border border-red-200'
                                                }`}
                                            >
                                                {p.status.charAt(0).toUpperCase() + p.status.slice(1).toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <button
                                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                                onClick={() => {
                                                    if (p.status.toLowerCase() === 'paid') {
                                                        openModal('viewReceipt', p);
                                                    } else {
                                                        toast.success('Reminder sent');
                                                    }
                                                }}
                                            >
                                                {p.status.toLowerCase() === 'paid' ? 'View Receipt' : 'Send Reminder'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                                        No payments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Report Results */}
            {reportData && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart2 className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-base font-semibold text-gray-900">Report — {reportData.year}</h3>
                    </div>
                    <div className="mb-4">
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalRevenue)}</p>
                    </div>
                    {Object.keys(reportData.propertyBreakdown).length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Property Breakdown</p>
                            <div className="space-y-2">
                                {Object.values(reportData.propertyBreakdown).map((prop) => (
                                    <div key={prop.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                        <span className="text-sm text-gray-700">{prop.name}</span>
                                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(prop.total)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* View Receipt Modal */}
            <Modal type="viewReceipt" title="Payment Receipt">
                {receiptPayment && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tenant</p>
                                <p className="text-sm font-semibold text-gray-900">{getTenantName(receiptPayment)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Property</p>
                                <p className="text-sm font-semibold text-gray-900">{getPropertyLabel(receiptPayment)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Amount</p>
                                <p className="text-sm font-semibold text-gray-900">{formatCurrency(receiptPayment.amount)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {receiptPayment.dueDate
                                        ? new Date(receiptPayment.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                        : '—'}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Reference</p>
                            <p className="text-sm font-mono text-gray-700">{receiptPayment.transactionDocument ?? receiptPayment.id}</p>
                        </div>
                        <div className="pt-2 border-t border-gray-100">
                            <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                                Paid
                            </span>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    )
}

export default RentPayment
