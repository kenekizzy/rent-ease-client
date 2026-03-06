import { create } from 'zustand';
import { uploadDocument, fetchDocumentsByLease, fetchDocumentsByProperty, deleteDocument } from '@/services/useFileServiceApi';
import { DocumentRecord, UploadDocumentPayload } from '@/types';


interface DocumentState {
  documents: DocumentRecord[];
  uploading: boolean;
  uploadProgress: number; // 0–100 (set via XHR if you swap fetch for axios)
  error: string | null;

  // Actions
  upload: (payload: UploadDocumentPayload) => Promise<DocumentRecord | null>;
  loadByLease: (leaseId: string) => Promise<void>;
  loadByProperty: (propertyId: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  uploading: false,
  uploadProgress: 0,
  error: null,

  upload: async (payload) => {
    set({ uploading: true, uploadProgress: 0, error: null });
    try {
      const response = await uploadDocument(payload);
      const newDoc = response.data;
      set((state) => ({
        documents: [newDoc, ...state.documents],
        uploading: false,
        uploadProgress: 100,
      }));
      return newDoc;
    } catch (err: any) {
      set({ error: err.message, uploading: false, uploadProgress: 0 });
      return null;
    }
  },

  loadByLease: async (leaseId) => {
    set({ error: null });
    try {
      const docs = await fetchDocumentsByLease(leaseId);
      set({ documents: docs });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  loadByProperty: async (propertyId) => {
    set({ error: null });
    try {
      const docs = await fetchDocumentsByProperty(propertyId);
      set({ documents: docs });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  remove: async (id) => {
    set({ error: null });
    try {
      await deleteDocument(id);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  clearError: () => set({ error: null }),
}));