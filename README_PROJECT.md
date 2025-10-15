# SkillScout - แพลตฟอร์มจัดการค่าย IT

แอปพลิเคชันจัดการค่าย IT แบบครบวงจร พัฒนาด้วย Next.js 15, TypeScript, MongoDB และ TailwindCSS

## โครงสร้างโปรเจค

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # หน้าเข้าสู่ระบบ/สมัครสมาชิก
│   ├── (tab)/             # หน้าหลักและค่ายต่างๆ
│   ├── admin/             # หน้าแอดมิน
│   ├── organizer/         # หน้าผู้จัดค่าย
│   └── api/               # API Routes
├── components/            # React Components
│   ├── (card)/           # Card components
│   ├── camps/            # Camp-related components
│   ├── layout/           # Layout components
│   ├── maps/             # Map components
│   ├── organizer/        # Organizer components
│   └── ticket/           # Ticket components
├── lib/                   # Utilities และ Core Logic
│   ├── db/               # Database layer
│   │   └── models/       # Database models
│   ├── mongodb.ts        # MongoDB connection
│   ├── auth.ts           # NextAuth configuration
│   ├── data.ts           # Data fetching functions
│   ├── email.ts          # Email services
│   ├── cloudinary.ts     # Image upload
│   └── permissions.ts    # Authorization
├── types/                 # TypeScript type definitions
│   ├── index.ts          # Main export
│   ├── camp.ts           # Camp types
│   ├── user.ts           # User types
│   ├── payment.ts        # Payment types
│   ├── registration.ts   # Registration types
│   └── promo-code.ts     # Promo code types
└── styles/               # Global styles
```

## Features

- ✅ **ระบบผู้ใช้งาน 3 ระดับ**: User, Organizer, Admin
- ✅ **OTP Authentication**: เข้าสู่ระบบด้วยอีเมล OTP
- ✅ **จัดการค่าย**: สร้าง แก้ไข ลบค่าย
- ✅ **ระบบสมัครเข้าค่าย**: สมัครและจัดการการลงทะเบียน
- ✅ **ระบบชำระเงิน**: QR Payment + Slip Verification
- ✅ **Promo Code**: ระบบส่วนลดและโปรโมชั่น
- ✅ **รีวิวและคะแนน**: ให้คะแนนและรีวิวค่าย
- ✅ **Dashboard**: สำหรับ Organizer และ Admin

## เทคโนโลยีที่ใช้

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS 4, HeroUI
- **Database**: MongoDB (Native Driver)
- **Authentication**: NextAuth.js
- **File Upload**: Cloudinary
- **Email**: Nodemailer

## การติดตั้ง

\`\`\`bash
# Clone repository
git clone [repository-url]

# ติดตั้ง dependencies
npm install

# ตั้งค่า environment variables
cp .env.example .env.local

# รัน development server
npm run dev
\`\`\`

## Environment Variables

\`\`\`env
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
\`\`\`

## Scripts

- \`npm run dev\` - รัน development server
- \`npm run build\` - Build สำหรับ production
- \`npm run start\` - รัน production server
- \`npm run lint\` - รัน ESLint
- \`npm run test:db\` - ทดสอบการเชื่อมต่อ database
- \`npm run seed\` - Seed ข้อมูลเริ่มต้น

## Code Quality

- ✅ **No \`any\` types** - ใช้ TypeScript แบบ strict
- ✅ **Centralized exports** - Import/Export จากที่เดียว
- ✅ **Consistent naming** - ตั้งชื่อตามมาตรฐาน
- ✅ **Type safety** - Type definitions ที่ครบถ้วน

## License

MIT
