# 💳 ระบบชำระเงินแบบครบวงจร - SkillScout

## 🎯 ฟีเจอร์ทั้งหมด

### ✅ **ระบบการชำระเงิน**
1. **QR Code PromptPay** - สร้างอัตโนมัติตามยอดชำระ
2. **อัปโหลดสลิป** - ตรวจสอบการโอนเงิน
3. **Escrow System** - เก็บเงินไว้ 15 วัน
4. **โปรโมชั่นโค้ด** - ลดราคาแบบ % หรือ fixed
5. **Auto-fill ข้อมูล** - ดึงจาก User Session

## 📋 ขั้นตอนการทำงาน

### **Step 1: กรอกข้อมูล**
- ดึงข้อมูล User อัตโนมัติ (ถ้า login)
- กรอกข้อมูลเพิ่มเติม
- ใช้โปรโมชั่นโค้ด (ถ้ามี)
- แสดงสรุปราคา

### **Step 2: แสดง QR Code**
- สร้าง QR PromptPay อัตโนมัติ
- แสดงยอดชำระ
- วิธีการสแกนและโอนเงิน

### **Step 3: อัปโหลดสลิป**
- อัปโหลดหลักฐานการโอน
- อัปโหลดไป Cloudinary
- บันทึก URL ลง Database
- แสดง Progress Bar

### **Step 4: Success**
- แจ้งเตือนสำเร็จ
- อธิบายระบบ Escrow
- Auto close หลัง 3 วินาที

## 🔒 **Escrow System (ระบบเก็บเงินค้างจ่าย)**

### การทำงาน:
1. **User ชำระเงิน** → สถานะ: `PENDING`
2. **อัปโหลดสลิป** → สถานะ: `COMPLETED`
3. **Admin ตรวจสอบ** → (ยืนยัน/ปฏิเสธ)
4. **User ยืนยันเข้าร่วม** → สถานะ: `CONFIRMED`
5. **โอนเงินให้ Organizer** → สถานะ: `RELEASED`

### เงื่อนไขการโอนเงิน:
- ✅ User กดยืนยันเข้าร่วมค่ายสำเร็จ
- ✅ หรือผ่าน 15 วันนับจากวันจบค่าย (อัตโนมัติ)

## 🛠️ **ติดตั้ง Dependencies**

```bash
# Install required packages
npm install promptpay-qr qrcode
npm install --save-dev @types/qrcode

# Restart server
npm run dev
```

## 📁 **ไฟล์ที่สร้าง**

### **Models**
- `src/lib/db/models/Payment.ts` - จัดการข้อมูลการชำระเงิน
- `src/lib/db/models/PromoCode.ts` - จัดการโปรโมชั่นโค้ด

### **API Endpoints**
- `POST /api/payment` - สร้างบันทึกการชำระเงิน
- `GET /api/payment?registrationId=xxx` - ดึงข้อมูลการชำระ
- `PATCH /api/payment/[id]` - อัปเดตสถานะ/สลิป
- `POST /api/payment/generate-qr` - สร้าง QR Code
- `POST /api/payment/validate-promo` - ตรวจสอบโปรโมชั่น

### **Components**
- `src/components/camps/BookingModal.tsx` - Modal ชำระเงิน 4 steps

## 🎨 **UI/UX Features**

- ✨ Gradient backgrounds
- 📊 Progress bar สำหรับอัปโหลด
- 🎯 Step indicator
- 💫 Smooth animations
- 📱 Responsive design
- 🌙 Dark mode support
- ✅ Success animations

## 🔐 **ความปลอดภัย**

1. **Validate ทุก input**
2. **ตรวจสอบไฟล์** (type, size)
3. **Escrow protection** (เก็บเงินไว้ก่อน)
4. **Admin approval** (ตรวจสอบสลิป)
5. **Auto-release** (หลัง 15 วัน)

## 📝 **Payment Status Flow**

```
PENDING (รอชำระ)
    ↓
COMPLETED (อัปโหลดสลิปแล้ว)
    ↓
CONFIRMED (User ยืนยันเข้าร่วม)
    ↓
RELEASED (โอนเงินให้ Organizer แล้ว)
```

## 🎫 **Promo Code Types**

### **Percentage Discount**
```json
{
  "code": "SAVE20",
  "discountType": "percentage",
  "discountValue": 20,
  "maxDiscount": 500
}
```

### **Fixed Discount**
```json
{
  "code": "FLAT100",
  "discountType": "fixed",
  "discountValue": 100
}
```

## 🚀 **การใช้งาน**

1. User เลือกค่ายและกด "สมัครเข้าร่วม"
2. กรอกข้อมูล → ใช้โปรโมชั่น (ถ้ามี)
3. กด "ยืนยันชำระเงิน" → แสดง QR Code
4. สแกน QR → โอนเงิน
5. กด "โอนเงินแล้ว" → อัปโหลดสลิป
6. รอ Admin ตรวจสอบ (24 ชม.)
7. ได้รับอีเมลยืนยัน
8. เข้าร่วมค่าย → กดยืนยัน
9. ระบบโอนเงินให้ Organizer

## ⚙️ **Environment Variables**

ต้องเพิ่มใน `.env.local`:

```env
# Cloudinary (สำหรับอัปโหลดสลิป)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=skillscout
```

## 🎉 **เสร็จสมบูรณ์!**

ระบบชำระเงินพร้อมใช้งาน:
- ✅ QR Code PromptPay
- ✅ อัปโหลดสลิป
- ✅ Escrow System
- ✅ โปรโมชั่นโค้ด
- ✅ Auto-fill User data
- ✅ 4-step checkout process
