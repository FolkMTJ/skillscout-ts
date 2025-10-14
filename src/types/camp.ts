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

// Updated Camp interface to match our Camp Model
export interface Camp {
  _id: string;
  name: string;
  description: string;
  category: string;
  date: string;
  location: string;
  price: string;
  image: string;
  galleryImages: string[];
  deadline: string;
  participantCount: number;
  activityFormat: string;
  qualifications: {
    level: string;
    fields?: string[];
  };
  additionalInfo: string[];
  organizers?: {
    name: string;
    imageUrl: string;
  }[];
  reviews: {
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  avgRating: number;
  ratingBreakdown: Record<string, number>;
  featured?: boolean;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Additional fields for organizer
  organizerId?: string;
  organizerName?: string;
  organizerEmail?: string;
  startDate?: Date;
  endDate?: Date;
  registrationDeadline?: Date;
  capacity?: number;
  enrolled?: number;
  fee?: number;
  tags?: string[];
  status?: CampStatus;
  thumbnail?: string;
  requirements?: string[];
  syllabus?: string[];
  contact?: {
    email: string;
    phone?: string;
    line?: string;
  };
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
