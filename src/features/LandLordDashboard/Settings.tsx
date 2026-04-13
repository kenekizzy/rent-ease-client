'use client'

import { useState, useEffect, useRef } from "react";
import { Camera, Loader2, Shield, Bell, CreditCard, Check } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/stores/auth';
import { apiClient } from '@/services/api';
import { uploadDocument } from '@/services/useFileServiceApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import NavBar from "@/components/general/NavBar";

const profileSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
});

const securitySchema = z.object({
    currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type SecurityFormValues = z.infer<typeof securitySchema>;

const tabs = [
    { id: "Profile", label: "Profile", icon: Camera },
    { id: "Security", label: "Security", icon: Shield },
    { id: "Notifications", label: "Notifications", icon: Bell },
    { id: "Billing", label: "Billing", icon: CreditCard }
];

const Settings = () => {
    const { user, updateUser } = useAuthStore();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("Profile");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!e.target) return;
        // Reset input so same file can be re-selected
        e.target.value = '';
        if (!file) return;

        // Validate type
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            toast.error('Only JPG and PNG files are allowed.');
            return;
        }
        // Validate size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Photo must be 2MB or smaller.');
            return;
        }

        setIsUploadingPhoto(true);
        try {
            const uploaded = await uploadDocument({ file, accessLevel: 'both' });
            const avatarUrl = uploaded.data.filePath;
            const updatedUser = await apiClient.patch<any>('/users/profile', { avatar: avatarUrl });
            updateUser(updatedUser);
            toast.success('Photo updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload photo');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleRemovePhoto = async () => {
        setIsUploadingPhoto(true);
        try {
            const updatedUser = await apiClient.patch<any>('/users/profile', { avatar: null });
            updateUser(updatedUser);
            toast.success('Photo removed');
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove photo');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    // Fetch notification preferences
    const { data: notificationPrefs, isLoading: isNotifLoading } = useQuery({
        queryKey: ['notification-preferences'],
        queryFn: () => apiClient.get<any>('/users/profile/notifications'),
        enabled: activeTab === "Notifications",
    });

    // Fetch billing plan
    const { data: billingPlan, isLoading: isBillingLoading } = useQuery({
        queryKey: ['billing-plan'],
        queryFn: () => apiClient.get<any>('/billing/plan'),
        enabled: activeTab === "Billing",
    });

    const updateNotifMutation = useMutation({
        mutationFn: (data: any) => apiClient.patch('/users/profile/notifications', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
            toast.success('Preferences updated');
        }
    });

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: user?.phone || '',
        },
    });

    const securityForm = useForm<SecurityFormValues>({
        resolver: zodResolver(securitySchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if (user) {
            profileForm.reset({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone || '',
            });
        }
    }, [user, profileForm]);

    const onProfileSubmit = async (values: ProfileFormValues) => {
        setIsSaving(true);
        try {
            const updatedUser = await apiClient.patch<any>('/users/profile', values);
            updateUser(updatedUser);
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const onSecuritySubmit = async (values: SecurityFormValues) => {
        setIsSaving(true);
        try {
            await apiClient.patch('/users/profile/password', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            toast.success('Password updated successfully');
            securityForm.reset();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setIsSaving(false);
        }
    };

    const togglePreference = (key: string, value: boolean) => {
        updateNotifMutation.mutate({ [key]: value });
    };

    return (
        <>
            <NavBar title="Settings" subtitle="View and manage your account settings" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in transition-opacity">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Account Settings</h2>
                    <p className="text-sm text-gray-400">Manage your personal information and preferences</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-56 flex-shrink-0">
                        <div className="flex lg:flex-col border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 lg:w-full text-left px-5 py-4 text-sm transition-all flex items-center gap-3 border-r lg:border-r-0 lg:border-b border-gray-100 last:border-0 ${activeTab === tab.id
                                            ? "bg-white text-indigo-700 font-bold border-l-4 border-l-indigo-600 shadow-sm"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex-1">
                        {activeTab === "Profile" && (
                            <div className="border border-gray-100 rounded-xl p-8 bg-white shadow-sm">
                                <h3 className="text-base font-bold text-gray-900 mb-8 border-b border-gray-50 pb-4 flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-gray-400" />
                                    Profile Information
                                </h3>

                                <div className="flex items-center gap-8 mb-10 p-6 bg-gradient-to-br from-indigo-50/50 to-white rounded-2xl border border-indigo-100/50 shadow-sm">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-indigo-700 font-bold text-3xl border-4 border-white shadow-xl ring-1 ring-indigo-100 overflow-hidden">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploadingPhoto}
                                            className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 text-white border-2 border-white rounded-full flex items-center justify-center hover:bg-indigo-700 hover:scale-110 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                                        >
                                            {isUploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-bold text-gray-900">{user?.firstName} {user?.lastName}</h4>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={isUploadingPhoto}
                                                onClick={() => fileInputRef.current?.click()}
                                                className="bg-white hover:bg-indigo-50 hover:text-indigo-600 border-indigo-100"
                                            >
                                                Change Photo
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                disabled={isUploadingPhoto || !user?.avatar}
                                                onClick={handleRemovePhoto}
                                                className="text-red-500 hover:bg-red-50"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">JPG or PNG. Max size 2MB.</p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </div>

                                <Form {...profileForm}>
                                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <FormField
                                                control={profileForm.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-500">First Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="John" className="h-11 bg-gray-50/30" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="lastName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-500">Last Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Doe" className="h-11 bg-gray-50/30" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={profileForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" {...field} disabled className="h-11 bg-gray-100 font-medium text-gray-500 cursor-not-allowed opacity-75" />
                                                    </FormControl>
                                                    <p className="text-[10px] text-gray-400 mt-1">Contact support to change your email.</p>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={profileForm.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone Number</FormLabel>
                                                    <FormControl>
                                                        <Input type="tel" placeholder="+234..." className="h-11 bg-gray-50/30" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex items-center justify-end gap-3 pt-8 border-t border-gray-50">
                                            <Button type="button" className='cursor-pointer' variant="ghost" onClick={() => profileForm.reset()}>
                                                Discard Changes
                                            </Button>
                                            <Button type="submit" className='cursor-pointer bg-indigo-600 hover:bg-indigo-700 h-11 px-8 rounded-lg font-bold transition-all shadow-md active:scale-95' disabled={isSaving}>
                                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Settings
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        )}

                        {activeTab === "Security" && (
                            <div className="border border-gray-100 rounded-xl p-8 bg-white shadow-sm transition-all duration-300">
                                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-indigo-500" />
                                    Security Settings
                                </h3>
                                <p className="text-sm text-gray-500 mb-8 max-w-sm">Manage your account password and security preferences to keep your information safe.</p>

                                <Form {...securityForm}>
                                    <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6 max-w-md">
                                        <FormField
                                            control={securityForm.control}
                                            name="currentPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-500">Current Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" className="h-11 bg-gray-50/30" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="h-px bg-gray-50 my-6"></div>
                                        <FormField
                                            control={securityForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-500">New Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" className="h-11 bg-gray-50/30" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={securityForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-500">Confirm New Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" className="h-11 bg-gray-50/30" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex items-center justify-end gap-3 pt-8 border-t border-gray-50 mt-4">
                                            <Button type="submit" className='cursor-pointer bg-indigo-600 hover:bg-indigo-700 h-11 px-8 rounded-lg font-bold' disabled={isSaving}>
                                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Update Password
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        )}

                        {activeTab === "Notifications" && (
                            <div className="border border-gray-100 rounded-xl p-8 bg-white shadow-sm transition-all duration-300">
                                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-indigo-500" />
                                    Notification Preferences
                                </h3>
                                <p className="text-sm text-gray-500 mb-10 max-w-sm">Control how and when you want to receive alerts about your properties and tenants.</p>

                                {isNotifLoading ? (
                                    <div className="flex h-32 items-center justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {[
                                            { id: 'emailEnabled', title: 'Email Notifications', desc: 'Receive updates via your registered email address.' },
                                            { id: 'inAppEnabled', title: 'Push Notifications', desc: 'Get real-time alerts directly in your browser.' },
                                            { id: 'complaintAlerts', title: 'Maintenance Alerts', desc: 'Notify me when a new complaint is filed.' },
                                            { id: 'paymentAlerts', title: 'Payment Notifications', desc: 'Alert me when a payment is received or overdue.' },
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-5 bg-white hover:bg-gray-50/50 rounded-2xl border border-gray-100 transition-colors shadow-sm group">
                                                <div className="space-y-1">
                                                    <p className="text-[15px] font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{item.title}</p>
                                                    <p className="text-xs text-gray-400">{item.desc}</p>
                                                </div>
                                                <div className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={notificationPrefs?.[item.id] ?? true}
                                                        onChange={(e) => togglePreference(item.id, e.target.checked)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "Billing" && (
                            <div className="border border-gray-100 rounded-xl p-8 bg-white shadow-sm transition-all duration-300">
                                <h3 className="text-base font-bold text-gray-900 mb-8 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-indigo-500" />
                                    Subscription & Billing
                                </h3>

                                {isBillingLoading ? (
                                    <div className="flex h-48 items-center justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        <div className="relative overflow-hidden bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
                                            <div className="absolute top-0 right-0 -m-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                            <div className="absolute bottom-0 left-0 -m-8 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl"></div>

                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-8">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-100/80">Active Subscription</span>
                                                    <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border border-white/20">
                                                        {billingPlan?.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline gap-2 mb-2">
                                                    <span className="text-4xl font-bold">₦{Number(billingPlan?.price || 0).toLocaleString()}</span>
                                                    <span className="text-indigo-200 text-sm font-medium">/ {billingPlan?.interval}</span>
                                                </div>
                                                <p className="text-indigo-100/90 text-[13px] font-medium">Your next billing date is {new Date(billingPlan?.nextBilling).toLocaleDateString()}.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Features</h4>
                                                <div className="space-y-3">
                                                    {billingPlan?.features.map((f: string) => (
                                                        <div key={f} className="flex items-center gap-3 text-sm text-gray-600">
                                                            <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                                                <Check className="w-3 h-3 text-green-500" />
                                                            </div>
                                                            {f}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Method</h4>
                                                <div className="flex items-center justify-between p-5 border border-indigo-50 bg-indigo-50/10 rounded-2xl ring-1 ring-indigo-50">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center font-bold text-[11px] text-gray-400 shadow-sm leading-none tracking-tighter uppercase italic">
                                                            {billingPlan?.paymentMethod.type}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">•••• •••• {billingPlan?.paymentMethod.last4}</p>
                                                            <p className="text-xs text-gray-400">Default Card</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-white">Update</Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-10 border-t border-gray-100">
                                            <Button variant="ghost" className="text-red-400 font-bold hover:text-red-600 hover:bg-red-50 text-xs">Cancel Subscription</Button>
                                            <Button className='cursor-pointer bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-50 px-8 h-12 rounded-xl font-bold shadow-sm'>Upgrade Plan</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};



export default Settings