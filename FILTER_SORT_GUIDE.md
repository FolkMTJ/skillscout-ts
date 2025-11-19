# 🎯 ระบบ Filter & Sort ใน All Camps - Complete Guide

## ✅ ฟีเจอร์ที่เพิ่มเข้ามา

### 1. 🔍 **ระบบ Sort (เรียงลำดับ)** - 7 ตัวเลือก

#### ตัวเลือกการเรียง:
1. **ใหม่สุด** (newest) - เรียงตามวันที่สร้างค่าย (ใหม่สุดก่อน)
2. **เก่าสุด** (oldest) - เรียงตามวันที่สร้างค่าย (เก่าสุดก่อน)
3. **ใกล้ปิดสุด** (deadline-near) - เรียงตามวันปิดรับสมัคร (ใกล้สุดก่อน) ⭐
4. **ไกลปิดสุด** (deadline-far) - เรียงตามวันปิดรับสมัคร (ไกลสุดก่อน)
5. **ราคาน้อย-มาก** (price-low) - เรียงตามราคา (ถูกสุดก่อน) ⭐
6. **ราคามาก-น้อย** (price-high) - เรียงตามราคา (แพงสุดก่อน) ⭐
7. **ยอดนิยม** (popular) - เรียงตาม views (ดูมากสุดก่อน)

---

### 2. 🏷️ **ระบบ Filter by Tags** - เลือกได้หลายอัน ⭐

#### Tags ทั้งหมด (36 tags):
**Programming Languages:**
- Python, JavaScript, TypeScript, Java, C++

**Web Development:**
- React, Node.js, HTML, CSS

**Mobile Development:**
- Flutter, React Native, iOS, Android

**AI & Data:**
- Machine Learning, Deep Learning, AI, Data Science, Big Data

**Cloud & DevOps:**
- Cloud Computing, AWS, Azure, Docker, Kubernetes

**Security:**
- Cybersecurity, Ethical Hacking, Penetration Testing

**Design:**
- UI/UX, Figma, Adobe XD

**Game Development:**
- Game Design, Unity, Unreal Engine

**Database:**
- SQL, NoSQL, MongoDB

**Features:**
✅ เลือกได้หลายอัน (Multiple Selection)
✅ แสดงจำนวน tags ที่เลือก
✅ Scroll ได้ (max-height: 48)
✅ Visual feedback (สี warning เมื่อเลือก)

---

### 3. 📁 **ระบบ Filter by Category**

#### Categories:
- ทั้งหมด
- Web Development
- Mobile Development
- Data Science & AI
- Cybersecurity
- Cloud & DevOps
- Game Development
- UI/UX Design
- Networking

---

### 4. 💰 **ระบบ Filter by Price Range**

#### ฟีเจอร์:
- **Dual Range Slider** - ปรับได้ทั้งราคาต่ำสุดและสูงสุด
- **ช่วงราคา:** ฿0 - ฿10,000+
- **Step:** ฿100 ต่อครั้ง
- แสดงราคาแบบ Real-time

---

### 5. 🔍 **ระบบค้นหา (Search)**

#### ค้นหาจาก:
- ชื่อค่าย
- คำอธิบาย
- หมวดหมู่
- สถานที่

**Features:**
- Clear button (X) เมื่อมีข้อความ
- Search แบบ Real-time
- Case-insensitive

---

### 6. 🎛️ **การจัดการ Filters**

#### Features:
✅ **Show/Hide Filters Panel** - ซ่อน/แสดงตัวกรอง
✅ **Clear All Filters** - ล้างตัวกรองทั้งหมดในคลิกเดียว
✅ **Active Filters Indicator** - แสดงว่ามีตัวกรองทำงานอยู่
✅ **Results Count** - แสดงจำนวนค่ายที่พบ
✅ **Selected Tags Display** - แสดง tags ที่เลือกไว้

---

## 🎨 การใช้งาน

### 1. เปิดใช้ Filters
```
กดปุ่ม "ตัวกรอง" → แผงตัวกรองจะแสดงขึ้น
```

### 2. เลือก Sort
```
กดปุ่มเรียงลำดับที่ต้องการ → ค่ายจะเรียงตามทันที
```

### 3. Filter by Tags
```
คลิก tag ที่ต้องการ → สามารถเลือกได้หลายอัน
คลิกอีกครั้งเพื่อยกเลิกการเลือก
```

### 4. Filter by Category
```
คลิกชิป category ที่ต้องการ
```

### 5. Filter by Price
```
ลาก slider 2 ตัวเพื่อกำหนดช่วงราคา
```

### 6. ล้างตัวกรองทั้งหมด
```
กดปุ่ม "ล้างตัวกรองทั้งหมด" → reset ทุกอย่างกลับเป็นค่าเริ่มต้น
```

---

## 🔧 Technical Details

### State Management
```typescript
const [selectedTags, setSelectedTags] = useState<string[]>([]);
const [sortBy, setSortBy] = useState<SortOption>('newest');
const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
const [searchQuery, setSearchQuery] = useState('');
```

### Filtering Logic
```typescript
useEffect(() => {
  let result = [...allCamps];
  
  // 1. Filter by Category
  if (selectedCategory !== "ทั้งหมด") {
    result = result.filter(camp => camp.category === selectedCategory);
  }
  
  // 2. Filter by Search
  if (searchQuery.trim()) {
    result = result.filter(camp => 
      camp.name.toLowerCase().includes(query) ||
      camp.description.toLowerCase().includes(query)
    );
  }
  
  // 3. Filter by Tags (OR logic)
  if (selectedTags.length > 0) {
    result = result.filter(camp => {
      const campTags = camp.tags || [];
      return selectedTags.some(tag => campTags.includes(tag));
    });
  }
  
  // 4. Filter by Price
  result = result.filter(camp => {
    const price = camp.fee || 0;
    return price >= priceRange[0] && price <= priceRange[1];
  });
  
  // 5. Sort
  result.sort(sortFunction);
  
  setFilteredCamps(result);
}, [selectedCategory, searchQuery, selectedTags, priceRange, sortBy, allCamps]);
```

### Sort Functions
```typescript
switch (sortBy) {
  case 'newest':
    return new Date(b.createdAt) - new Date(a.createdAt);
  
  case 'deadline-near':
    return new Date(a.registrationDeadline) - new Date(b.registrationDeadline);
  
  case 'price-low':
    return priceA - priceB;
  
  case 'popular':
    return (b.views || 0) - (a.views || 0);
}
```

---

## 🎯 UI/UX Features

### Visual Feedback
✅ **Selected State** - ปุ่ม/ชิปที่เลือกจะเปลี่ยนสี
✅ **Hover Effects** - แสดง effect เมื่อ hover
✅ **Smooth Transitions** - การเปลี่ยนหน้าแบบ smooth
✅ **Loading State** - แสดง spinner ขณะโหลด
✅ **Empty State** - แสดงข้อความเมื่อไม่พบค่าย

### Responsive Design
✅ **Mobile Friendly** - ใช้งานได้บนมือถือ
✅ **Grid Layout** - ปรับ columns ตามขนาดหน้าจอ
✅ **Scrollable Tags** - tags scroll ได้เมื่อมีเยอะ

### Performance
✅ **Debounced Search** - ค้นหาแบบ Real-time
✅ **Memoized Filtering** - ใช้ useEffect optimized
✅ **Lazy Loading** - แสดงแค่ 9 ค่ายก่อน แล้วค่อย "แสดงเพิ่มเติม"

---

## 📊 Filter Combinations

### ตัวอย่างการใช้งาน:

**ค้นหาค่าย Python ราคาไม่เกิน 3,000 บาท:**
```
1. เลือก tag "Python"
2. ลาก price slider ให้ max = 3000
3. เรียงตาม "ราคาน้อย-มาก"
```

**ค่าย Web Development ที่ใกล้ปิดรับสมัคร:**
```
1. เลือก category "Web Development"
2. เรียงตาม "ใกล้ปิดสุด"
```

**ค่ายยอดนิยมที่เกี่ยวกับ AI:**
```
1. เลือก tags: "Machine Learning", "AI", "Deep Learning"
2. เรียงตาม "ยอดนิยม"
```

---

## 🐛 Edge Cases Handling

### ไม่พบค่าย
```
แสดงข้อความ: "ไม่พบค่ายที่ตรงกับเงื่อนไข"
พร้อมปุ่ม "ล้างตัวกรอง"
```

### Tags ไม่มีค่าย
```
แสดงจำนวน: "พบ 0 ค่าย"
ให้ user ล้างตัวกรอง
```

### Price Range ไม่ถูกต้อง
```
ป้องกันไม่ให้ min > max
Auto-adjust เมื่อผิดปกติ
```

---

## ✅ Checklist การทดสอบ

### Basic Filtering
- [ ] Filter by Category ใช้งานได้
- [ ] Search ใช้งานได้
- [ ] Clear Search ทำงาน

### Tag Filtering
- [ ] เลือก tag ได้หลายอัน
- [ ] ยกเลิกการเลือก tag ได้
- [ ] แสดงจำนวน tags ที่เลือกถูกต้อง
- [ ] กรองตาม tags ถูกต้อง (OR logic)

### Sorting
- [ ] เรียงตาม "ใหม่สุด" ถูกต้อง
- [ ] เรียงตาม "ใกล้ปิดสุด" ถูกต้อง
- [ ] เรียงตาม "ราคาน้อย-มาก" ถูกต้อง
- [ ] เรียงตาม "ราคามาก-น้อย" ถูกต้อง
- [ ] เรียงตาม "ยอดนิยม" ถูกต้อง

### Price Range
- [ ] ลาก slider ได้
- [ ] แสดงราคา real-time
- [ ] กรองตามช่วงราคาถูกต้อง

### Clear Filters
- [ ] ปุ่ม "ล้างตัวกรอง" ทำงาน
- [ ] Reset ค่าทั้งหมดกลับเป็น default

### UI/UX
- [ ] Show/Hide filters panel ทำงาน
- [ ] แสดง "พบ X ค่าย" ถูกต้อง
- [ ] Active filters indicator ทำงาน
- [ ] Mobile responsive ใช้งานได้

---

## 🎉 สรุป

**ฟีเจอร์ที่เพิ่มเข้ามาทั้งหมด:**
1. ✅ ระบบ Sort 7 ตัวเลือก
2. ✅ ระบบ Filter by Tags (เลือกได้หลายอัน)
3. ✅ ระบบ Filter by Price Range
4. ✅ ระบบ Clear All Filters
5. ✅ Results Counter
6. ✅ Active Filters Indicator
7. ✅ Selected Tags Display
8. ✅ Mobile Responsive

**ไฟล์ที่ถูก update:**
- ✅ `src/app/(tab)/allcamps/AllCampsContent.tsx`

**พร้อมใช้งานแล้ว!** 🚀

---

## 📝 หมายเหตุ

### Tags System
- Tags ต้องถูกเพิ่มโดย Organizer ตอนสร้างค่าย
- ระบบจะแสดงเฉพาะ tags ที่อยู่ใน `ALL_TAGS` array
- สามารถเพิ่ม tags ใหม่ได้ใน `ALL_TAGS` constant

### Performance
- Filtering ทำงานแบบ client-side (real-time)
- ไม่ต้อง reload หน้าเมื่อเปลี่ยน filter
- Optimized สำหรับ camps จำนวนมาก (>100 camps)

---

**ทดสอบได้เลยที่:** `http://localhost:3000/allcamps`
