// src/lib/db/models/PromoCode.ts
import { getCollection } from '@/lib/mongodb';
import { ObjectId, Filter } from 'mongodb';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed'
}

export interface PromoCode {
  _id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number; // percentage (0-100) or fixed amount
  minAmount?: number;
  maxDiscount?: number; // max discount for percentage type
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableCamps?: string[]; // specific camp IDs, empty = all camps
  createdBy: string;
  createdAt: Date;
}

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

  static async create(promoData: Omit<PromoCode, '_id' | 'usedCount' | 'createdAt'>): Promise<PromoCode> {
    const collection = await getCollection<PromoCodeDoc>(this.collectionName);
    
    const promoDoc: Omit<PromoCodeDoc, '_id'> = {
      ...promoData,
      code: promoData.code.toUpperCase(),
      usedCount: 0,
      createdAt: new Date(),
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

    // Check if active
    if (!promo.isActive) {
      return { valid: false, discount: 0, message: 'รหัสโปรโมชั่นนี้ถูกปิดใช้งานแล้ว' };
    }

    // Check date validity
    if (now < promo.validFrom || now > promo.validUntil) {
      return { valid: false, discount: 0, message: 'รหัสโปรโมชั่นหมดอายุแล้ว' };
    }

    // Check usage limit
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return { valid: false, discount: 0, message: 'รหัสโปรโมชั่นถูกใช้งานครบแล้ว' };
    }

    // Check minimum amount
    if (promo.minAmount && amount < promo.minAmount) {
      return { 
        valid: false, 
        discount: 0, 
        message: `ยอดขั้นต่ำ ฿${promo.minAmount}` 
      };
    }

    // Check camp applicability
    if (campId && promo.applicableCamps && promo.applicableCamps.length > 0) {
      if (!promo.applicableCamps.includes(campId)) {
        return { valid: false, discount: 0, message: 'รหัสนี้ใช้ไม่ได้กับค่ายนี้' };
      }
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === DiscountType.PERCENTAGE) {
      discount = (amount * promo.discountValue) / 100;
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.discountValue;
    }

    // Ensure discount doesn't exceed amount
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
}
