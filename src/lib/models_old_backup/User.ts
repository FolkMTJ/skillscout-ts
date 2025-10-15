// src/lib/models/User.ts
import { getCollection } from '@/lib/mongodb';
import { ObjectId, Filter, UpdateFilter } from 'mongodb';

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'organizer' | 'admin';
  image?: string;
  isBanned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserDoc {
  _id?: ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'organizer' | 'admin';
  image?: string;
  isBanned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserModel {
  private static collectionName = 'users';

  private static toPublic(doc: UserDoc): User {
    const { _id, password, ...rest } = doc;
    return {
      ...rest,
      _id: _id?.toString() || '',
    };
  }

  static async findById(id: string): Promise<User | null> {
    const collection = await getCollection<UserDoc>(this.collectionName);
    const filter: Filter<UserDoc> = { _id: new ObjectId(id) } as Filter<UserDoc>;
    const user = await collection.findOne(filter);
    
    if (!user) return null;
    return this.toPublic(user);
  }

  static async findByEmail(email: string): Promise<User | null> {
    const collection = await getCollection<UserDoc>(this.collectionName);
    const filter: Filter<UserDoc> = { email } as Filter<UserDoc>;
    const user = await collection.findOne(filter);
    
    if (!user) return null;
    return this.toPublic(user);
  }

  static async findAll(): Promise<User[]> {
    const collection = await getCollection<UserDoc>(this.collectionName);
    
    const users = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return users.map(doc => this.toPublic(doc));
  }

  static async update(id: string, updates: Partial<Omit<User, '_id'>>): Promise<boolean> {
    const collection = await getCollection<UserDoc>(this.collectionName);
    
    const filter: Filter<UserDoc> = { _id: new ObjectId(id) } as Filter<UserDoc>;
    const updateFields: Partial<UserDoc> = {
      ...updates,
      updatedAt: new Date(),
    };
    
    const update: UpdateFilter<UserDoc> = {
      $set: updateFields as Partial<UserDoc>,
    };
    
    const result = await collection.updateOne(filter, update);
    return result.modifiedCount > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const collection = await getCollection<UserDoc>(this.collectionName);
    const filter: Filter<UserDoc> = { _id: new ObjectId(id) } as Filter<UserDoc>;
    const result = await collection.deleteOne(filter);
    return result.deletedCount > 0;
  }

  static async create(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const collection = await getCollection<UserDoc>(this.collectionName);
    
    const now = new Date();
    const userDoc: Omit<UserDoc, '_id'> = {
      ...userData,
      isBanned: false,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(userDoc as UserDoc);
    
    return {
      _id: result.insertedId.toString(),
      ...userDoc,
    };
  }
}
