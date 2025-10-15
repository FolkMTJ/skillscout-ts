// src/types/camp.ts
export enum CampStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  FULL = 'full',
  CLOSED = 'closed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Organizer {
  name: string;
  imageUrl: string;
}

export interface Qualifications {
  level: string;
  fields?: string[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Camp {
  _id: string;
  id?: string;
  name: string;
  category: string;
  date: string;
  location: string;
  price: string;
  image: string;
  galleryImages: string[];
  description: string;
  deadline: string;
  daysLeft?: number;
  participantCount: number;
  activityFormat: string;
  qualifications: Qualifications;
  additionalInfo: string[];
  organizers?: Organizer[];
  reviews: Review[];
  avgRating: number;
  ratingBreakdown: Record<string, number>;
  featured?: boolean;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  views?: number;
}
