export type DocumentAccessLevel = 'landlord' | 'tenant' | 'both';
export type DocumentFileType = 'pdf' | 'image' | 'text' | 'spreadsheet' | 'other';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'landlord' | 'tenant';
  createdAt: Date;
}

export interface Property {
  id: string;
  landlordId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: 'apartment' | 'house' | 'condo' | 'studio' | 'townhouse' | 'commercial';
  units?: string[];
  rentAmount: number;
  bedrooms?: number;
  bathrooms?: number;
  status: 'available' | 'partially_occupied' | 'occupied' | 'maintenance';
  leases?: Lease[];
  createdAt?: string;
}

export interface Lease {
  id: string;
  propertyId: string;
  tenantId?: string;
  tenantEmail?: string;
  inviteToken?: string;
  unit?: string;
  landlordId: string;
  startDate: Date;
  endDate: Date;
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