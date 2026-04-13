'use client'

import React from 'react'
import NavBar from '@/components/general/NavBar'
import { Bell, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

interface AppNotification {
    id: string;
    title: string;
    message: string;
    sentAt: string;
    isRead: boolean;
}

function formatRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
}

const Notifications = () => {
    const queryClient = useQueryClient();

    const { data: notifications, isLoading, error, refetch } = useQuery<AppNotification[]>({
        queryKey: ['notifications'],
        queryFn: () => apiClient.get<AppNotification[]>('/notifications'),
    });

    const markAllMutation = useMutation({
        mutationFn: () => apiClient.patch('/notifications/mark-all-read'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    return (
        <>
            <NavBar title="Notifications" subtitle="Manage your notifications" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                        <p className="text-sm text-gray-400">Stay updated with important alerts</p>
                    </div>
                    <button
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                        onClick={() => markAllMutation.mutate()}
                        disabled={markAllMutation.isPending || isLoading || !notifications?.some(n => !n.isRead)}
                    >
                        {markAllMutation.isPending ? 'Marking...' : 'Mark all as read'}
                    </button>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                )}

                {error && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <p className="text-sm text-gray-500">Failed to load notifications.</p>
                        <button
                            onClick={() => refetch()}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!isLoading && !error && notifications?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                        <Bell className="w-8 h-8 text-gray-300" />
                        <p className="text-sm text-gray-400">No notifications yet</p>
                    </div>
                )}

                {!isLoading && !error && notifications && notifications.length > 0 && (
                    <div className="space-y-1">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${!n.isRead ? "bg-indigo-50/40" : "hover:bg-gray-50"}`}
                            >
                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
                                    <Bell className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm text-gray-900 ${!n.isRead ? "font-semibold" : "font-medium"}`}>
                                        {n.title}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.sentAt)}</p>
                                </div>
                                {!n.isRead && (
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Notifications;
