"use client"
import NavBar from '../../components/general/NavBar';
import { Plus, Building2, Loader2, Eye, Pencil, MailPlus, X, CheckCircle2 } from 'lucide-react';
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

const UNIT_BASED = ['apartment', 'studio', 'commercial'];

// ─── Invite Tenant Form ───────────────────────────────────────────────────────
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
                unit: hasUnits ? unit : undefined,
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
                                <SelectItem key={u} value={u}>{u}</SelectItem>
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

// ─── View Property Panel ──────────────────────────────────────────────────────
interface ViewPropertyPanelProps {
    property: Property;
    onClose: () => void;
}

function ViewPropertyPanel({ property, onClose }: ViewPropertyPanelProps) {
    const [showInviteForm, setShowInviteForm] = useState(false);

    // Fetch full property details (with leases) when the panel opens
    const { data: detail, isLoading } = useQuery<Property>({
        queryKey: ['property', property.id],
        queryFn: () => apiClient.get<Property>(`/properties/${property.id}`),
    });

    const p = detail ?? property;
    const hasUnits = UNIT_BASED.includes(p.propertyType) && (p.units?.length ?? 0) > 0;
    const activeLeases = (p.leases ?? []).filter(l => l.status === 'active' || l.status === 'pending_acceptance');

    // Build a map of unit → active lease for quick lookup
    const unitLeaseMap: Record<string, Lease | undefined> = {};
    if (hasUnits) {
        for (const lease of activeLeases) {
            if (lease.unit) unitLeaseMap[lease.unit] = lease;
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-indigo-500">
                    <div>
                        <h2 className="text-white font-bold text-lg">{p.addressLine1}</h2>
                        <p className="text-indigo-200 text-sm capitalize">{p.propertyType} · {p.city}, {p.state}</p>
                    </div>
                    <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {isLoading && (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        </div>
                    )}

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-indigo-50 rounded-xl p-4 text-center">
                            <p className="text-xl font-bold text-indigo-700">₦{(p.rentAmount / 1000).toFixed(0)}k</p>
                            <p className="text-xs text-indigo-400 mt-1">Annual rent</p>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-4 text-center">
                            <p className="text-xl font-bold text-indigo-700">{hasUnits ? p.units!.length : 1}</p>
                            <p className="text-xs text-indigo-400 mt-1">{hasUnits ? 'Total units' : 'Unit'}</p>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-4 text-center">
                            <p className="text-xl font-bold text-indigo-700">{activeLeases.length}</p>
                            <p className="text-xs text-indigo-400 mt-1">Active leases</p>
                        </div>
                    </div>

                    {/* Units overview */}
                    {hasUnits && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 mb-3">Units</h3>
                            <div className="space-y-2">
                                {p.units!.map((u) => {
                                    const lease = unitLeaseMap[u];
                                    return (
                                        <div key={u} className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-gray-100 bg-gray-50">
                                            <span className="text-sm font-medium text-gray-700">{u}</span>
                                            {lease ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">
                                                        {lease.tenant
                                                            ? `${lease.tenant.firstName} ${lease.tenant.lastName}`
                                                            : lease.tenantEmail ?? '—'}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
                                                        ${lease.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                        {lease.status === 'active' ? 'Occupied' : 'Pending'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">Vacant</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Active Leases (non-unit based) */}
                    {!hasUnits && activeLeases.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 mb-3">Current Tenant</h3>
                            {activeLeases.map((lease) => (
                                <div key={lease.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg border border-gray-100 bg-gray-50">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {lease.tenant
                                                ? `${lease.tenant.firstName} ${lease.tenant.lastName}`
                                                : lease.tenantEmail ?? 'Tenant'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Until {new Date(lease.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Invite Tenant */}
                    <div className="border border-dashed border-indigo-200 rounded-xl p-4">
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setShowInviteForm(!showInviteForm)}
                        >
                            <div className="flex items-center gap-2">
                                <MailPlus className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm font-semibold text-indigo-700">Invite Tenant</span>
                            </div>
                            <span className="text-indigo-400 text-xs">{showInviteForm ? 'Cancel' : 'Expand'}</span>
                        </div>
                        {showInviteForm && (
                            <InviteForm
                                property={p}
                                onSuccess={() => setShowInviteForm(false)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Properties Component ────────────────────────────────────────────────
const Properties = () => {
    const { openModal } = useUIStore();
    const [viewProperty, setViewProperty] = useState<Property | null>(null);

    const { data: properties, isLoading, error } = useQuery({
        queryKey: ['properties'],
        queryFn: () => apiClient.get<Property[]>('/properties'),
    });

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
                <p className="text-red-500 font-medium">Failed to load properties</p>
                <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
            </div>
        );
    }

    return (
        <>
            <NavBar title="Properties" subtitle="Manage your properties" />

            {/* View Property Side Panel */}
            {viewProperty && (
                <ViewPropertyPanel
                    property={viewProperty}
                    onClose={() => setViewProperty(null)}
                />
            )}

            {/* Properties Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Property Management</h2>
                        <p className="text-sm text-gray-400">Manage all your rental properties</p>
                    </div>
                    <Button
                        onClick={() => openModal('createProperty')}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Property
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Property</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Address</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Rent/yr</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Units</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Status</th>
                                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties?.map((p: Property) => (
                                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{p.addressLine1}</p>
                                                <p className="text-xs text-gray-400 uppercase font-medium">{p.propertyType}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-sm text-gray-600">{p.city}, {p.state}</td>
                                    <td className="py-4 text-sm font-semibold text-gray-900">
                                        ₦{Number(p.rentAmount).toLocaleString()}
                                    </td>
                                    <td className="py-4 text-sm text-gray-500">
                                        {UNIT_BASED.includes(p.propertyType) && p.units?.length
                                            ? `${p.units.length} unit${p.units.length > 1 ? 's' : ''}`
                                            : '—'}
                                    </td>
                                    <td className="py-4">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[p.status] ?? STATUS_STYLES.available}`}>
                                            {STATUS_LABEL[p.status] ?? p.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setViewProperty(p)}
                                                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openModal('editProperty', p)}
                                                className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
                                            >
                                                <Pencil className="w-3.5 h-3.5" /> Edit
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {properties?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-400">
                                        No properties found. Add your first property to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <Modal type="createProperty" title="Add New Property" description="Enter the details of your new rental property.">
                <PropertyForm />
            </Modal>

            <Modal type="editProperty" title="Edit Property" description="Update the information for this property.">
                <PropertyForm />
            </Modal>
        </>
    );
};

export default Properties;