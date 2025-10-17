'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Button, Select, SelectItem, Textarea } from '@heroui/react';
import { Mail, User, Phone, Building, CreditCard, MapPin, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { UserRole } from '@/types';

const provinces = [
  'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา',
  'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก',
  'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน',
  'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา',
  'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'พะเยา', 'ภูเก็ต',
  'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี',
  'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ',
  'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี',
  'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อุดรธานี', 'อุทัยธานี', 'อุตรดิตถ์', 'อุบลราชธานี', 'อำนาจเจริญ'
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'user' | 'organizer'>('user');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    lineId: '',
    organization: '',
    idCard: '',
    address: '',
    province: '',
    district: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: role === 'organizer' ? UserRole.ORGANIZER : UserRole.USER,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      router.push('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
        >
          ← กลับไปหน้าเข้าสู่ระบบ
        </Link>

        <Card className="p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              สมัครสมาชิก
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              เลือกประเภทบัญชีและกรอกข้อมูลให้ครบถ้วน
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`p-6 rounded-xl border-2 transition-all ${
                role === 'user'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <User className={`w-8 h-8 mx-auto mb-2 ${role === 'user' ? 'text-orange-500' : 'text-gray-400'}`} />
              <div className="font-semibold">ผู้ใช้ทั่วไป</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">สมัครเข้าร่วมค่าย</div>
            </button>

            <button
              type="button"
              onClick={() => setRole('organizer')}
              className={`p-6 rounded-xl border-2 transition-all ${
                role === 'organizer'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <Building className={`w-8 h-8 mx-auto mb-2 ${role === 'organizer' ? 'text-orange-500' : 'text-gray-400'}`} />
              <div className="font-semibold">ผู้จัดค่าย</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">สร้างและจัดการค่าย</div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="email"
                label="อีเมล"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                startContent={<Mail className="w-4 h-4 text-gray-400" />}
                required
                isRequired
              />

              <Input
                type="text"
                label="ชื่อ-นามสกุล"
                placeholder="ชื่อและนามสกุล"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                startContent={<User className="w-4 h-4 text-gray-400" />}
                required
                isRequired
              />
            </div>

            {role === 'organizer' && (
              <>
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">ข้อมูลผู้จัดค่าย</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        กรุณากรอกข้อมูลให้ครบถ้วนเพื่อการยืนยันตัวตน
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="text"
                      label="ชื่อองค์กร/หน่วยงาน"
                      placeholder="ชื่อองค์กรหรือหน่วยงาน"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      startContent={<Building className="w-4 h-4 text-gray-400" />}
                      required
                      isRequired
                    />

                    <Input
                      type="text"
                      label="เลขประจำตัวบัตรประชาชน"
                      placeholder="1234567890123"
                      value={formData.idCard}
                      onChange={(e) => setFormData({ ...formData, idCard: e.target.value.replace(/\D/g, '').slice(0, 13) })}
                      startContent={<CreditCard className="w-4 h-4 text-gray-400" />}
                      maxLength={13}
                      required
                      isRequired
                    />

                    <Input
                      type="tel"
                      label="เบอร์โทรศัพท์"
                      placeholder="0812345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      startContent={<Phone className="w-4 h-4 text-gray-400" />}
                      required
                      isRequired
                    />

                    <Input
                      type="text"
                      label="LINE ID"
                      placeholder="your_line_id"
                      value={formData.lineId}
                      onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                      startContent={<FileText className="w-4 h-4 text-gray-400" />}
                      required
                      isRequired
                    />
                  </div>

                  <Textarea
                    label="ที่อยู่่"
                    placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    minRows={2}
                    required
                    isRequired
                    className="mt-4"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Select
                      label="จังหวัด"
                      placeholder="เลือกจังหวัด"
                      selectedKeys={formData.province ? [formData.province] : []}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      required
                      isRequired
                      startContent={<MapPin className="w-4 h-4 text-gray-400" />}
                    >
                      {provinces.map((province) => (
                        <SelectItem key={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </Select>

                    <Input
                      type="text"
                      label="อำเภอ"
                      placeholder="อำเภอ"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      startContent={<MapPin className="w-4 h-4 text-gray-400" />}
                      required
                      isRequired
                    />
                  </div>
                </div>
              </>
            )}

            {role === 'user' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="tel"
                  label="เบอร์โทรศัพท์ (ไม่บังคับ)"
                  placeholder="0812345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  startContent={<Phone className="w-4 h-4 text-gray-400" />}
                />

                <Input
                  type="text"
                  label="LINE ID (ไม่บังคับ)"
                  placeholder="your_line_id"
                  value={formData.lineId}
                  onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                  startContent={<FileText className="w-4 h-4 text-gray-400" />}
                />
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                การสมัครสมาชิก คุณยอมรับ{' '}
                <Link href="/terms" className="text-orange-600 hover:underline">
                  ข้อกำหนดการใช้งาน
                </Link>{' '}
                และ{' '}
                <Link href="/privacy" className="text-orange-600 hover:underline">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </p>
            </div>

            <Button
              type="submit"
              color={role === 'organizer' ? 'warning' : 'warning'}
              className="w-full"
              size="lg"
              isLoading={loading}
            >
              สมัครสมาชิก
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              มีบัญชีอยู่แล้ว?{' '}
              <Link href="/login" className="text-orange-600 hover:underline font-semibold">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
