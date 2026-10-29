export type UserRole = 'guest' | 'resident' | 'staff' | 'captain' | 'admin';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
  purok: string;
  avatar?: string;
  voterStatus: 'Registered Voter' | 'Non-Voter' | 'Pending Verification';
  yearsOfResidency: number;
}

export type RequestStatus =
  | 'Pending'
  | 'Processing'
  | 'Waiting for Captain\'s Signature'
  | 'Waiting for Captain Approval'
  | 'Approved'
  | 'Ready for Pickup'
  | 'Completed'
  | 'Rejected';

export interface ServiceRequirement {
  id: string;
  name: string;
  isMandatory: boolean;
  sampleVerified: boolean;
  notes?: string;
}

export interface ServiceCatalogItem {
  id: string;
  code: string;
  name: string;
  nameFilipino: string;
  category: 'Clearance' | 'Certification' | 'Permit' | 'ID' | 'Social';
  fee: number; // in PHP
  processingDays: number;
  description: string;
  descriptionFilipino: string;
  requirements: ServiceRequirement[];
  validPurposes: string[];
  isOnlineEnabled: boolean;
  certificateTitle: string;
}

export interface SubmittedDocument {
  requirementId: string;
  name: string;
  fileName: string;
  status: 'submitted' | 'verified' | 'needs_resubmission';
  submittedAt: string;
}

export interface ServiceRequest {
  id: string;
  referenceNumber: string;
  residentId: string;
  residentName: string;
  residentEmail: string;
  residentPhone: string;
  residentAddress: string;
  residentPurok: string;
  serviceId: string;
  serviceName: string;
  purpose: string;
  customDetails?: string;
  status: RequestStatus;
  fee: number;
  orNumber?: string;
  certificateNumber?: string;
  submittedDocuments: SubmittedDocument[];
  assignedStaff?: string;
  adminNote?: string;
  captainRemarks?: string;
  pickupDate?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  completedAt?: string;
  timeline: {
    title: string;
    description: string;
    timestamp: string;
    actor: string;
  }[];
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: 'advisory' | 'health' | 'program' | 'emergency';
  isPinned: boolean;
  author: string;
  authorRole: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CommunityConcern {
  id: string;
  referenceNumber: string;
  residentId: string;
  residentName: string;
  residentPhone: string;
  purok: string;
  category: 'peace_order' | 'infrastructure' | 'sanitation' | 'inquiry';
  subject: string;
  description: string;
  isUrgent: boolean;
  status: 'Under Review' | 'Investigating' | 'Action Taken' | 'Resolved';
  adminResponse?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  details: string;
}
