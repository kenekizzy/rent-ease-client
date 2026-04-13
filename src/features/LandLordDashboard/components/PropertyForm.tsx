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
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const UNIT_BASED_TYPES = ['apartment', 'shop', 'studio', 'flat'] as const;

const propertySchema = z.object({
    // General
    name: z.string().min(3, 'Property name is required'),
    description: z.string().optional(),

    // Location
    addressLine1: z.string().min(5, 'Address is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().regex(/^\d{6}$/, 'ZIP code must be 6 digits'),
    country: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),

    // Property details
    propertyType: z.enum(['apartment', 'house', 'shop', 'studio', 'flat', 'commercial']),
    condition: z.enum(['new', 'renovated', 'old']).optional(),
    bedrooms: z.number().min(0).optional(),
    bathrooms: z.number().min(0).optional(),

    // Financials
    rentAmount: z.number().min(0, 'Rent must be a positive number').optional(),
    rentDurationInMonths: z.number().min(1).optional(),

    // Additional fees
    additionalFees: z.object({
        serviceCharge: z.number().min(0).optional(),
        cautionFee: z.number().min(0).optional(),
        agencyFee: z.number().min(0).optional(),
        legalFee: z.number().min(0).optional(),
    }).optional(),

    // Utilities
    utilities: z.object({
        electricity: z.enum(['prepaid', 'postpaid', 'none']).optional(),
        water: z.enum(['borehole', 'well', 'none']).optional(),
        wasteManagement: z.boolean().optional(),
        security: z.boolean().optional(),
    }).optional(),

    // Amenities & images
    amenities: z.array(z.object({ value: z.string().min(1, 'Cannot be empty') })).optional(),
    images: z.array(z.object({ value: z.string().url('Must be a valid URL') })).optional(),

    // Status
    status: z.enum(['available', 'partially_occupied', 'occupied', 'maintenance']).optional(),
    isListed: z.boolean().optional(),

    // Units
    units: z.array(z.object({
        name: z.string().min(1, 'Unit name cannot be empty'),
        rentAmount: z.number().min(0).optional(),
        bedrooms: z.number().min(0).optional(),
        bathrooms: z.number().min(0).optional(),
        status: z.enum(['available', 'partially_occupied', 'occupied', 'maintenance']).optional(),
    })).optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

// Section wrapper for collapsible form sections
function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setOpen(!open)}
            >
                {title}
                {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {open && <div className="p-4 space-y-4">{children}</div>}
        </div>
    );
}

// A simple checkbox toggle
function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
                type="checkbox"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                className="w-4 h-4 accent-indigo-600"
            />
            <span className="text-sm text-gray-700">{label}</span>
        </label>
    );
}

function numOrUndef(val: string) {
    const n = Number(val);
    return isNaN(n) ? undefined : n;
}

export function PropertyForm() {
    const { closeModal, modalData } = useUIStore();
    const queryClient = useQueryClient();
    const isEditing = !!modalData;

    // Pre-process modalData arrays if editing
    const defaultAmenities = (modalData?.amenities ?? []).map((v: string) => ({ value: v }));
    const defaultImages = (modalData?.images ?? []).map((v: string) => ({ value: v }));

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(propertySchema),
        defaultValues: modalData
            ? {
                ...modalData,
                amenities: defaultAmenities,
                images: defaultImages,
                units: modalData.units ?? [],
            }
            : {
                name: '',
                description: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'Nigeria',
                propertyType: 'apartment',
                condition: undefined,
                bedrooms: undefined,
                bathrooms: undefined,
                rentAmount: undefined,
                rentDurationInMonths: 12,
                additionalFees: {},
                utilities: { electricity: undefined, water: undefined, wasteManagement: false, security: false },
                amenities: [],
                images: [],
                status: 'available',
                isListed: false,
                units: [],
            },
    });

    const selectedType = form.watch('propertyType');
    const isUnitBased = UNIT_BASED_TYPES.includes(selectedType as typeof UNIT_BASED_TYPES[number]);

    const { fields: unitFields, append: appendUnit, remove: removeUnit } = useFieldArray({ control: form.control, name: 'units' });
    const { fields: amenityFields, append: appendAmenity, remove: removeAmenity } = useFieldArray({ control: form.control, name: 'amenities' });
    const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control: form.control, name: 'images' });

    const mutation = useMutation({
        mutationFn: (values: PropertyFormValues) => {
            const payload = {
                ...values,
                amenities: values.amenities?.map(a => a.value) ?? [],
                images: values.images?.map(i => i.value) ?? [],
                units: isUnitBased ? values.units : [],
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">

                {/* ── General Info ── */}
                <Section title="General Information">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Property Name</FormLabel>
                            <FormControl><Input placeholder="Modern 2-Bedroom Apartment in Lekki Phase 1" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description <span className="text-gray-400 text-xs">(optional)</span></FormLabel>
                            <FormControl>
                                <textarea
                                    {...field}
                                    rows={3}
                                    placeholder="Describe the property..."
                                    className="w-full border border-input rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="propertyType" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Property Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="apartment">Apartment</SelectItem>
                                        <SelectItem value="house">House</SelectItem>
                                        <SelectItem value="shop">Shop</SelectItem>
                                        <SelectItem value="studio">Studio</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="condition" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Condition</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="renovated">Renovated</SelectItem>
                                        <SelectItem value="old">Old</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="bedrooms" render={({ field }) => (
                            <FormItem><FormLabel>Bedrooms</FormLabel><FormControl>
                                <Input type="number" placeholder="2" {...field} value={field.value ?? ''} onChange={e => field.onChange(numOrUndef(e.target.value))} />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="bathrooms" render={({ field }) => (
                            <FormItem><FormLabel>Bathrooms</FormLabel><FormControl>
                                <Input type="number" placeholder="2" {...field} value={field.value ?? ''} onChange={e => field.onChange(numOrUndef(e.target.value))} />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </Section>

                {/* ── Location ── */}
                <Section title="Location">
                    <FormField control={form.control} name="addressLine1" render={({ field }) => (
                        <FormItem><FormLabel>Address Line 1</FormLabel><FormControl><Input placeholder="12 Admiralty Way" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="addressLine2" render={({ field }) => (
                        <FormItem><FormLabel>Address Line 2 <span className="text-gray-400 text-xs">(optional)</span></FormLabel><FormControl><Input placeholder="Lekki Phase 1" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-3 gap-3">
                        <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="state" render={({ field }) => (
                            <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="zipCode" render={({ field }) => (
                            <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input placeholder="106104" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <FormField control={form.control} name="country" render={({ field }) => (
                            <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="Nigeria" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="latitude" render={({ field }) => (
                            <FormItem><FormLabel>Latitude</FormLabel><FormControl>
                                <Input type="number" step="any" placeholder="6.4474" {...field} value={field.value ?? ''} onChange={e => field.onChange(numOrUndef(e.target.value))} />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="longitude" render={({ field }) => (
                            <FormItem><FormLabel>Longitude</FormLabel><FormControl>
                                <Input type="number" step="any" placeholder="3.4722" {...field} value={field.value ?? ''} onChange={e => field.onChange(numOrUndef(e.target.value))} />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </Section>

                {/* ── Financials ── */}
                <Section title="Financials">
                    {!isUnitBased && (<div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="rentAmount" render={({ field }) => (
                            <FormItem><FormLabel>Rent Amount (₦)</FormLabel><FormControl>
                                <Input type="number" placeholder="2500000" {...field} value={field.value ?? ''} onChange={e => field.onChange(numOrUndef(e.target.value))} />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="rentDurationInMonths" render={({ field }) => (
                            <FormItem><FormLabel>Duration (months)</FormLabel><FormControl>
                                <Input type="number" placeholder="12" {...field} value={field.value ?? ''} onChange={e => field.onChange(numOrUndef(e.target.value))} />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                    </div>)}
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2">Additional Fees (optional)</p>
                    <div className="grid grid-cols-2 gap-3">
                        {(['serviceCharge', 'cautionFee', 'agencyFee', 'legalFee'] as const).map(key => (
                            <FormField key={key} control={form.control} name={`additionalFees.${key}`} render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="capitalize">{key.replace(/([A-Z])/g, ' $1')} (₦)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" {...field} value={field.value ?? ''} onChange={e => field.onChange(numOrUndef(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        ))}
                    </div>
                </Section>

                {/* ── Utilities ── */}
                <Section title="Utilities" defaultOpen={false}>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="utilities.electricity" render={({ field }) => (
                            <FormItem><FormLabel>Electricity</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="prepaid">Prepaid</SelectItem>
                                        <SelectItem value="postpaid">Postpaid</SelectItem>
                                        <SelectItem value="none">None</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="utilities.water" render={({ field }) => (
                            <FormItem><FormLabel>Water</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="borehole">Borehole</SelectItem>
                                        <SelectItem value="well">Well</SelectItem>
                                        <SelectItem value="none">None</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <div className="flex gap-6 pt-1">
                        <FormField control={form.control} name="utilities.wasteManagement" render={({ field }) => (
                            <FormItem><CheckboxField label="Waste Management" checked={!!field.value} onChange={field.onChange} /></FormItem>
                        )} />
                        <FormField control={form.control} name="utilities.security" render={({ field }) => (
                            <FormItem><CheckboxField label="Security" checked={!!field.value} onChange={field.onChange} /></FormItem>
                        )} />
                    </div>
                </Section>

                {/* ── Amenities ── */}
                <Section title="Amenities" defaultOpen={false}>
                    <div className="space-y-2">
                        {amenityFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                                <FormField control={form.control} name={`amenities.${index}.value`} render={({ field }) => (
                                    <FormItem className="flex-1 mb-0">
                                        <FormControl><Input placeholder="e.g. Parking Space" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeAmenity(index)} className="text-red-400 hover:text-red-600 shrink-0">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendAmenity({ value: '' })} className="text-xs flex items-center gap-1 w-full justify-center">
                            <Plus className="w-3 h-3" /> Add Amenity
                        </Button>
                    </div>
                </Section>

                {/* ── Images ── */}
                <Section title="Images" defaultOpen={false}>
                    <div className="space-y-2">
                        {imageFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                                <FormField control={form.control} name={`images.${index}.value`} render={({ field }) => (
                                    <FormItem className="flex-1 mb-0">
                                        <FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(index)} className="text-red-400 hover:text-red-600 shrink-0">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendImage({ value: '' })} className="text-xs flex items-center gap-1 w-full justify-center">
                            <Plus className="w-3 h-3" /> Add Image URL
                        </Button>
                    </div>
                </Section>

                {/* ── Status ── */}
                <Section title="Listing Settings" defaultOpen={false}>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem><FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="occupied">Occupied</SelectItem>
                                        <SelectItem value="partially_occupied">Partially Occupied</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="isListed" render={({ field }) => (
                            <FormItem className="flex flex-col justify-end pb-1">
                                <CheckboxField label="List this property publicly" checked={!!field.value} onChange={field.onChange} />
                            </FormItem>
                        )} />
                    </div>
                </Section>

                {/* ── Units ── */}
                {isUnitBased && (
                    <Section title="Units">
                        {unitFields.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-2">No units added yet.</p>
                        )}
                        <div className="space-y-3">
                            {unitFields.map((field, index) => (
                                <div key={field.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit {index + 1}</span>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeUnit(index)} className="text-red-400 hover:text-red-600 h-7 px-2">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField control={form.control} name={`units.${index}.name`} render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel className="text-xs">Unit Name</FormLabel>
                                                <FormControl><Input placeholder="Flat 1 - Ground Floor" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name={`units.${index}.rentAmount`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Rent (₦)</FormLabel>
                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(numOrUndef(e.target.value))} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name={`units.${index}.status`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="available">Available</SelectItem>
                                                        <SelectItem value="occupied">Occupied</SelectItem>
                                                        <SelectItem value="partially_occupied">Partially Occupied</SelectItem>
                                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name={`units.${index}.bedrooms`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Bedrooms</FormLabel>
                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(numOrUndef(e.target.value))} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name={`units.${index}.bathrooms`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Bathrooms</FormLabel>
                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(numOrUndef(e.target.value))} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendUnit({ name: '' })} className="text-xs flex items-center gap-1 w-full justify-center mt-2">
                            <Plus className="w-3 h-3" /> Add Unit
                        </Button>
                    </Section>
                )}

                {/* ── Actions ── */}
                <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-white pb-1">
                    <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Saving...' : isEditing ? 'Update Property' : 'Create Property'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
