# 👨‍💼 ตั้งค่า Admin

## วิธีที่ 1: ใช้ API Endpoint (แนะนำ) ⭐

### 1. เปิด Postman หรือใช้ curl:

```bash
curl -X POST http://localhost:3000/api/admin/set-role \
  -H "Content-Type: application/json" \
  -d '{
    "email": "folkmtj.one@gmail.com",
    "role": "admin",
    "secretKey": "skillscout-admin-2024"
  }'
```

### 2. หรือใช้ Browser Console:

เปิด Console (F12) แล้วรันคำสั่ง:

```javascript
fetch('/api/admin/set-role', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'folkmtj.one@gmail.com',
    role: 'admin',
    secretKey: 'skillscout-admin-2024'
  })
})
.then(r => r.json())
.then(console.log);
```

### 3. Response:

```json
{
  "success": true,
  "message": "Role updated successfully",
  "userId": "xxx",
  "previousRole": "user",
  "newRole": "admin"
}
```

---

## วิธีที่ 2: ใช้ MongoDB Compass

1. เปิด MongoDB Compass
2. เชื่อมต่อ Database
3. ไปที่ Collection `users`
4. หา document ที่มี email: `folkmtj.one@gmail.com`
5. แก้ไข field `role` เป็น `"admin"`
6. Save

---

## วิธีที่ 3: ใช้ Script

```bash
# Install ts-node (ถ้ายังไม่มี)
npm install -D ts-node

# Run script
npx ts-node scripts/setAdmin.ts
```

---

## 🔐 Security Note

API endpoint `/api/admin/set-role` ใช้ secret key แบบง่าย:
- **Secret Key**: `skillscout-admin-2024`
- ⚠️ **สำหรับ Development เท่านั้น**
- ⚠️ **ไม่ควรใช้ใน Production**
- 💡 **Production ควรใช้**: Auth middleware + Super Admin verification

---

## ✅ ตรวจสอบว่าเป็น Admin แล้ว

### 1. เช็คใน Database:
```javascript
db.users.findOne({ email: "folkmtj.one@gmail.com" })
```

### 2. เช็คผ่าน NextAuth Session:
- Login ด้วย email `folkmtj.one@gmail.com`
- เปิด Console รัน:
```javascript
await fetch('/api/auth/session').then(r => r.json())
```
- ควรเห็น `role: "admin"`

---

## 📋 User Roles

```typescript
enum UserRole {
  USER = 'user',       // ผู้ใช้ทั่วไป
  ORGANIZER = 'organizer',  // ผู้จัดค่าย
  ADMIN = 'admin'      // ผู้ดูแลระบบ
}
```

---

## 🎯 Admin Permissions

Admin สามารถ:
- ✅ อนุมัติ/ปฏิเสธค่าย
- ✅ ดูค่ายทั้งหมด (รวมที่ pending)
- ✅ จัดการ users
- ✅ ดู statistics ทั้งหมด
- ✅ อนุมัติ/ปฏิเสธการสมัครเข้าค่าย

---

## 🚀 Quick Setup

```bash
# 1. Start server
npm run dev

# 2. Open browser console on http://localhost:3000

# 3. Run this:
fetch('/api/admin/set-role', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'folkmtj.one@gmail.com',
    role: 'admin',
    secretKey: 'skillscout-admin-2024'
  })
}).then(r => r.json()).then(console.log);

# 4. Done! ✅
```
