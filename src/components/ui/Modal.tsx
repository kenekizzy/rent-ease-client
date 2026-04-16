'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useUIStore, ModalType } from '@/stores/ui-store';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const modalSizeClasses: Record<ModalSize, string> = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
};

interface ModalProps {
    type: ModalType;
    title: string;
    description?: string;
    children: React.ReactNode;
    size?: ModalSize;
    className?: string;
}

export function Modal({ type, title, description, children, size = 'md', className }: ModalProps) {
    const { activeModal, closeModal } = useUIStore();

    const isOpen = activeModal === type;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
            <DialogContent className={cn(modalSizeClasses[size], className)}>
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
