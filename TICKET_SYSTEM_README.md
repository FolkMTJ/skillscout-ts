# 🎫 ระบบ Ticket QR Code - คู่มือการใช้งาน

## 🎯 ระบบทำงานยังไง?

### **User Side:**
1. ✅ สมัครค่าย → ชำระเงิน → ได้รับการอนุมัติ
2. 🎫 กดปุ่ม "รับ Ticket" → เห็น QR Code
3. 💾 บันทึกหน้าจอ หรือ ดาวน์โหลด Ticket
4. 📱 นำไปแสดงหน้างาน

### **Organizer Side:**
1. 📸 เปิดกล้องมือถือ (ไม่ต้องติดตั้งแอพ!)
2. 🔍 สแกน QR Code จาก Ticket ของ User
3. ✅ หน้าเว็บเปิดขึ้นมา → แสดงข้อมูลผู้เข้าร่วม
4. 🎉 ระบบบันทึกการเช็คอินอัตโนมัติ!

## 📋 ขั้นตอนการตั้งค่า

### **1. เพิ่ม Environment Variable**

เพิ่มใน `.env.local`:
```env
# Base URL สำหรับ QR Code
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# หรือ ถ้า deploy แล้ว
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Cloudinary (สำหรับอัปโหลดสลิป)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=skillscout

# SlipOK API (ถ้าใช้ auto-verify)
SLIPOK_API_KEY=your_slipok_api_key
```

### **2. Restart Server**
```bash
npm run dev
```

## 🎨 QR Code Format

QR Code จะเก็บ URL:
```
https://your-domain.com/verify?id=REGISTRATION_ID
```

เมื่อ Organizer สแกน:
1. เปิดหน้า `/verify?id=xxx`
2. หน้านี้เรียก API `/api/ticket/verify?id=xxx`
3. API บันทึก status เป็น `attended`
4. แสดงหน้ายืนยันสำเร็จ ✓

## 📊 Registration Status Flow

```
pending (รอการอนุมัติ)
    ↓
approved (อนุมัติแล้ว) → สามารถรับ Ticket
    ↓
attended (เช็คอินแล้ว) → สแกน QR สำเร็จ
```

## 🎫 หน้า Ticket

**ที่อยู่:** `/components/ticket/TicketModal.tsx`

**ฟีเจอร์:**
- แสดง QR Code ขนาดใหญ่
- ข้อมูลผู้เข้าร่วม
- ชื่อค่าย, วันที่, สถานที่
- สถานะ (approved/pending)
- ปุ่มดาวน์โหลด
- คำแนะนำการใช้งาน

## ✅ หน้า Verify

**ที่อยู่:** `/app/verify/page.tsx`

**3 สถานะ:**

### 1. ✓ เช็คอินสำเร็จ (Success)
- พื้นหลังสีเขียว
- แสดงข้อมูลผู้เข้าร่วม
- เวลาเช็คอิน
- ข้อความต้อนรับ

### 2. ⚠️ เช็คอินแล้ว (Already Checked)
- พื้นหลังสีเหลือง
- แสดงเวลาที่เช็คอินไปแล้ว
- ป้องกันการเช็คอินซ้ำ

### 3. ❌ ไม่สามารถเช็คอินได้ (Error)
- พื้นหลังสีแดง
- แสดงเหตุผล (ยังไม่อนุมัติ, ไม่พบข้อมูล)
- ให้ติดต่อเจ้าหน้าที่

## 🔧 API Endpoints

### **GET /api/ticket?userId=xxx&campId=xxx**
รับ Ticket พร้อม QR Code

**Response:**
```json
{
  "registered": true,
  "ticket": {
    "registrationId": "xxx",
    "userName": "John Doe",
    "campName": "AI Camp 2024",
    "qrCode": "data:image/png;base64,...",
    "verifyUrl": "http://localhost:3000/verify?id=xxx",
    "status": "approved"
  }
}
```

### **GET /api/ticket/verify?id=xxx**
ยืนยันการเข้าร่วม (เช็คอิน)

**Response Success:**
```json
{
  "success": true,
  "message": "เช็คอินสำเร็จ!",
  "registration": {
    "userName": "John Doe",
    "campName": "AI Camp 2024",
    "status": "attended",
    "checkedInAt": "2024-10-15T10:30:00Z"
  }
}
```

## 🎯 ข้อดีของระบบนี้

### **สำหรับ User:**
- 📱 ไม่ต้องพิมพ์กระดาษ
- 💾 บันทึกใน Gallery
- ✅ เช็คสถานะได้ตลอด
- 🔒 QR Code ปลอดภัย

### **สำหรับ Organizer:**
- 📸 ไม่ต้องติดตั้งแอพพิเศษ
- ⚡ สแกนเร็ว ใช้กล้องมือถือธรรมดา
- 📊 บันทึกอัตโนมัติ
- ✓ ป้องกันการเช็คอินซ้ำ
- 📈 ดูรายงานแบบ real-time

### **สำหรับระบบ:**
- 🔐 ปลอดภัย (ใช้ Registration ID)
- 📊 Track ได้ว่าใครเข้าร่วมจริง
- 💰 ปลดล็อกเงิน Escrow หลังเช็คอิน
- 🎯 ไม่มี QR ปลอม

## 🚀 วิธีใช้งาน

### **สำหรับ User:**
```
1. สมัครค่าย → ชำระเงิน
2. รอ Admin อนุมัติ
3. ปุ่ม "สมัครเข้าร่วม" → เปลี่ยนเป็น "รับ Ticket"
4. กด "รับ Ticket" → เห็น QR Code
5. บันทึกหรือ Screenshot
6. นำไปแสดงหน้างาน
```

### **สำหรับ Organizer:**
```
1. เปิดกล้องมือถือ (ธรรมดา)
2. สแกน QR Code จาก User
3. เว็บเปิดขึ้นมาอัตโนมัติ
4. เห็นหน้ายืนยัน → เช็คอินสำเร็จ! ✓
```

## 🔍 Troubleshooting

### **QR Code ไม่แสดง:**
- เช็ค `NEXT_PUBLIC_BASE_URL` ใน `.env.local`
- Restart server: `npm run dev`

### **สแกนแล้วไม่เข้าหน้า verify:**
- เช็ค URL ที่ generate (`verifyUrl` ใน API response)
- ต้องเป็น full URL: `https://domain.com/verify?id=xxx`

### **เช็คอินไม่สำเร็จ:**
- เช็คสถานะใน Database (ต้องเป็น `approved` หรือ `pending`)
- ดู console log: `=== TICKET VERIFICATION ===`

### **ปุ่ม "รับ Ticket" ไม่แสดง:**
- User ต้องสมัครค่ายก่อน
- ต้อง login ด้วย email ที่สมัคร

## 📁 ไฟล์ที่สร้าง

```
src/
├── app/
│   ├── api/
│   │   └── ticket/
│   │       ├── route.ts (GET ticket + QR)
│   │       └── verify/
│   │           └── route.ts (GET verify check-in)
│   └── verify/
│       └── page.tsx (หน้า verify สำหรับ organizer)
├── components/
│   ├── ticket/
│   │   └── TicketModal.tsx (Modal แสดง ticket)
│   └── camps/
│       └── BookingModal.tsx (อัปเดตแล้ว)
└── (tab)/
    └── camps/
        └── [id]/
            └── CampDetailView.tsx (อัปเดตแล้ว)
```

## ✨ สรุป Flow ทั้งหมด

### **1. User สมัครค่าย**
```
User → Fill Form → Pay → Upload Slip → Pending
```

### **2. Admin อนุมัติ**
```
Admin → Check Slip → Approve → Status: approved
```

### **3. User รับ Ticket**
```
User → Camp Detail → "รับ Ticket" → QR Code
```

### **4. Organizer สแกน QR**
```
Organizer → Scan QR → Open /verify?id=xxx → Check-in Success
```

### **5. ปลดล็อกเงิน**
```
After 15 days OR User attended → Release money to Organizer
```

## 🎉 เสร็จสมบูรณ์!

ระบบ Ticket QR Code พร้อมใช้งาน:
- ✅ User สามารถรับ Ticket
- ✅ QR Code เป็น URL verify
- ✅ Organizer สแกนด้วยกล้องธรรมดา
- ✅ บันทึกการเช็คอินอัตโนมัติ
- ✅ ป้องกันเช็คอินซ้ำ
- ✅ แสดงหน้ายืนยันสวยงาม
- ✅ ไม่ต้องติดตั้งแอพพิเศษ
