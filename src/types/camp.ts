// src/types/camp.ts
export enum UserRole {
  USER = 'user',
  ORGANIZER = 'organizer',
  ADMIN = 'admin'
}

export enum CampStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  FULL = 'full',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export enum RegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  lineId?: string;
  bio?: string;
  profileImage?: string;
  organization?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Camp {
  _id: string;
  name: string;
  description: string;
  thumbnail?: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  location: string;
  capacity: number;
  enrolled: number;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  status: CampStatus;
  tags: string[];
  requirements: string[];
  syllabus?: string[];
  fee: number;
  contact: {
    email: string;
    phone?: string;
    line?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Registration {
  _id: string;
  campId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  status: RegistrationStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
  answers?: {
    question: string;
    answer: string;
  }[];
}