// src/lib/db/models/Registration.ts
import { getCollection } from '@/lib/mongodb';
import { Registration, RegistrationStatus } from '@/types/camp';
import { ObjectId, Filter, UpdateFilter } from 'mongodb';

// Internal MongoDB document type - NO extends MongoDocument
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

// Type for creating new registration (without _id)
type RegistrationInput = Omit<RegistrationDoc, '_id'>;

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
    
    const now = new Date();
    const registrationDoc: RegistrationInput = {
      campId: regData.campId,
      userId: regData.userId,
      userName: regData.userName,
      userEmail: regData.userEmail,
      status: RegistrationStatus.PENDING,
      appliedAt: now,
      reviewedAt: regData.reviewedAt,
      reviewedBy: regData.reviewedBy,
      notes: regData.notes,
    };

    const result = await collection.insertOne(registrationDoc);
    
    return {
      _id: result.insertedId.toString(),
      campId: registrationDoc.campId,
      userId: registrationDoc.userId,
      userName: registrationDoc.userName,
      userEmail: registrationDoc.userEmail,
      status: registrationDoc.status,
      appliedAt: registrationDoc.appliedAt,
      reviewedAt: registrationDoc.reviewedAt,
      reviewedBy: registrationDoc.reviewedBy,
      notes: registrationDoc.notes,
    };
  }

  static async findById(id: string): Promise<Registration | null> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    const filter: Filter<RegistrationDoc> = { _id: new ObjectId(id) } as Filter<RegistrationDoc>;
    const reg = await collection.findOne(filter);
    
    if (!reg) return null;
    return this.toPublic(reg as RegistrationDoc);
  }

  static async findByCamp(campId: string): Promise<Registration[]> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    const filter: Filter<RegistrationDoc> = { campId } as Filter<RegistrationDoc>;
    const registrations = await collection
      .find(filter)
      .sort({ appliedAt: -1 })
      .toArray();
    
    return registrations.map(doc => this.toPublic(doc as RegistrationDoc));
  }

  static async findByUser(userId: string): Promise<Registration[]> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    const filter: Filter<RegistrationDoc> = { userId } as Filter<RegistrationDoc>;
    const registrations = await collection
      .find(filter)
      .sort({ appliedAt: -1 })
      .toArray();
    
    return registrations.map(doc => this.toPublic(doc as RegistrationDoc));
  }

  static async checkDuplicate(userId: string, campId: string): Promise<boolean> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    const filter: Filter<RegistrationDoc> = { userId, campId } as Filter<RegistrationDoc>;
    const count = await collection.countDocuments(filter);
    return count > 0;
  }

  static async updateStatus(
    id: string, 
    status: RegistrationStatus, 
    reviewedBy: string, 
    notes?: string
  ): Promise<Registration | null> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    const filter: Filter<RegistrationDoc> = { _id: new ObjectId(id) } as Filter<RegistrationDoc>;
    
    const updateFields: Partial<RegistrationDoc> = {
      status,
      reviewedBy,
      reviewedAt: new Date(),
      ...(notes && { notes }),
    };
    
    const updateDoc: UpdateFilter<RegistrationDoc> = {
      $set: updateFields as Partial<RegistrationDoc>,
    };

    const result = await collection.findOneAndUpdate(filter, updateDoc, {
      returnDocument: 'after',
    });

    if (!result) return null;
    return this.toPublic(result as RegistrationDoc);
  }

  static async delete(id: string): Promise<boolean> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    const filter: Filter<RegistrationDoc> = { _id: new ObjectId(id) } as Filter<RegistrationDoc>;
    const result = await collection.deleteOne(filter);
    return result.deletedCount > 0;
  }

  static async countByCamp(campId: string, status?: RegistrationStatus): Promise<number> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    const filter: Filter<RegistrationDoc> = (status 
      ? { campId, status } 
      : { campId }) as Filter<RegistrationDoc>;
    
    return collection.countDocuments(filter);
  }

  static async findByStatus(status: RegistrationStatus): Promise<Registration[]> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    const filter: Filter<RegistrationDoc> = { status } as Filter<RegistrationDoc>;
    const registrations = await collection
      .find(filter)
      .sort({ appliedAt: -1 })
      .toArray();
    
    return registrations.map(doc => this.toPublic(doc as RegistrationDoc));
  }

  static async getPendingCount(): Promise<number> {
    const collection = await getCollection<RegistrationDoc>(this.collectionName);
    const filter: Filter<RegistrationDoc> = { 
      status: RegistrationStatus.PENDING 
    } as Filter<RegistrationDoc>;
    
    return collection.countDocuments(filter);
  }
}
