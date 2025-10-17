// src/lib/validation/schemas.ts
// Input validation schemas using Zod

import { z } from 'zod';

// Camp Validation
export const createCampSchema = z.object({
  name: z.string().min(3, 'ชื่อค่ายต้องมีอย่างน้อย 3 ตัวอักษร').max(100),
  description: z.string().min(10, 'คำอธิบายต้องมีอย่างน้อย 10 ตัวอักษร'),
  location: z.string().min(3, 'สถานที่ต้องมีอย่างน้อย 3 ตัวอักษร'),
  price: z.string().optional(),
  fee: z.number().min(0).optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  registrationDeadline: z.string().optional(),
  capacity: z.number().int().min(1).optional(),
});

// Registration Validation
export const createRegistrationSchema = z.object({
  campId: z.string().min(1, 'Camp ID is required'),
  userName: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  userEmail: z.string().email('อีเมลไม่ถูกต้อง'),
  userPhone: z.string().regex(/^[0-9]{10}$/, 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก').optional(),
});

// Payment Validation
export const createPaymentSchema = z.object({
  registrationId: z.string().min(1),
  campId: z.string().min(1),
  amount: z.number().min(0),
  finalAmount: z.number().min(0),
});

// PromoCode Validation
export const validatePromoSchema = z.object({
  code: z.string().min(1, 'รหัสโปรโมชั่นต้องไม่ว่าง'),
  amount: z.number().min(0),
  campId: z.string().optional(),
});

// Email Validation
export const emailSchema = z.string().email('อีเมลไม่ถูกต้อง');

// Generic ID Validation
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');
