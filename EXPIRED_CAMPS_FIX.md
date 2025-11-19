# 🔧 แก้ไข: กรองค่ายที่หมดเขตออกจากหน้าหลักและหน้าค่ายทั้งหมด

## ✅ สิ่งที่แก้ไข

### 1. ✅ หน้าหลัก (HomePage) - `src/app/(tab)/page.tsx`
**ปัญหา:** ค่ายที่หมดเขตรับสมัครแล้วยังแสดงในหน้าหลัก

**การแก้ไข:**
- เพิ่มฟังก์ชัน `isCampExpired()` เพื่อเช็คว่าค่ายหมดเขตหรือยัง
- กรองค่ายที่หมดเขตออกก่อนแสดงใน:
  - ✅ **Urgent Camps** (ใกล้ปิดรับสมัคร)
  - ✅ **Trending Camps** (ยอดนิยม)

**โค้ดที่เพิ่ม:**
```typescript
// Helper function to check if camp is expired
function isCampExpired(camp: Camp): boolean {
  if (!camp.registrationDeadline && !camp.deadline) {
    return false;
  }

  try {
    const deadlineDate = camp.registrationDeadline 
      ? new Date(camp.registrationDeadline) 
      : new Date(camp.deadline);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    
    return deadlineDate < today;
  } catch {
    return false;
  }
}
```

**การกรอง:**
```typescript
const availableCamps = camps.filter(camp => {
  // เช็คว่าเต็มหรือยัง
  const capacity = camp.capacity || camp.participantCount || 0;
  const enrolled = camp.enrolled || 0;
  if (enrolled >= capacity) {
    return false;
  }

  // 🔧 เช็คว่าหมดเขตรับสมัครหรือยัง
  if (isCampExpired(camp)) {
    return false;
  }

  return true;
});
```

---

### 2. ✅ หน้าค่ายทั้งหมด (All Camps) - `src/app/(tab)/allcamps/AllCampsContent.tsx`
**ปัญหา:** ค่ายที่หมดเขตรับสมัครแล้วยังแสดงในหน้าค่ายทั้งหมด

**การแก้ไข:**
- เพิ่มฟังก์ชัน `isCampExpired()` เพื่อเช็คว่าค่ายหมดเขตหรือยัง
- กรองค่ายที่หมดเขตออกก่อนแสดงในทุกส่วน:
  - ✅ **Urgent Camps**
  - ✅ **Trending Camps**
  - ✅ **All Camps**

**โค้ดเดียวกับหน้าหลัก**

---

## 🎯 การทำงาน

### เงื่อนไขการกรอง:

1. **เช็ควันหมดเขต:**
   ```typescript
   if (camp.registrationDeadline) {
     deadline = new Date(camp.registrationDeadline);
   } else if (camp.deadline) {
     deadline = new Date(camp.deadline);
   }
   ```

2. **เปรียบเทียบกับวันปัจจุบัน:**
   ```typescript
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   deadline.setHours(0, 0, 0, 0);
   
   if (deadline < today) {
     // หมดเขตแล้ว - ไม่แสดง
   }
   ```

3. **ค่ายที่แสดง:**
   - ✅ วันปิดรับสมัคร >= วันนี้
   - ✅ ยังไม่เต็ม (enrolled < capacity)
   - ✅ status = 'active'

---

## ✅ ผลลัพธ์

### หน้าหลัก (/)
- ✅ ค่าย "ใกล้ปิดรับสมัคร" จะแสดงเฉพาะค่ายที่ยังไม่หมดเขต
- ✅ ค่าย "ยอดนิยม" จะแสดงเฉพาะค่ายที่ยังไม่หมดเขต

### หน้าค่ายทั้งหมด (/allcamps)
- ✅ จะไม่แสดงค่ายที่หมดเขตรับสมัครแล้ว
- ✅ Filter, Sort, Tags ทั้งหมดจะทำงานกับเฉพาะค่ายที่ยังเปิดรับสมัคร

### API (/api/camps)
- ✅ Backend API ก็กรองค่ายหมดเขตอยู่แล้ว (จาก Bug Fix ที่แล้ว)
- ✅ Frontend ก็เพิ่มการกรองอีกชั้นเพื่อความแน่ใจ

---

## 🔧 Edge Cases ที่จัดการแล้ว

### 1. ค่ายไม่มีวันปิดรับสมัคร
```typescript
if (!camp.registrationDeadline && !camp.deadline) {
  return false; // ไม่หมดเขต
}
```

### 2. วันที่ไม่ถูกต้อง
```typescript
try {
  const deadline = new Date(camp.registrationDeadline);
  // ...
} catch {
  return false; // ถ้า parse ไม่ได้ ให้ถือว่าไม่หมดเขต
}
```

### 3. ค่ายที่ปิดรับสมัครพอดีวันนี้
```typescript
today.setHours(0, 0, 0, 0);
deadline.setHours(0, 0, 0, 0);

// ถ้าปิดวันนี้ (deadline = today) ยังแสดงอยู่
// ถ้าปิดเมื่อวาน (deadline < today) จะไม่แสดง
```

---

## 📋 การทดสอบ

### Test Case 1: ค่ายที่หมดเขตแล้ว
```
registrationDeadline: 2024-11-15 (เมื่อวาน)
ผลลัพธ์: ❌ ไม่แสดงในหน้าหลักและหน้าค่ายทั้งหมด
```

### Test Case 2: ค่ายที่ปิดรับสมัครวันนี้
```
registrationDeadline: 2024-11-19 (วันนี้)
ผลลัพธ์: ✅ ยังแสดงอยู่ (ปิดคืนนี้)
```

### Test Case 3: ค่ายที่ยังเปิดรับสมัคร
```
registrationDeadline: 2024-11-25 (อีก 6 วัน)
ผลลัพธ์: ✅ แสดงปกติ
```

### Test Case 4: ค่ายที่เต็มแล้ว
```
capacity: 50
enrolled: 50
ผลลัพธ์: ❌ ไม่แสดง (แม้จะยังไม่หมดเขต)
```

### Test Case 5: ค่ายไม่มีวันปิดรับสมัคร
```
registrationDeadline: null
deadline: null
ผลลัพธ์: ✅ แสดงปกติ
```

---

## 🎯 สรุป

**ไฟล์ที่แก้ไข:**
1. ✅ `src/app/(tab)/page.tsx` - หน้าหลัก
2. ✅ `src/app/(tab)/allcamps/AllCampsContent.tsx` - หน้าค่ายทั้งหมด

**การทำงาน:**
- ✅ กรองค่ายที่หมดเขตออกทั้งหมด
- ✅ กรองค่ายที่เต็มออกทั้งหมด
- ✅ แสดงเฉพาะค่ายที่ยังเปิดรับสมัครอยู่

**ทดสอบได้ที่:**
```
หน้าหลัก: http://localhost:3000
หน้าค่ายทั้งหมด: http://localhost:3000/allcamps
```

---

## 🐛 Debug Tips

ถ้าค่ายที่หมดเขตยังแสดงอยู่:

1. **เช็คว่า API กรองแล้วหรือยัง:**
   ```bash
   curl http://localhost:3000/api/camps
   ```

2. **เช็ค registrationDeadline:**
   - ต้องเป็น Date object ที่ valid
   - Format: `2024-11-19T00:00:00.000Z`

3. **เช็ค Browser Console:**
   ```javascript
   console.log('Today:', new Date().toISOString());
   console.log('Deadline:', camp.registrationDeadline);
   ```

4. **Clear Cache:**
   ```bash
   # ลบ .next folder
   rm -rf .next
   npm run dev
   ```

---

**เรียบร้อยครับ! ค่ายที่หมดเขตแล้วจะไม่แสดงอีกต่อไป** ✅
