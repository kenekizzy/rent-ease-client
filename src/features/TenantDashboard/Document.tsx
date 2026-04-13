'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, MoreVertical, Download, FileText, FileArchive, Image, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import NavBar from '@/components/general/NavBar'
import { Modal } from '@/components/ui/Modal'
import DocumentUploader from '@/components/general/DocumentUploader'
import { useUIStore } from '@/stores/ui-store'
import { apiClient } from '@/services/api'
import { downloadDocument } from '@/services/useFileServiceApi'
import { DocumentRecord } from '@/types'

function getFileIcon(doc: DocumentRecord) {
  const mime = doc.mimeType ?? ''
  if (mime.startsWith('image/')) return { Icon: Image, iconColor: 'text-purple-500', iconBg: 'bg-purple-50' }
  if (mime === 'application/zip' || mime === 'application/x-zip-compressed')
    return { Icon: FileArchive, iconColor: 'text-yellow-500', iconBg: 'bg-yellow-50' }
  return { Icon: FileText, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatSize(kb: number) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`
  return `${kb} KB`
}

const Document = () => {
  const queryClient = useQueryClient()
  const { openModal } = useUIStore()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Fetch tenant leases to derive active leaseId
  const { data: leases } = useQuery<any[]>({
    queryKey: ['tenant-leases'],
    queryFn: () => apiClient.get<any[]>('/leases/tenant'),
  })

  const leaseId = leases?.find((l) => l.status === 'active')?.id ?? null

  // Fetch documents for the active lease
  const {
    data: documents,
    isLoading,
    isError,
    refetch,
  } = useQuery<DocumentRecord[]>({
    queryKey: ['lease-documents', leaseId],
    queryFn: () => apiClient.get<DocumentRecord[]>(`/files/lease/${leaseId}`),
    enabled: !!leaseId,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/files/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lease-documents', leaseId] })
      setOpenMenuId(null)
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete document')
      setOpenMenuId(null)
    },
  })

  return (
    <>
      <NavBar title="Documents" subtitle="Manage your documents" />
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Documents</h2>
            <p className="text-sm text-gray-400">Manage lease agreements and important files</p>
          </div>
          <button
            onClick={() => openModal('createDocument')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-sm">Loading documents…</span>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm">Failed to load documents.</p>
            <button onClick={() => refetch()} className="text-sm text-indigo-600 hover:underline">
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && documents?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
            <FileText className="w-10 h-10" />
            <p className="text-sm font-medium">No documents yet</p>
            <p className="text-xs">Upload your first document to get started.</p>
          </div>
        )}

        {/* Document grid */}
        {!isLoading && !isError && documents && documents.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {documents.map((doc) => {
              const { Icon, iconColor, iconBg } = getFileIcon(doc)
              return (
                <div key={doc.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    {/* ⋮ menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                        className="text-gray-300 hover:text-gray-500 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {openMenuId === doc.id && (
                        <div className="absolute right-0 top-6 z-10 bg-white border border-gray-100 rounded-lg shadow-lg py-1 min-w-[120px]">
                          <button
                            onClick={() => deleteMutation.mutate(doc.id)}
                            disabled={deleteMutation.isPending}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">{doc.fileName}</h3>
                  <p className="text-xs text-gray-400 mb-3">
                    {doc.fileType} • {formatSize(doc.fileSizeKb)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{formatDate(doc.createdAt)}</span>
                    <button
                      onClick={() => downloadDocument(doc.id, doc.fileName)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <Modal type="createDocument" title="Upload Document" description="Select a file to upload to your lease.">
        {leaseId && (
          <DocumentUploader
            leaseId={leaseId}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['lease-documents', leaseId] })
            }}
          />
        )}
      </Modal>
    </>
  )
}

export default Document
