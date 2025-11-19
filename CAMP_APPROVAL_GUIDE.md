# ระบบ Camp Approval - คู่มือการใช้งาน

## 📋 ภาพรวม

ระบบ Camp Approval ช่วยให้ Admin สามารถตรวจสอบและอนุมัติค่ายก่อนที่จะแสดงบนหน้าหลักได้

## 🔄 Flow การทำงาน

```
1. Organizer สร้างค่าย → Status: "pending"
2. Admin ตรวจสอบค่าย → อนุมัติ/ปฏิเสธ
3. ถ้าอนุมัติ → Status: "active" (แสดงบนหน้าหลัก)
4. ถ้าปฏิเสธ → Status: "rejected" (Organizer แก้ไขและส่งใหม่ได้)
```

## 📍 ตำแหน่งที่เกี่ยวข้อง

### 1. **Organizer Dashboard** (`/organizer`)
- แสดงค่ายทั้งหมดที่สร้าง
- Card "ค่ายรอตรวจสอบ" - แสดงค่ายที่ `status = pending`
- Card "ค่ายที่ถูกปฏิเสธ" - แสดงค่ายที่ `status = rejected` (พร้อมปุ่มแก้ไข)
- StatCard "ค่ายรอตรวจสอบ" - นับจำนวนค่าย pending

### 2. **Admin Dashboard** (`/admin`)
- Tab "ค่าย" → แสดงค่ายทั้งหมด
- ค่ายที่ `status = pending` จะมีปุ่ม "อนุมัติ" และ "ปฏิเสธ"
- StatCard "ค่ายรออนุมัติ" - นับจำนวนค่าย pending

### 3. **API Endpoints**
- `POST /api/camps/[id]/approve` - อนุมัติค่าย
  ```json
  {
    "adminId": "admin-id",
    "action": "approve"
  }
  ```
- `POST /api/camps/[id]/approve` - ปฏิเสธค่าย
  ```json
  {
    "adminId": "admin-id",
    "action": "reject",
    "reason": "เหตุผลในการปฏิเสธ"
  }
  ```

## 🔧 การตั้งค่าเริ่มต้น

### สำหรับค่ายเก่าที่ไม่มี status

ถ้ามีค่ายเก่าที่ไม่มี `status` อยู่แล้ว ให้รันคำสั่งนี้เพื่อ update ให้เป็น `active`:

```bash
npm run update-camp-status
```

สคริปต์จะ:
1. หาค่ายที่ไม่มี status
2. Update ให้เป็น `active` ทั้งหมด
3. ค่ายเหล่านี้จะแสดงบนหน้าหลักทันที

## 📊 Status Types

| Status | คำอธิบาย | แสดงบนหน้าหลัก |
|--------|---------|----------------|
| `pending` | รอ Admin ตรวจสอบ | ❌ |
| `active` | อนุมัติแล้ว เปิดรับสมัคร | ✅ |
| `rejected` | ถูกปฏิเสธ | ❌ |
| `completed` | จบค่ายแล้ว | ❌ |
| `cancelled` | ยกเลิก | ❌ |

## 🎯 การทำงานของระบบ

### เมื่อ Organizer สร้างค่าย
1. Frontend ส่ง `status: 'pending'` ไปใน request
2. API รับและบันทึกค่ายด้วย status นี้
3. ค่ายจะปรากฏใน "ค่ายรอตรวจสอบ" ของ Organizer
4. ค่ายจะปรากฏใน Admin Dashboard พร้อมปุ่มอนุมัติ/ปฏิเสธ

### เมื่อ Admin อนุมัติค่าย
1. เปลี่ยน `status` เป็น `active`
2. ค่ายจะแสดงบนหน้าหลักทันที
3. Users สามารถสมัครเข้าค่ายได้

### เมื่อ Admin ปฏิเสธค่าย
1. เปลี่ยน `status` เป็น `rejected`
2. ค่ายจะปรากฏใน "ค่ายที่ถูกปฏิเสธ" ของ Organizer
3. Organizer สามารถแก้ไขและส่งใหม่ได้
4. เมื่อแก้ไขเสร็จ status จะกลับเป็น `pending` อัตโนมัติ

## 🔍 การ Debug

### ตรวจสอบ status ของค่าย
เปิด Console ในหน้า Organizer Dashboard จะเห็น log:
```
=== ORGANIZER DASHBOARD ===
Total camps loaded: 5
Camps with status: [
  { name: "ค่ายที่ 1", status: "pending" },
  { name: "ค่ายที่ 2", status: "active" },
  { name: "ค่ายที่ 3", status: "NO STATUS" }
]
==========================
```

### ปัญหาที่อาจเจอ

#### ค่ายไม่ขึ้นใน "ค่ายรอตรวจสอบ"
- ตรวจสอบว่า `status` เป็น `"pending"` หรือไม่
- ตรวจสอบว่า `organizerId` ตรงกับ user ที่ login หรือไม่

#### ค่ายไม่แสดงบนหน้าหลัก
- ตรวจสอบว่า `status` เป็น `"active"` หรือไม่
- ตรวจสอบว่าค่ายไม่หมดเขตสมัครหรือเต็มแล้ว

#### Admin ไม่เห็นปุ่มอนุมัติ
- ตรวจสอบว่า user มี role เป็น `"admin"` หรือไม่
- ตรวจสอบว่าค่ายมี `status = "pending"` หรือไม่

## 📝 Code Locations

| ไฟล์ | ที่อยู่ | คำอธิบาย |
|------|--------|----------|
| Organizer Dashboard | `src/app/(tab)/organizer/page.tsx` | หน้าจัดการค่ายของ organizer |
| Admin Dashboard | `src/app/(tab)/admin/page.tsx` | หน้าจัดการระบบของ admin |
| API Approve | `src/app/api/camps/[id]/approve/route.ts` | API สำหรับอนุมัติ/ปฏิเสธ |
| Camp Model | `src/lib/db/models/Camp.ts` | Model ของ Camp + default status |
| Update Script | `scripts/update-camp-status.ts` | Script update ค่ายเก่า |

## 🎨 UI Components

### Organizer Dashboard
- **StatCard**: แสดงจำนวนค่ายรอตรวจสอบ (สีส้ม)
- **ค่ายรอตรวจสอบ Card**: รายการค่าย pending พร้อม Chip สีส้ม
- **ค่ายที่ถูกปฏิเสธ Card**: รายการค่าย rejected พร้อมปุ่มแก้ไข (สีแดง)

### Admin Dashboard
- **StatCard**: แสดงจำนวนค่ายรออนุมัติ (สีส้ม)
- **Table**: แสดงค่ายทั้งหมดพร้อม status
- **Approve Modal**: ยืนยันการอนุมัติ
- **Reject Modal**: ปฏิเสธพร้อมระบุเหตุผล

## 🚀 การ Deploy

ก่อน deploy ควรทำ:
1. ตรวจสอบว่าค่ายทั้งหมดมี status แล้ว
2. รัน `npm run update-camp-status` ถ้าจำเป็น
3. Test ระบบ approval บน staging ก่อน
4. ตรวจสอบว่า Admin account มี role = "admin" ถูกต้อง
