// src/types/registration.ts
export enum RegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  CONFIRMED = 'confirmed',
  ATTENDED = 'attended'
}

export interface Registration {
  _id: string;
  campId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  status: RegistrationStatus | 'attended';
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
  answers?: {
    question: string;
    answer: string;
  }[];
}
