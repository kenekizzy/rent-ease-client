'use client';

import React from 'react';
import { X, CheckCircle2, Clock, AlertCircle, MessageSquare } from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: any | null;
  onClose: () => void;
}

const statusStyle: Record<string, string> = {
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  open: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const StatusIcon = ({ status }: { status: string }) => {
  const s = status?.toLowerCase();
  if (s === 'resolved') return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (s === 'in-progress' || s === 'in_progress') return <Clock className="w-3.5 h-3.5" />;
  return <AlertCircle className="w-3.5 h-3.5" />;
};

export function ComplaintDetailModal({ complaint, onClose }: ComplaintDetailModalProps) {
  if (!complaint) return null;

  const status = complaint.status?.toLowerCase() ?? 'open';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">Complaint Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">View your complaint and landlord response</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {/* Title + Status */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">{complaint.title}</h3>
              <span
                className={`inline-flex items-center gap-1 text-[10px] uppercase font-black px-2.5 py-1 rounded-lg border tracking-wider ${statusStyle[status] ?? statusStyle.open}`}
              >
                <StatusIcon status={status} />
                {complaint.status?.replace('_', ' ')}
              </span>
            </div>

            {/* Full Description */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                {complaint.description || 'No description provided.'}
              </p>
            </div>

            {/* Landlord Resolution Notes */}
            {complaint.resolutionNotes && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Landlord Response
                </p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-sm text-emerald-800 leading-relaxed">
                    {complaint.resolutionNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Submitted date */}
            {complaint.createdAt && (
              <p className="text-xs text-gray-400">
                Submitted on{' '}
                {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
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

export default ComplaintDetailModal;
