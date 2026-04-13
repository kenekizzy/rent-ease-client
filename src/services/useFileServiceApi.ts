import { UploadDocumentPayload, UploadDocumentResponse, DocumentRecord } from '@/types';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/v1`;

/**
 * Retrieves the JWT from wherever your auth store keeps it.
 * Swap this for your Zustand store accessor if needed.
 */
function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('auth_token') ?? '';
}

function authHeaders(): HeadersInit {
  return { Authorization: `Bearer ${getAuthToken()}` };
}

// ---------------------------------------------------------------------------
// Upload a document (multipart/form-data)
// ---------------------------------------------------------------------------
export async function uploadDocument(
  payload: UploadDocumentPayload,
): Promise<UploadDocumentResponse> {
  const form = new FormData();
  form.append('file', payload.file);

  if (payload.leaseId)    form.append('leaseId',    payload.leaseId);
  if (payload.propertyId) form.append('propertyId', payload.propertyId);
  if (payload.accessLevel) form.append('accessLevel', payload.accessLevel);

  const res = await fetch(`${API_BASE}/files/upload`, {
    method: 'POST',
    headers: authHeaders(), // NOTE: do NOT set Content-Type — browser sets it with boundary
    body: form,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Upload failed.' }));
    throw new Error(error.message ?? 'Upload failed.');
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Fetch document metadata by ID
// ---------------------------------------------------------------------------
export async function fetchDocument(id: string): Promise<DocumentRecord> {
  const res = await fetch(`${API_BASE}/files/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error('Failed to fetch document.');
  return res.json();
}

// ---------------------------------------------------------------------------
// Fetch all documents for a lease
// ---------------------------------------------------------------------------
export async function fetchDocumentsByLease(leaseId: string): Promise<DocumentRecord[]> {
  const res = await fetch(`${API_BASE}/files/lease/${leaseId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error('Failed to fetch lease documents.');
  return res.json();
}

// ---------------------------------------------------------------------------
// Fetch all documents for a property
// ---------------------------------------------------------------------------
export async function fetchDocumentsByProperty(propertyId: string): Promise<DocumentRecord[]> {
  const res = await fetch(`${API_BASE}/files/property/${propertyId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error('Failed to fetch property documents.');
  return res.json();
}

// ---------------------------------------------------------------------------
// Download a document (triggers browser save-as dialog)
// ---------------------------------------------------------------------------
export async function downloadDocument(id: string, fileName: string): Promise<void> {
  const res = await fetch(`${API_BASE}/files/${id}/download`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error('Failed to download document.');

  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Delete a document
// ---------------------------------------------------------------------------
export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/files/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error('Failed to delete document.');
}