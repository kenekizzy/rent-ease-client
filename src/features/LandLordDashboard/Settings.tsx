'use client'

import NavBar from '../../components/general/NavBar';
import { useState, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/stores/auth';
import { apiClient } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const profileSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const tabs = ["Profile", "Security", "Notifications", "Billing"];

/**
 * Settings Component
 * Handles user account preferences and profile updates.
 */
const Settings = () => {
    const { user, login } = useAuthStore();
    const [activeTab, setActiveTab] = useState("Profile");
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: user?.phone || '',
        },
    });

    // Sync form with user data if it changes
    useEffect(() => {
        if (user) {
            form.reset({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone || '',
            });
        }
    }, [user, form]);

    const onSubmit = async (values: ProfileFormValues) => {
        setIsSaving(true);
        try {
            const updatedUser = await apiClient.put<any>('/users/profile', values);
            // Assuming the token is still the same, we update the user in the store
            // If the backend returns a new token, we'd use it here too
            const token = localStorage.getItem('auth_token') || '';
            login(updatedUser, token);
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <NavBar title="Settings" subtitle="View and manage your account settings" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Account Settings</h2>
                    <p className="text-sm text-gray-400">Manage your personal information and preferences</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar tabs */}
                    <div className="w-full lg:w-48 flex-shrink-0">
                        <div className="flex lg:flex-col border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 lg:w-full text-left px-4 py-3 text-sm transition-colors border-r lg:border-r-0 lg:border-b border-gray-100 last:border-0 ${activeTab === tab
                                            ? "bg-white text-indigo-700 font-bold border-l-2 border-l-indigo-600"
                                            : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        {activeTab === "Profile" && (
                            <div className="border border-gray-100 rounded-xl p-6 bg-white">
                                <h3 className="text-base font-bold text-gray-900 mb-6">Profile Information</h3>

                                {/* Avatar Upload */}
                                <div className="flex items-center gap-6 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-2xl border-4 border-white shadow-sm">
                                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                        </div>
                                        <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 text-white border-2 border-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-shadow shadow-md">
                                            <Camera className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        <Button variant="outline" size="sm">Change Photo</Button>
                                        <p className="text-xs text-gray-400">JPG or PNG. Max size 2MB.</p>
                                    </div>
                                </div>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>First Name</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="lastName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Last Name</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" {...field} disabled/>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl>
                                                        <Input type="tel" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                                            <Button type="button" className='cursor-pointer' variant="outline" onClick={() => form.reset()}>
                                                Reset
                                            </Button>
                                            <Button type="submit" className='cursor-pointer' disabled={isSaving}>
                                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        )}

                        {activeTab !== "Profile" && (
                            <div className="border border-gray-100 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Camera className="w-6 h-6 text-gray-300" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900">{activeTab} Settings</h3>
                                <p className="text-sm text-gray-400 mt-1 max-w-[200px]">These settings will be available in the next update.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Settings