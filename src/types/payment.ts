// src/types/payment.ts
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CONFIRMED = 'confirmed',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export interface Payment {
  _id: string;
  registrationId: string;
  campId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  organizerId: string;
  amount: number;
  discount: number;
  finalAmount: number;
  promoCode?: string;
  status: PaymentStatus;
  qrCodeUrl?: string;
  slipUrl?: string;
  slipVerified?: boolean;
  requiresManualReview?: boolean;
  slipUploadedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
  paidAt?: Date;
  confirmedAt?: Date;
  releasedAt?: Date;
  autoReleaseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
