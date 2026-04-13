'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComplaintDetailPanelProps {
  complaint: any | null;
  onClose: () => void;
  onSubmit?: (id: string, data: { status: string; resolutionNotes: string }) => void;
}

const statusStyle: Record<string, string> = {
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'in_progress': 'bg-blue-50 text-blue-700 border-blue-200',
  open: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const priorityStyle: Record<string, string> = {
  high: 'bg-red-50 text-red-600 border-red-200',
  medium: 'bg-amber-50 text-amber-600 border-amber-200',
  low: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const StatusIcon = ({ status }: { status: string }) => {
  const s = status?.toLowerCase();
  if (s === 'resolved') return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (s === 'in-progress' || s === 'in_progress') return <Clock className="w-3.5 h-3.5" />;
  return <AlertCircle className="w-3.5 h-3.5" />;
};

export function ComplaintDetailPanel({ complaint, onClose, onSubmit }: ComplaintDetailPanelProps) {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    if (complaint) {
      setResolutionNotes(complaint.resolutionNotes ?? '');
      setSelectedStatus(complaint.status ?? 'open');
    }
  }, [complaint]);

  const isOpen = !!complaint;

  function handleSubmit() {
    if (!complaint) return;
    onSubmit?.(complaint.id, { status: selectedStatus, resolutionNotes });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-white">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Complaint Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">Review and update resolution status</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {complaint && (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Tenant info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center font-bold text-xs text-indigo-600 border border-indigo-100 shrink-0">
                {complaint.tenant
                  ? `${complaint.tenant.firstName?.[0] ?? ''}${complaint.tenant.lastName?.[0] ?? ''}`
                  : 'T'}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {complaint.tenant
                    ? `${complaint.tenant.firstName} ${complaint.tenant.lastName}`
                    : 'Unknown Tenant'}
                </p>
                <p className="text-xs text-gray-400">
                  {complaint.property?.name ?? 'Property'} · Opened{' '}
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Title + badges */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">{complaint.title}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status badge */}
                <span
                  className={`inline-flex items-center gap-1 text-[10px] uppercase font-black px-2.5 py-1 rounded-lg border tracking-wider ${statusStyle[complaint.status?.toLowerCase()] ?? statusStyle.open}`}
                >
                  <StatusIcon status={complaint.status} />
                  {complaint.status?.replace('_', ' ')}
                </span>
                {/* Priority badge */}
                {complaint.priority && (
                  <span
                    className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-lg border tracking-wider ${priorityStyle[complaint.priority?.toLowerCase()] ?? ''}`}
                  >
                    {complaint.priority} priority
                  </span>
                )}
              </div>
            </div>

            {/* Full description */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                {complaint.description || 'No description provided.'}
              </p>
            </div>

            {/* Update status */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
                Update Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Resolution notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
                Resolution Notes
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={5}
                placeholder="Describe the steps taken to resolve this complaint..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all placeholder:text-gray-300"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-gray-200 text-gray-600 hover:bg-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!complaint}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6"
          >
            Submit
          </Button>
        </div>
      </div>
    </>
  );
}

export default ComplaintDetailPanel;
