// src/lib/db/models/Payment.ts
import { getCollection } from '@/lib/mongodb';
import { ObjectId, Filter, UpdateFilter } from 'mongodb';
import { Payment, PaymentStatus } from '@/types';

interface PaymentDoc {
  _id?: ObjectId;
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

export class PaymentModel {
  private static collectionName = 'payments';

  private static toPublic(doc: PaymentDoc): Payment {
    const { _id, ...rest } = doc;
    return {
      ...rest,
      _id: _id?.toString() || '',
    };
  }

  static async create(paymentData: Omit<Payment, '_id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Payment> {
    const collection = await getCollection<PaymentDoc>(this.collectionName);
    
    const now = new Date();
    const paymentDoc: Omit<PaymentDoc, '_id'> = {
      ...paymentData,
      status: PaymentStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(paymentDoc as PaymentDoc);
    
    return {
      _id: result.insertedId.toString(),
      ...paymentDoc,
      status: PaymentStatus.PENDING,
    };
  }

  static async findById(id: string): Promise<Payment | null> {
    const collection = await getCollection<PaymentDoc>(this.collectionName);
    const filter: Filter<PaymentDoc> = { _id: new ObjectId(id) } as Filter<PaymentDoc>;
    const payment = await collection.findOne(filter);
    
    if (!payment) return null;
    return this.toPublic(payment);
  }

  static async findByRegistration(registrationId: string): Promise<Payment | null> {
    const collection = await getCollection<PaymentDoc>(this.collectionName);
    const filter: Filter<PaymentDoc> = { registrationId } as Filter<PaymentDoc>;
    const payment = await collection.findOne(filter);
    
    if (!payment) return null;
    return this.toPublic(payment);
  }

  static async updateStatus(id: string, status: PaymentStatus, additionalData?: Partial<Omit<PaymentDoc, '_id'>>): Promise<boolean> {
    const collection = await getCollection<PaymentDoc>(this.collectionName);
    const filter: Filter<PaymentDoc> = { _id: new ObjectId(id) } as Filter<PaymentDoc>;
    
    const updateFields: Partial<PaymentDoc> = {
      status,
      updatedAt: new Date(),
      ...additionalData
    };

    if (status === PaymentStatus.COMPLETED && !additionalData?.autoReleaseDate) {
      const releaseDate = new Date();
      releaseDate.setDate(releaseDate.getDate() + 15);
      updateFields.autoReleaseDate = releaseDate;
      updateFields.paidAt = new Date();
    }

    if (status === PaymentStatus.CONFIRMED) {
      updateFields.confirmedAt = new Date();
    }

    if (status === PaymentStatus.RELEASED) {
      updateFields.releasedAt = new Date();
    }

    const update: UpdateFilter<PaymentDoc> = {
      $set: updateFields,
    };
    
    const result = await collection.updateOne(filter, update);
    return result.modifiedCount > 0;
  }

  static async findPendingAutoRelease(): Promise<Payment[]> {
    const collection = await getCollection<PaymentDoc>(this.collectionName);
    const now = new Date();
    
    const filter: Filter<PaymentDoc> = {
      status: PaymentStatus.COMPLETED,
      autoReleaseDate: { $lte: now }
    } as Filter<PaymentDoc>;
    
    const payments = await collection.find(filter).toArray();
    return payments.map(doc => this.toPublic(doc));
  }

  static async findByOrganizer(organizerId: string): Promise<Payment[]> {
    const collection = await getCollection<PaymentDoc>(this.collectionName);
    const filter: Filter<PaymentDoc> = { organizerId } as Filter<PaymentDoc>;
    
    const payments = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    return payments.map(doc => this.toPublic(doc));
  }

  static async find(filter: Filter<PaymentDoc>): Promise<Payment[]> {
    const collection = await getCollection<PaymentDoc>(this.collectionName);
    
    const payments = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    return payments.map(doc => this.toPublic(doc));
  }
}
