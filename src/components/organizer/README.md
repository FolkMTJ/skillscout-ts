# Organizer Components

โฟลเดอร์นี้เก็บ components ที่เกี่ยวข้องกับหน้า Organizer Dashboard

## Components

### CampForm.tsx
ฟอร์มสำหรับสร้างและแก้ไขค่าย มีฟีเจอร์ครบถ้วน:

#### ฟีเจอร์หลัก:
- ✅ ข้อมูลพื้นฐาน (ชื่อ, รายละเอียด, สถานที่, รูปแบบกิจกรรม)
- ✅ วันเวลาและจำนวนผู้เข้าร่วม
- ✅ อัปโหลดรูปภาพหน้าปก
- ✅ อัปโหลดรูปภาพเพิ่มเติม (Gallery)
- ✅ เลือก Tag ค่าย (มี Popular Tags และเพิ่มเองได้)
- ✅ คุณสมบัติผู้สมัคร (ระดับการศึกษา, รายละเอียด)
- ✅ เพิ่มผู้จัดค่าย (หลายคน)
- ✅ ข้อมูลเพิ่มเติม
- ✅ Checkbox: มีประกาศนียบัตร, สายอาชีวะสมัครได้

#### Props:
```typescript
interface CampFormProps {
  formData: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    location: string;
    capacity: string;
    fee: string;
    tags: string[];
    image: string;
    galleryImages: string[];
    activityFormat: string;
    qualificationLevel: string;
    qualificationDetails: string;
    additionalInfo: string[];
    organizers: Array<{ name: string; imageUrl: string }>;
    hasCertificate: boolean;
    allowVocational: boolean;
  };
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing?: boolean;
}
```

#### การใช้งาน:
```tsx
import CampForm from '@/components/organizer/CampForm';

<CampForm
  formData={formData}
  onFormDataChange={setFormData}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isEditing={false}
/>
```

## โครงสร้างข้อมูล

### Activity Formats
- `On-site` - ที่สถานที่จริง
- `Online` - ออนไลน์
- `Hybrid` - ผสมผสาน

### Education Levels
- `ม.3 - ม.6`
- `นักศึกษา`
- `บุคคลทั่วไป`
- `ทุกระดับ`

### Popular Tags
- Programming
- Web Development
- Mobile App
- Data Science
- AI/ML
- UI/UX Design
- Game Development
- Cybersecurity
- Cloud Computing
- IoT

## การจัดการข้อมูล

### Images
- **รูปหน้าปก**: ใส่ URL เดียว
- **รูปแกลเลอรี**: ใส่ได้หลาย URL

### Tags
- เลือกจาก Popular Tags
- เพิ่มเองได้
- แสดงเป็น Chips ลบได้

### Organizers
- เพิ่มได้หลายคน
- แต่ละคนมี: ชื่อ + รูปภาพ

### Additional Info
- เพิ่มข้อมูลเพิ่มเติมได้หลายรายการ
- แต่ละรายการลบได้

## Validation
- ฟิลด์ที่จำเป็น (required):
  - ชื่อค่าย
  - รายละเอียด
  - สถานที่
  - วันเริ่มต้น
  - วันสิ้นสุด
  - ปิดรับสมัคร
  - จำนวนที่รับ

## UI/UX Features
- แบ่งเป็น Sections ชัดเจน
- มี Icons ประกอบทุก Section
- Toast notifications สำหรับ actions
- Hover effects
- Responsive design
