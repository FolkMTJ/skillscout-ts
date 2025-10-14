// src/lib/db/models/Payment.ts
import { getCollection } from '@/lib/mongodb';
import { ObjectId, Filter, UpdateFilter } from 'mongodb';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CONFIRMED = 'confirmed', // User confirmed completion
  RELEASED = 'released', // Money released to organizer
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export interface Payment {
  _id: string;
  registrationId: string;
  campId: string;
  userId: string;
  organizerId: string;
  amount: number;
  discount: number;
  finalAmount: number;
  promoCode?: string;
  status: PaymentStatus;
  qrCodeUrl?: string;
  slipUrl?: string;
  paidAt?: Date;
  confirmedAt?: Date;
  releasedAt?: Date;
  autoReleaseDate?: Date; // 15 days after completion
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentDoc {
  _id?: ObjectId;
  registrationId: string;
  campId: string;
  userId: string;
  organizerId: string;
  amount: number;
  discount: number;
  finalAmount: number;
  promoCode?: string;
  status: PaymentStatus;
  qrCodeUrl?: string;
  slipUrl?: string;
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

  static async updateStatus(id: string, status: PaymentStatus, additionalData?: Partial<Payment>): Promise<boolean> {
    const collection = await getCollection<PaymentDoc>(this.collectionName);
    const filter: Filter<PaymentDoc> = { _id: new ObjectId(id) } as Filter<PaymentDoc>;
    
    const updateFields: any = {
      status,
      updatedAt: new Date(),
      ...additionalData
    };

    // Set auto-release date when payment is completed
    if (status === PaymentStatus.COMPLETED && !additionalData?.autoReleaseDate) {
      const releaseDate = new Date();
      releaseDate.setDate(releaseDate.getDate() + 15); // 15 days from now
      updateFields.autoReleaseDate = releaseDate;
      updateFields.paidAt = new Date();
    }

    // Set confirmed date when user confirms
    if (status === PaymentStatus.CONFIRMED) {
      updateFields.confirmedAt = new Date();
    }

    // Set released date when money is released
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
}
