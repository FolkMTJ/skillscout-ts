// src/lib/db/models/User.ts
import { getCollection } from '@/lib/mongodb';
import { ObjectId, Filter } from 'mongodb';
import { UserRole, User, OTP } from '@/types';

interface UserDoc {
  _id?: ObjectId;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  lineId?: string;
  bio?: string;
  profileImage?: string;
  organization?: string;
  idCard?: string;
  address?: string;
  province?: string;
  district?: string;
  isBanned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface OTPDoc {
  _id?: ObjectId;
  email: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}

export class UserModel {
  private static collectionName = 'users';
  private static otpCollectionName = 'otps';

  private static toPublic(doc: UserDoc): User {
    const { _id, ...rest } = doc;
    return {
      ...rest,
      _id: _id?.toString() || '',
    };
  }

  static async create(userData: {
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
    lineId?: string;
    organization?: string;
    idCard?: string;
    address?: string;
    province?: string;
    district?: string;
  }): Promise<User> {
    const collection = await getCollection<UserDoc>(this.collectionName);
    
    const existing = await collection.findOne({ email: userData.email } as Filter<UserDoc>);
    if (existing) {
      throw new Error('อีเมลนี้มีในระบบแล้ว');
    }

    const now = new Date();
    const user: Omit<UserDoc, '_id'> = {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      phone: userData.phone,
      lineId: userData.lineId,
      organization: userData.organization,
      idCard: userData.idCard,
      address: userData.address,
      province: userData.province,
      district: userData.district,
      isBanned: false,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(user);
    
    return {
      _id: result.insertedId.toString(),
      ...user,
    };
  }

  static async findByEmail(email: string): Promise<UserDoc | null> {
    const collection = await getCollection<UserDoc>(this.collectionName);
    return collection.findOne({ email } as Filter<UserDoc>);
  }

  static async findById(id: string): Promise<User | null> {
    const collection = await getCollection<UserDoc>(this.collectionName);
    const user = await collection.findOne({ _id: new ObjectId(id) } as Filter<UserDoc>);
    
    if (!user) return null;
    return this.toPublic(user);
  }

  static async findAll(): Promise<User[]> {
    const collection = await getCollection<UserDoc>(this.collectionName);
    const users = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return users.map(doc => this.toPublic(doc));
  }

  static async update(id: string, updates: Partial<Omit<User, '_id'>>): Promise<boolean> {
    const collection = await getCollection<UserDoc>(this.collectionName);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) } as Filter<UserDoc>,
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const collection = await getCollection<UserDoc>(this.collectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) } as Filter<UserDoc>);
    return result.deletedCount > 0;
  }

  static async createOTP(email: string): Promise<string> {
    const collection = await getCollection<OTPDoc>(this.otpCollectionName);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await collection.deleteMany({ email } as Filter<OTPDoc>);
    
    const otpDoc: Omit<OTPDoc, '_id'> = {
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
    };
    
    await collection.insertOne(otpDoc);
    
    return otp;
  }

  static async verifyOTP(email: string, otp: string): Promise<boolean> {
    const collection = await getCollection<OTPDoc>(this.otpCollectionName);
    
    const otpDoc = await collection.findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() },
    } as Filter<OTPDoc>);
    
    if (!otpDoc) return false;
    
    await collection.deleteOne({ _id: otpDoc._id } as Filter<OTPDoc>);
    
    return true;
  }
}
