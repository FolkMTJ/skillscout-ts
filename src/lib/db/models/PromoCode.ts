// src/lib/db/models/PromoCode.ts
import { getCollection } from '@/lib/mongodb';
import { ObjectId, Filter } from 'mongodb';
import { PromoCode, DiscountType } from '@/types';

interface PromoCodeDoc {
  _id?: ObjectId;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableCamps?: string[];
  createdBy: string;
  createdAt: Date;
  description?: string;
}

export class PromoCodeModel {
  private static collectionName = 'promocodes';

  private static toPublic(doc: PromoCodeDoc): PromoCode {
    const { _id, ...rest } = doc;
    return {
      ...rest,
      _id: _id?.toString() || '',
    };
  }

  static async create(
    promoData: Omit<PromoCode, '_id' | 'usedCount' | 'createdAt' | 'createdBy'>,
    createdBy: string
  ): Promise<PromoCode> {
    const collection = await getCollection<PromoCodeDoc>(this.collectionName);

    // Check if code already exists
    const existing = await this.findByCode(promoData.code);
    if (existing) {
      throw new Error('รหัสโปรโมชั่นนี้มีอยู่แล้ว');
    }

    const promoDoc: Omit<PromoCodeDoc, '_id'> = {
      ...promoData,
      code: promoData.code.toUpperCase(),
      usedCount: 0,
      createdAt: new Date(),
      createdBy,
    };

    const result = await collection.insertOne(promoDoc as PromoCodeDoc);

    return {
      _id: result.insertedId.toString(),
      ...promoDoc,
    };
  }

  static async findByCode(code: string): Promise<PromoCode | null> {
    const collection = await getCollection<PromoCodeDoc>(this.collectionName);
    const filter: Filter<PromoCodeDoc> = {
      code: code.toUpperCase()
    } as Filter<PromoCodeDoc>;

    const promo = await collection.findOne(filter);
    if (!promo) return null;
    return this.toPublic(promo);
  }

  static async findById(id: string): Promise<PromoCode | null> {
    const collection = await getCollection<PromoCodeDoc>(this.collectionName);
    const filter: Filter<PromoCodeDoc> = {
      _id: new ObjectId(id)
    } as Filter<PromoCodeDoc>;

    const promo = await collection.findOne(filter);
    if (!promo) return null;
    return this.toPublic(promo);
  }

  static async validate(code: string, amount: number, campId?: string): Promise<{
    valid: boolean;
    discount: number;
    message?: string;
    promoCode?: PromoCode;
  }> {
    const promo = await this.findByCode(code);

    if (!promo) {
      return { valid: false, discount: 0, message: 'รหัสโปรโมชั่นไม่ถูกต้อง' };
    }

    const now = new Date();

    if (!promo.isActive) {
      return { valid: false, discount: 0, message: 'รหัสโปรโมชั่นนี้ถูกปิดใช้งานแล้ว' };
    }

    if (now < promo.validFrom || now > promo.validUntil) {
      return { valid: false, discount: 0, message: 'รหัสโปรโมชั่นหมดอายุแล้ว' };
    }

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return { valid: false, discount: 0, message: 'รหัสโปรโมชั่นถูกใช้งานครบแล้ว' };
    }

    if (promo.minAmount && amount < promo.minAmount) {
      return {
        valid: false,
        discount: 0,
        message: `ยอดขั้นต่ำ ฿${promo.minAmount}`
      };
    }

    // ตรวจสอบว่าโค้ดใช้ได้กับค่ายนี้หรือไม่
    if (campId && promo.applicableCamps && promo.applicableCamps.length > 0) {
      if (!promo.applicableCamps.includes(campId)) {
        return { valid: false, discount: 0, message: 'รหัสนี้ใช้ไม่ได้กับค่ายนี้' };
      }
    }

    let discount = 0;
    if (promo.discountType === DiscountType.PERCENTAGE) {
      discount = (amount * promo.discountValue) / 100;
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.discountValue;
    }

    discount = Math.min(discount, amount);

    return {
      valid: true,
      discount: Math.round(discount),
      promoCode: promo
    };
  }

  static async incrementUsage(code: string): Promise<boolean> {
    const collection = await getCollection<PromoCodeDoc>(this.collectionName);
    const filter: Filter<PromoCodeDoc> = {
      code: code.toUpperCase()
    } as Filter<PromoCodeDoc>;

    const result = await collection.updateOne(
      filter,
      { $inc: { usedCount: 1 } }
    );

    return result.modifiedCount > 0;
  }

  static async findAll(): Promise<PromoCode[]> {
    const collection = await getCollection<PromoCodeDoc>(this.collectionName);
    const promos = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return promos.map(doc => this.toPublic(doc));
  }

  static async findByCreator(creatorId: string): Promise<PromoCode[]> {
    const collection = await getCollection<PromoCodeDoc>(this.collectionName);

    const filter: Filter<PromoCodeDoc> = {
      createdBy: creatorId
    } as Filter<PromoCodeDoc>;

    const promos = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return promos.map(doc => this.toPublic(doc));
  }

  // Alias for compatibility
  static async findByOrganizer(organizerId: string): Promise<PromoCode[]> {
    return this.findByCreator(organizerId);
  }

  // Find admin promo codes only
  static async findByAdmin(): Promise<PromoCode[]> {
    const allPromos = await this.findAll();
    // We need to track createdByRole - let's return all for now
    // In real implementation, add createdByRole field
    return allPromos;
  }

  static async update(id: string, updates: Partial<Omit<PromoCode, '_id' | 'createdAt' | 'createdBy'>>): Promise<boolean> {
    const collection = await getCollection<PromoCodeDoc>(this.collectionName);

    const updateDoc: Record<string, unknown> = { ...updates };
    delete updateDoc._id; // ลบ _id ออกเพราะไม่ควร update _id

    if (updateDoc.code && typeof updateDoc.code === 'string') {
      updateDoc.code = updateDoc.code.toUpperCase();
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );
    return result.modifiedCount > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const collection = await getCollection<PromoCodeDoc>(this.collectionName);
    const filter: Filter<PromoCodeDoc> = {
      _id: new ObjectId(id)
    } as Filter<PromoCodeDoc>;

    const result = await collection.deleteOne(filter);
    return result.deletedCount > 0;
  }

  static async findByCamp(campId: string): Promise<PromoCode[]> {
    const collection = await getCollection<PromoCodeDoc>(this.collectionName);

    // หาโค้ดที่ใช้ได้กับค่ายนี้ (applicableCamps มี campId หรือ applicableCamps เป็น null/empty = ใช้ได้ทั้งหมด)
    const filter: Filter<PromoCodeDoc> = {
      $or: [
        { applicableCamps: { $in: [campId] } },
        { applicableCamps: { $exists: false } },
        { applicableCamps: { $size: 0 } }
      ]
    } as Filter<PromoCodeDoc>;

    const promos = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return promos.map(doc => this.toPublic(doc));
  }
}
