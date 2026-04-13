'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    AlertTriangle, 
    CheckCircle2, 
    Info, 
    Loader2, 
    ChevronDown,
    Building2,
    Calendar,
    MessageSquare,
    Send
} from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useUIStore } from '@/stores/ui-store';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';
import { useEffect } from 'react';

const complaintSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    propertyId: z.string().min(1, 'Please select a property'),
});

type ComplaintFormValues = z.infer<typeof complaintSchema>;

export function ComplaintForm() {
    const { closeModal } = useUIStore();
    const queryClient = useQueryClient();

    // Fetch leased properties specifically for the tenant
    const { data: properties, isLoading: isPropsLoading } = useQuery({
        queryKey: ['leased-properties'],
        queryFn: () => apiClient.get<any[]>('/properties/leased'),
    });

    const form = useForm<ComplaintFormValues>({
        resolver: zodResolver(complaintSchema),
        defaultValues: {
            title: '',
            description: '',
            priority: 'medium',
            propertyId: '',
        },
    });

    // Auto-select if only one property
    useEffect(() => {
        if (properties?.length === 1) {
            form.setValue('propertyId', properties[0].id);
        }
    }, [properties, form]);

    const mutation = useMutation({
        mutationFn: (values: ComplaintFormValues) => apiClient.post('/complaints', values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-complaints'] });
            toast.success('Maintenance request submitted successfully');
            closeModal();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to submit complaint');
        },
    });

    function onSubmit(values: ComplaintFormValues) {
        mutation.mutate(values);
    }

    if (isPropsLoading) {
        return (
            <div className="flex h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!properties || properties.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                    <Info className="w-8 h-8 text-indigo-200" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">No active lease found</h3>
                <p className="text-sm text-gray-400 mb-6">
                    You can only report maintenance issues for properties you are currently leasing.
                </p>
                <Button variant="outline" className="rounded-xl" onClick={closeModal}>
                    Close Window
                </Button>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="propertyId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Residence</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:ring-indigo-500">
                                            <SelectValue placeholder="Which property?" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                        {properties?.map((p: any) => (
                                            <SelectItem key={p.id} value={p.id} className="rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-gray-400" />
                                                    {p.addressLine1}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest">Urgency Level</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:ring-indigo-500">
                                            <SelectValue placeholder="Set priority" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                        <SelectItem value="low" className="rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-gray-400" />
                                                Low Priority
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="medium" className="rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                Medium Priority
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="high" className="rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                                                High Priority
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="urgent" className="rounded-lg">
                                            <div className="flex items-center gap-2 font-bold text-red-600">
                                                <AlertTriangle className="w-3 h-3" />
                                                Urgent Request
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest">Brief Headline</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <Input 
                                        placeholder="e.g. Broken AC in Bedroom 2" 
                                        {...field} 
                                        className="h-12 pl-10 rounded-xl bg-gray-50 border-gray-100 focus:ring-indigo-500 font-medium"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detailed Description</FormLabel>
                            <FormControl>
                                <textarea
                                    {...field}
                                    className="flex min-h-[120px] w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 leading-relaxed font-medium"
                                    placeholder="Please describe the issue in detail. When did it start? Are there any specific things we should know?"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="bg-indigo-50 p-4 rounded-2xl flex gap-3 items-start border border-indigo-100">
                    <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide mb-1">What Happens Next?</p>
                        <p className="text-xs text-indigo-700 leading-relaxed">
                            Your landlord will be notified immediately. You can track exactly when they see it and when a technician is assigned in your history feed.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <Button type="button" variant="ghost" className="rounded-xl h-12 px-6 font-bold" onClick={closeModal}>
                        Dismiss
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={mutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-12 px-8 font-bold shadow-lg shadow-indigo-100 flex gap-3 group"
                    >
                        {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                Send Report
                                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
