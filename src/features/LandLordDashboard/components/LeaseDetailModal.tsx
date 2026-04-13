'use client';

import React from 'react';
import { X, Loader2, User, Calendar, DollarSign, Shield, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { Lease, Payment } from '@/types';
import { format } from 'date-fns';

interface LeaseWithPayments extends Lease {
  payments?: Payment[];
}

interface LeaseDetailModalProps {
  leaseId: string | null;
  onClose: () => void;
}

const statusStyle: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
};

export function LeaseDetailModal({ leaseId, onClose }: LeaseDetailModalProps) {
  const { data: lease, isLoading, error } = useQuery<LeaseWithPayments>({
    queryKey: ['lease-detail', leaseId],
    queryFn: () => apiClient.get<LeaseWithPayments>(`/leases/${leaseId}`),
    enabled: !!leaseId,
  });

  const isOpen = !!leaseId;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-white rounded-t-2xl">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Lease Details</h2>
              <p className="text-xs text-gray-400 mt-0.5">Full lease information and payment history</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {isLoading && (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-sm text-red-500 font-medium">Failed to load lease details</p>
              </div>
            )}

            {lease && (
              <div className="space-y-6">
                {/* Tenant Info */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3 mb-1">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tenant</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 mt-2">
                    {lease.tenant
                      ? `${lease.tenant.firstName} ${lease.tenant.lastName}`
                      : (lease.tenantEmail ?? 'Unknown Tenant')}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {lease.tenant?.email ?? lease.tenantEmail ?? '—'}
                  </p>
                </div>

                {/* Lease Dates + Financial Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Lease Period</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {format(new Date(lease.startDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      to {format(new Date(lease.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Annual Rent</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      ₦{Number(lease.annualRent).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Security Deposit</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      ₦{Number(lease.securityDeposit).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Payment History */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Payment History</h3>
                  {!lease.payments || lease.payments.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-sm text-gray-400">No payment records found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Due Date</th>
                            <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Paid Date</th>
                            <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Amount</th>
                            <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {lease.payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3 text-gray-700">
                                {format(new Date(payment.dueDate), 'MMM d, yyyy')}
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {payment.paidDate
                                  ? format(new Date(payment.paidDate), 'MMM d, yyyy')
                                  : '—'}
                              </td>
                              <td className="px-4 py-3 font-bold text-gray-900">
                                ₦{Number(payment.amount).toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyle[payment.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                  {payment.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default LeaseDetailModal;
