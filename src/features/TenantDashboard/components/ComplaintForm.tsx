'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Textarea } from '@/components/ui/textarea'; // I'll assume this exists or I'll create it
import { useUIStore } from '@/stores/ui-store';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';

const complaintSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    priority: z.enum(['low', 'medium', 'high']),
    propertyId: z.string().min(1, 'Please select a property'),
});

type ComplaintFormValues = z.infer<typeof complaintSchema>;

export function ComplaintForm() {
    const { closeModal } = useUIStore();
    const queryClient = useQueryClient();

    // Fetch properties to let tenant choose which one (though usually they only have one)
    const { data: properties } = useQuery({
        queryKey: ['my-properties'],
        queryFn: () => apiClient.get<any[]>('/properties'), // In a real app, this might be filtered
    });

    const form = useForm<ComplaintFormValues>({
        resolver: zodResolver(complaintSchema),
        defaultValues: {
            title: '',
            description: '',
            priority: 'low',
            propertyId: '',
        },
    });

    const mutation = useMutation({
        mutationFn: (values: ComplaintFormValues) => apiClient.post('/complaints', values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
            toast.success('Complaint submitted successfully');
            closeModal();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to submit complaint');
        },
    });

    function onSubmit(values: ComplaintFormValues) {
        mutation.mutate(values);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="propertyId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Property</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select property" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {properties?.map((p: any) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
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
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Issue Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Leaky faucet, broken light, etc." {...field} />
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <textarea
                                    {...field}
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Tell us more about the issue..."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Submitting...' : 'Submit Complaint'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
