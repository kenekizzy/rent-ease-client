'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { useUIStore } from '@/stores/ui-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

/** Property types that support multiple units */
const UNIT_BASED_TYPES = ['apartment', 'studio', 'commercial'] as const;

const propertySchema = z.object({
    addressLine1: z.string().min(5, 'Address is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().regex(/^\d{6}$/, 'ZIP code must be 6 digits'),
    propertyType: z.enum(['apartment', 'house', 'condo', 'studio', 'townhouse', 'commercial']),
    bedrooms: z.number().min(0),
    bathrooms: z.number().min(0),
    rentAmount: z.number().min(0, 'Rent must be a positive number'),
    units: z.array(z.object({ name: z.string().min(1, 'Unit name cannot be empty') })).optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

export function PropertyForm() {
    const { closeModal, modalData } = useUIStore();
    const queryClient = useQueryClient();
    const isEditing = !!modalData;

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(propertySchema),
        defaultValues: modalData
            ? {
                ...modalData,
                units: (modalData.units as string[] | undefined)?.map((u: string) => ({ name: u })) ?? [],
            }
            : {
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                zipCode: '',
                propertyType: 'apartment',
                bedrooms: 1,
                bathrooms: 1,
                rentAmount: 0,
                units: [],
            },
    });

    const { fields, append, remove } = useFieldArray({ control: form.control, name: 'units' });
    const selectedType = form.watch('propertyType');
    const isUnitBased = UNIT_BASED_TYPES.includes(selectedType as typeof UNIT_BASED_TYPES[number]);

    const mutation = useMutation({
        mutationFn: (values: PropertyFormValues) => {
            const payload = {
                ...values,
                units: isUnitBased ? values.units?.map((u) => u.name) : [],
            };
            if (isEditing) {
                return apiClient.put(`/properties/${modalData.id}`, payload);
            }
            return apiClient.post('/properties', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            toast.success(`Property ${isEditing ? 'updated' : 'created'} successfully`);
            closeModal();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Something went wrong');
        },
    });

    function onSubmit(values: PropertyFormValues) {
        mutation.mutate(values);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="propertyType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="apartment">Apartment</SelectItem>
                                        <SelectItem value="house">House</SelectItem>
                                        <SelectItem value="condo">Condo</SelectItem>
                                        <SelectItem value="studio">Studio</SelectItem>
                                        <SelectItem value="townhouse">Townhouse</SelectItem>
                                        <SelectItem value="commercial">Commercial</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="rentAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Annual Rent (₦)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input placeholder="12 Lekki Phase 1" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="addressLine2"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address Line 2 <span className="text-gray-400 text-xs">(optional)</span></FormLabel>
                            <FormControl>
                                <Input placeholder="Block B" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-3 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="zipCode" render={({ field }) => (
                        <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input placeholder="101001" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="bedrooms" render={({ field }) => (
                        <FormItem><FormLabel>Bedrooms</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="bathrooms" render={({ field }) => (
                        <FormItem><FormLabel>Bathrooms</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                {/* Units – only for multi-unit property types */}
                {isUnitBased && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <FormLabel>Units</FormLabel>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ name: '' })}
                                className="text-xs flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add Unit
                            </Button>
                        </div>
                        {fields.length === 0 && (
                            <p className="text-xs text-gray-400">No units added yet. Click "Add Unit" to add one.</p>
                        )}
                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`units.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1 mb-0">
                                                <FormControl>
                                                    <Input placeholder={`e.g. Apt ${index + 1}`} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(index)}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Saving...' : isEditing ? 'Update Property' : 'Create Property'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
