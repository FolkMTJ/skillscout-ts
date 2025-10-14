// src/lib/db/models/User.ts
import { getCollection } from '@/lib/mongodb';
import { ObjectId, Filter } from 'mongodb';
import { UserRole } from '@/types/camp';

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
  }) {
    const collection = await getCollection<UserDoc>(this.collectionName);
    
    // Check if user exists
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
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(user);
    
    return {
      _id: result.insertedId.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  static async findByEmail(email: string) {
    const collection = await getCollection<UserDoc>(this.collectionName);
    return collection.findOne({ email } as Filter<UserDoc>);
  }

  static async findById(id: string) {
    const collection = await getCollection<UserDoc>(this.collectionName);
    return collection.findOne({ _id: new ObjectId(id) } as Filter<UserDoc>);
  }

  static async update(id: string, updates: Partial<UserDoc>) {
    const collection = await getCollection<UserDoc>(this.collectionName);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) } as Filter<UserDoc>,
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  // OTP Methods
  static async createOTP(email: string): Promise<string> {
    const collection = await getCollection<OTPDoc>(this.otpCollectionName);
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Delete old OTPs for this email
    await collection.deleteMany({ email } as Filter<OTPDoc>);
    
    // Create new OTP (expires in 10 minutes)
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
    
    // Delete used OTP
    await collection.deleteOne({ _id: otpDoc._id } as Filter<OTPDoc>);
    
    return true;
  }
}
