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
  address: string;
  city: string;
  state: string;
  zipCode: string;
  rentAmount: number;
  description?: string;
  status: 'available' | 'occupied' | 'maintenance';
  currentLease?: Lease;
}

export interface Lease {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  rentAmount: number;
  securityDeposit: number;
  status: 'active' | 'expired' | 'terminated';
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