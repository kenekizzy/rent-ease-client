import NavBar from '../../components/general/NavBar';
import { Plus, Building2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { PropertyForm } from './components/PropertyForm';

/**
 * Properties Component
 * Displays a list of properties fetched from the backend.
 * Provides functionality to add or edit properties via a global modal.
 */
const Properties = () => {
    const { openModal } = useUIStore();

    // Fetch properties using React Query
    const { data: properties, isLoading, error } = useQuery({
        queryKey: ['properties'],
        queryFn: () => apiClient.get<any[]>('/properties'),
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
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Rent</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Status</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Tenant</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties?.map((p: any) => (
                                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                                                <p className="text-xs text-gray-400 uppercase font-medium">{p.propertyType}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-sm text-gray-600">{p.addressLine1}</td>
                                    <td className="py-4 text-sm font-semibold text-gray-900">${p.rentAmount.toLocaleString()}/mo</td>
                                    <td className="py-4">
                                        <span
                                            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${p.status === "occupied"
                                                ? "bg-green-50 text-green-700 border-green-200"
                                                : "bg-orange-50 text-orange-700 border-orange-200"
                                                }`}
                                        >
                                            {p.status || 'Available'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-sm text-gray-600">{p.tenant?.name || "—"}</td>
                                    <td className="py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 font-medium">View</Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openModal('editProperty', p)}
                                                className="text-gray-500 hover:text-gray-700 font-medium"
                                            >
                                                Edit
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
            <Modal
                type="createProperty"
                title="Add New Property"
                description="Enter the details of your new rental property."
            >
                <PropertyForm />
            </Modal>

            <Modal
                type="editProperty"
                title="Edit Property"
                description="Update the information for this property."
            >
                <PropertyForm />
            </Modal>
        </>
    );
};

export default Properties