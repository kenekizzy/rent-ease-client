"use client"
import NavBar from '../../components/general/NavBar';
import { Plus, Building2, Loader2, Eye, Pencil, MailPlus, X, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/Modal';
import { PropertyForm } from './components/PropertyForm';
import { Property, Lease } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// ─── helpers ─────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    partially_occupied: 'bg-amber-50 text-amber-700 border-amber-200',
    occupied: 'bg-red-50 text-red-700 border-red-200',
    maintenance: 'bg-gray-100 text-gray-600 border-gray-300',
};

const STATUS_LABEL: Record<string, string> = {
    available: 'Available',
    partially_occupied: 'Partial',
    occupied: 'Occupied',
    maintenance: 'Maintenance',
};

const UNIT_BASED = ['apartment', 'studio', 'commercial', 'flat'];

interface InviteFormProps {
    property: Property;
    onSuccess: () => void;
}

function InviteForm({ property, onSuccess }: InviteFormProps) {
    const [tenantEmail, setTenantEmail] = useState('');
    const [unit, setUnit] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [annualRent, setAnnualRent] = useState(property.rentAmount);
    const [securityDeposit, setSecurityDeposit] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasUnits = UNIT_BASED.includes(property.propertyType) && (property.units?.length ?? 0) > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post('/leases/invite', {
                propertyId: property.id,
                tenantEmail,
                unitId: hasUnits ? unit : undefined,
                startDate,
                endDate,
                annualRent,
                securityDeposit,
            });
            toast.success(`Invitation sent to ${tenantEmail}`);
            onSuccess();
        } catch (err: any) {
            toast.error(err?.message ?? 'Failed to send invitation');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant Email</label>
                <Input
                    type="email"
                    required
                    placeholder="tenant@email.com"
                    value={tenantEmail}
                    onChange={e => setTenantEmail(e.target.value)}
                />
            </div>

            {hasUnits && (
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</label>
                    <Select value={unit} onValueChange={setUnit} required>
                        <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                        <SelectContent>
                            {property.units!.map(u => (
                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Date</label>
                    <Input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">End Date</label>
                    <Input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Annual Rent (₦)</label>
                    <Input type="number" required value={annualRent} onChange={e => setAnnualRent(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Security Deposit (₦)</label>
                    <Input type="number" required value={securityDeposit} onChange={e => setSecurityDeposit(Number(e.target.value))} />
                </div>
            </div>

            <Button type="submit" className="w-full flex items-center gap-2" disabled={isSubmitting}>
                <MailPlus className="w-4 h-4" />
                {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
        </form>
    );
}

interface ViewPropertyPanelProps {
    property: Property;
    onClose: () => void;
}

function ViewPropertyPanel({ property, onClose }: ViewPropertyPanelProps) {
    const [showInviteForm, setShowInviteForm] = useState(false);

    const { data: detail, isLoading } = useQuery<Property>({
        queryKey: ['property', property.id],
        queryFn: () => apiClient.get<Property>(`/properties/${property.id}`),
    });

    const p = detail || property;
    const hasUnits = (p.units?.length ?? 0) > 0;
    const activeLeases = (p.leases ?? []).filter(l => l.status === 'active' || l.status === 'pending_acceptance');
    const unitLeaseMap: Record<string, Lease | undefined> = {};
    if (hasUnits) {
        for (const lease of activeLeases) {
            if (lease.unitId) unitLeaseMap[lease.unitId] = lease;
        }
    }

    const fmt = (n?: number) => n ? `₦${Number(n).toLocaleString()}` : null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-indigo-500 shrink-0 text-white">
                    <div className="min-w-0 pr-4">
                        <h2 className="font-bold text-lg leading-tight truncate">{p.name || p.addressLine1}</h2>
                        <p className="opacity-80 text-sm capitalize mt-0.5">{p.propertyType} · {p.city}, {p.state}</p>
                    </div>
                    <button onClick={onClose} className="opacity-80 hover:opacity-100 transition-opacity shrink-0 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {isLoading && (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        </div>
                    )}

                    {p.images && p.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {p.images.map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt={`Property image ${i + 1}`}
                                    className="h-24 w-32 object-cover rounded-lg shrink-0 border border-gray-100"
                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-indigo-50 rounded-xl p-3 text-center">
                            <p className="text-lg font-bold text-indigo-700">
                                {p.rentAmount ? `₦${(Number(p.rentAmount)).toLocaleString()}` : '—'}
                            </p>
                            <p className="text-[11px] text-indigo-400 mt-0.5">Annual Rent</p>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-3 text-center">
                            <p className="text-lg font-bold text-indigo-700">{hasUnits ? p.units?.length : (p.bedrooms ?? '—')}</p>
                            <p className="text-[11px] text-indigo-400 mt-0.5">{hasUnits ? 'Total units' : 'Bedrooms'}</p>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-3 text-center">
                            <p className="text-lg font-bold text-indigo-700">{activeLeases.length}</p>
                            <p className="text-[11px] text-indigo-400 mt-0.5">Active leases</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Location</h3>
                        <p className="text-sm text-gray-700">{p.addressLine1}{p.addressLine2 ? `, ${p.addressLine2}` : ''}</p>
                        <p className="text-sm text-gray-500">{p.city}, {p.state} {p.zipCode}</p>
                    </div>

                    {hasUnits && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Building2 className="w-3 h-3" />
                                Units & Tenants
                            </h3>
                            <div className="space-y-2">
                                {p.units?.map((u) => {
                                    const lease = unitLeaseMap[u.id];
                                    return (
                                        <div key={u.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white transition-all group">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{u.name}</p>
                                                <p className="text-[11px] text-gray-400">{u.bedrooms} Bed · {u.bathrooms} Bath</p>
                                            </div>
                                            <div className="text-right">
                                                {lease ? (
                                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                                        {lease.tenant ? `${lease.tenant.firstName}` : 'In Lease'}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Vacant</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <div className="border border-dashed border-indigo-200 rounded-2xl p-5 hover:border-indigo-400 transition-colors bg-indigo-50/20">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowInviteForm(!showInviteForm)}>
                                <div className="flex items-center gap-2">
                                    <MailPlus className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-bold text-indigo-900 text-indigo-700">Invite a Tenant</span>
                                </div>
                                <Button variant="ghost" size="sm" className="h-7 text-indigo-500 font-bold text-[10px] uppercase">
                                    {showInviteForm ? 'Close' : 'Invite'}
                                </Button>
                            </div>
                            {showInviteForm && (
                                <InviteForm property={p} onSuccess={() => setShowInviteForm(false)} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Properties = () => {
    const queryClient = useQueryClient();
    const { openModal } = useUIStore();
    const [viewProperty, setViewProperty] = useState<Property | null>(null);

    const { data: properties, isLoading, error } = useQuery({
        queryKey: ['properties'],
        queryFn: () => apiClient.get<Property[]>('/properties'),
    });

    const deleteMutation = useMutation({
        mutationFn: (propertyId: string) => apiClient.delete(`/properties/${propertyId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            toast.success('Property deleted successfully');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to delete property');
        }
    });

    const handleDelete = (property: Property) => {
        if (confirm(`Are you sure you want to delete ${property.name}? This will also delete all associated units and data.`)) {
            deleteMutation.mutate(property.id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <>
            <NavBar title="Property Portfolio" subtitle="Manage your real estate assets" />

            {viewProperty && (
                <ViewPropertyPanel
                    property={viewProperty}
                    onClose={() => setViewProperty(null)}
                />
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-br from-white to-gray-50/30">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Main Assets</h2>
                        <p className="text-sm text-gray-400 mt-0.5">List of all your active property listings</p>
                    </div>
                    <Button
                        onClick={() => openModal('createProperty')}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 rounded-xl px-6 h-11 font-bold gap-2 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Property
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest px-8 py-5">Asset</th>
                                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest px-8 py-5">Location</th>
                                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest px-8 py-5">Annual Rent</th>
                                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest px-8 py-5">Structure</th>
                                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest px-8 py-5">Status</th>
                                <th className="text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest px-8 py-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {properties && properties.length > 0 ? (
                                properties.map((p: Property) => (
                                    <tr key={p.id} className="hover:bg-gray-50/30 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors shadow-sm">
                                                    <Building2 className="w-6 h-6 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{p.name}</p>
                                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">{p.propertyType}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm text-gray-600 font-medium">{p.addressLine1}</p>
                                            <p className="text-xs text-gray-400">{p.city}, {p.state}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-[15px] font-bold text-gray-900">₦{Number(p.rentAmount || 0).toLocaleString()}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm text-gray-500 font-medium">
                                                {UNIT_BASED.includes(p.propertyType) && p.units?.length
                                                    ? `${p.units.length} Unit${p.units.length > 1 ? 's' : ''}`
                                                    : p.bedrooms + ' Bed Asset'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm
                                                ${STATUS_STYLES[p.status] ?? STATUS_STYLES.available}`}>
                                                {STATUS_LABEL[p.status] ?? p.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setViewProperty(p)}
                                                    className="h-10 w-10 p-0 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openModal('editProperty', p)}
                                                    className="h-10 w-10 p-0 text-gray-500 hover:bg-gray-100 rounded-xl"
                                                >
                                                    <Pencil className="w-5 h-5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(p)}
                                                    disabled={deleteMutation.isPending}
                                                    className="h-10 w-10 p-0 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl"
                                                >
                                                    {deleteMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto animate-in fade-in zoom-in duration-500">
                                            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-gray-100 border border-gray-100">
                                                <Building2 className="w-12 h-12 text-indigo-100" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Properties found</h3>
                                            <p className="text-sm text-gray-400 mb-10 leading-relaxed">
                                                Your property portfolio is waiting for its first listing. Add a property to start tracking leases, vacancies, and maintenance.
                                            </p>
                                            <Button
                                                onClick={() => openModal('createProperty')}
                                                className="bg-indigo-600 hover:bg-indigo-700 h-12 px-10 rounded-2xl font-bold shadow-xl shadow-indigo-100 gap-3 group transition-all active:scale-95"
                                            >
                                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                                Register First Property
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal type="createProperty" title="Add New Property" description="Enter the details of your new rental property." size='lg'>
                <PropertyForm />
            </Modal>
            <Modal type="editProperty" title="Edit Property" description="Update the information for this property.">
                <PropertyForm />
            </Modal>
        </>
    );
};

export default Properties;