'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useUIStore, ModalType } from '@/stores/ui-store';

interface ModalProps {
    type: ModalType;
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * Reusable Modal wrapper around shadcn/ui Dialog.
 * Syncs with the global UI store to handle opening/closing.
 */
export function Modal({ type, title, description, children, className }: ModalProps) {
    const { activeModal, closeModal } = useUIStore();

    const isOpen = activeModal === type;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
            <DialogContent className={className}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-gray-500">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <div className="mt-4">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}
