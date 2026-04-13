export type DocumentAccessLevel = 'landlord' | 'tenant' | 'both';
export type DocumentFileType = 'pdf' | 'image' | 'text' | 'spreadsheet' | 'other';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string | null;
  role: 'landlord' | 'tenant';
  createdAt: Date;
}

export interface PropertyUnit {
  id: string;
  propertyId: string;
  leaseId?: string;
  tenantId?: string;
  name: string;
  unitType?: 'self_contain' | 'mini_flat' | 'two_bedroom' | 'three_bedroom' | 'four_bedroom' | 'five_bedroom';
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  floorNumber?: number;
  rentAmount?: number;
  status: 'available' | 'partially_occupied' | 'occupied' | 'maintenance';
  isActive: boolean;
  notes?: string;
  activeLease?: Lease;
}

export interface Property {
  id: string;
  landlordId: string;
  tenantId?: string;
  name: string;
  description?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  propertyType: 'apartment' | 'house' | 'shop' | 'studio' | 'flat' | 'commercial';
  condition?: 'new' | 'renovated' | 'old';
  bedrooms?: number;
  bathrooms?: number;
  rentAmount?: number;
  rentDurationInMonths?: number;
  additionalFees?: {
    serviceCharge?: number;
    cautionFee?: number;
    agencyFee?: number;
    legalFee?: number;
  };
  utilities?: {
    electricity?: 'prepaid' | 'postpaid' | 'none';
    water?: 'borehole' | 'well' | 'none';
    wasteManagement?: boolean;
    security?: boolean;
  };
  amenities?: string[];
  images?: string[];
  status: 'available' | 'partially_occupied' | 'occupied' | 'maintenance';
  isListed?: boolean;
  publishedAt?: string;
  units?: PropertyUnit[];
  leases?: Lease[];
  createdAt?: string;
}

export interface Lease {
  id: string;
  propertyId: string;
  tenantId?: string;
  tenantEmail?: string;
  inviteToken?: string;
  unitId?: string;
  unit?: PropertyUnit;
  landlordId: string;
  startDate: string;
  endDate: string;
  annualRent: number;
  securityDeposit: number;
  annualDueDate?: Date;
  termsText?: string;
  status: 'active' | 'expired' | 'terminated' | 'pending_acceptance';
  property?: Property;
  tenant?: { id: string; firstName: string; lastName: string; email: string; };
  createdAt?: string;
}

export interface Payment {
  id: string;
  leaseId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  paymentMethod?: string;
}

export interface Complaint {
  id: string;
  tenantId: string;
  propertyId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: Date;
}

export interface DocumentRecord {
  id: string;
  uploadedById: string;
  leaseId: string | null;
  propertyId: string | null;
  fileName: string;
  filePath: string;
  fileType: DocumentFileType;
  mimeType: string;
  fileSizeKb: number;
  version: number;
  accessLevel: DocumentAccessLevel;
  createdAt: string;
  updatedAt: string;
}

export interface UploadDocumentPayload {
  file: File;
  leaseId?: string;
  propertyId?: string;
  accessLevel?: DocumentAccessLevel;
}

export interface UploadDocumentResponse {
  message: string;
  data: DocumentRecord;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}