import { create } from 'zustand';

export type ModalType =
    | 'createProperty'
    | 'editProperty'
    | 'viewProperty'
    | 'createComplaint'
    | 'viewLease'
    | 'deleteProperty'
    | 'submitPaymentProof'
    | 'createDocument'
    | 'viewReceipt'
    | null;

interface UIState {
    // Modal State
    activeModal: ModalType;
    modalData: any; // Contextual data for the modal (e.g., property to edit)

    // Actions
    openModal: (type: ModalType, data?: any) => void;
    closeModal: () => void;

    // Sidebar State (optional but useful)
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

/**
 * Global UI Store using Zustand
 * Manages modals and other transient UI states without prop drilling
 */
export const useUIStore = create<UIState>((set) => ({
    activeModal: null,
    modalData: null,
    isSidebarOpen: true,

    openModal: (type, data = null) => set({ activeModal: type, modalData: data }),
    closeModal: () => set({ activeModal: null, modalData: null }),

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
