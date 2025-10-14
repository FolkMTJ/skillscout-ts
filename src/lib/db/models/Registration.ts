// src/lib/db/models/Registration.ts
import { getCollection } from '@/lib/mongodb';
import { Registration, RegistrationStatus } from '@/types/camp';
import { ObjectId, Filter, UpdateFilter } from 'mongodb';

// Internal MongoDB document type
interface RegistrationDoc {
  _id?: ObjectId;
  campId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: RegistrationStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

export class RegistrationModel {
  private static collectionName = 'registrations';

  // Helper: Convert MongoDB doc to public Registration
  private static toPublic(doc: RegistrationDoc): Registration {
    const { _id, ...rest } = doc;
    return {
      ...rest,
      _id: _id?.toString() || '',
    };
  }

  static async create(regData: Omit<Registration, '_id' | 'appliedAt' | 'status'>): Promise<Registration> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    
    const registration: RegistrationDoc = {
      ...regData,
      status: RegistrationStatus.PENDING,
      appliedAt: new Date(),
    };

    const result = await collection.insertOne(registration);
    return { ...registration, _id: result.insertedId.toString() };
  }

  static async findById(id: string): Promise<Registration | null> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    const filter: Filter<RegistrationDoc> = { _id: new ObjectId(id) };
    const reg = await collection.findOne(filter) as RegistrationDoc | null;
    
    if (!reg) return null;
    return this.toPublic(reg);
  }

  static async findByCamp(campId: string): Promise<Registration[]> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    const filter: Filter<RegistrationDoc> = { campId };
    const regs = await collection
      .find(filter)
      .sort({ appliedAt: -1 })
      .toArray() as RegistrationDoc[];
    
    return regs.map(this.toPublic);
  }

  static async findByUser(userId: string): Promise<Registration[]> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    const filter: Filter<RegistrationDoc> = { userId };
    const regs = await collection
      .find(filter)
      .sort({ appliedAt: -1 })
      .toArray() as RegistrationDoc[];
    
    return regs.map(this.toPublic);
  }

  static async checkDuplicate(userId: string, campId: string): Promise<boolean> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    const filter: Filter<RegistrationDoc> = { userId, campId };
    const count = await collection.countDocuments(filter);
    return count > 0;
  }

  static async updateStatus(
    id: string, 
    status: RegistrationStatus, 
    reviewedBy: string, 
    notes?: string
  ): Promise<boolean> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    
    const filter: Filter<RegistrationDoc> = { _id: new ObjectId(id) };
    const update: UpdateFilter<RegistrationDoc> = { 
      $set: { 
        status, 
        reviewedAt: new Date(),
        reviewedBy,
        ...(notes && { notes })
      } 
    };
    
    const result = await collection.updateOne(filter, update);
    return result.modifiedCount > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    const filter: Filter<RegistrationDoc> = { _id: new ObjectId(id) };
    const result = await collection.deleteOne(filter);
    return result.deletedCount > 0;
  }
}