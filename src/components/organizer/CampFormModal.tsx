// src/components/organizer/CampFormModal.tsx
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Divider,
  Chip
} from '@heroui/react';
import {
  FiPlus,
  FiX,
  FiSave,
  FiInfo,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiImage,
  FiUserCheck,
  FiList
} from 'react-icons/fi';
import SimpleImageUpload from './SimpleImageUpload';
import SimpleMultiImageUpload from './SimpleMultiImageUpload';
import OrganizerImageUpload from './OrganizerImageUpload';
import TagSelector from './TagSelector';
import toast from 'react-hot-toast';

// ... (Interface คงเดิม) ...
interface FormDataType {
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
}

interface CampFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormDataType;
  onFormDataChange: (data: FormDataType) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing?: boolean;
}

const ACTIVITY_FORMATS = ['On-site', 'Online', 'Hybrid'];
const EDUCATION_LEVELS = ['ม.3 - ม.6', 'นักศึกษา', 'บุคคลทั่วไป', 'ทุกระดับ'];

// Component ย่อยสำหรับหัวข้อ Section
const SectionHeader = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
  <div className="flex items-center gap-2 text-gray-800 font-bold text-lg mb-4 mt-2">
    <div className="p-2 bg-orange-100 text-[#F2B33D] rounded-lg">
      <Icon />
    </div>
    {title}
  </div>
);

export default function CampFormModal({ isOpen, onClose, formData, onFormDataChange, onSubmit, isEditing = false }: CampFormModalProps) {
  const { data: session } = useSession();
  const [additionalInfoInput, setAdditionalInfoInput] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  
  // ใช้ ref เพื่อ track ว่าเคยเพิ่ม organizer ไปแล้วหรือยัง
  const hasInitializedOrganizer = useRef(false);

  // เพิ่มชื่อผู้จัด default ตอนเปิด Modal ครั้งแรก (ไม่ใช่ตอน edit)
  useEffect(() => {
    if (isOpen && !isEditing && formData.organizers.length === 0 && session?.user?.name && !hasInitializedOrganizer.current) {
      hasInitializedOrganizer.current = true;
      onFormDataChange({
        ...formData,
        organizers: [
          {
            name: session.user.name,
            imageUrl: session.user.image || '/api/placeholder/100/100'
          }
        ]
      });
    }
    
    // Reset ref เมื่อปิด modal
    if (!isOpen) {
      hasInitializedOrganizer.current = false;
    }
  }, [isOpen, isEditing, session?.user?.name, session?.user?.image, formData, onFormDataChange]);

  // คำนวณ min/max dates
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const minEndDate = useMemo(() => formData.startDate || today, [formData.startDate, today]);
  const maxRegistrationDeadline = useMemo(() => {
    if (!formData.startDate) return '';
    const startDate = new Date(formData.startDate);
    startDate.setDate(startDate.getDate() - 1);
    return startDate.toISOString().split('T')[0];
  }, [formData.startDate]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl" // ลดขนาดลงนิดหน่อยให้ดู compact ขึ้น
      scrollBehavior="inside"
      placement="top-center"
      backdrop="blur"
      classNames={{
        header: "border-b border-gray-100 p-6 rounded-t-2xl",
        body: "p-6 overflow-y-auto max-h-[calc(90vh-200px)]",
        footer: "border-t border-gray-100 p-4 bg-gray-50 rounded-b-2xl",
        base: "max-h-[90vh]",
        wrapper: "overflow-hidden rounded-2xl"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(e); }}>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditing ? 'แก้ไขข้อมูลค่าย' : 'สร้างค่ายใหม่'}
              </h2>
              <p className="text-sm text-gray-500 font-normal">
                กรอกข้อมูลให้ครบถ้วนเพื่อสร้างประสบการณ์ที่ดีให้กับผู้สมัคร
              </p>
            </ModalHeader>

            <ModalBody>
              <div className="space-y-8">

                {/* --- ส่วนที่ 1: ข้อมูลทั่วไป --- */}
                <section>
                  <SectionHeader title="ข้อมูลทั่วไป" icon={FiInfo} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <Input
                        label="ชื่อค่าย"
                        placeholder="Ex. Web Development Bootcamp 2024"
                        value={formData.name}
                        onValueChange={(v) => onFormDataChange({ ...formData, name: v })}
                        required
                        variant="bordered"
                        size="lg"
                        classNames={{ inputWrapper: "bg-white" }}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Textarea
                        label="รายละเอียดโดยย่อ"
                        placeholder="อธิบายเกี่ยวกับค่ายของคุณ สิ่งที่จะได้รับ และจุดเด่นต่างๆ..."
                        value={formData.description}
                        onValueChange={(v) => onFormDataChange({ ...formData, description: v })}
                        minRows={4}
                        required
                        variant="bordered"
                        classNames={{ inputWrapper: "bg-white" }}
                      />
                    </div>

                    <Input
                      label="สถานที่จัดกิจกรรม"
                      placeholder="ระบุสถานที่ หรือ Link Zoom"
                      value={formData.location}
                      onValueChange={(v) => onFormDataChange({ ...formData, location: v })}
                      required
                      variant="bordered"
                      startContent={<FiMapPin className="text-gray-400" />}
                    />

                    <Select
                      label="รูปแบบกิจกรรม"
                      selectedKeys={[formData.activityFormat]}
                      onChange={(e) => onFormDataChange({ ...formData, activityFormat: e.target.value })}
                      variant="bordered"
                    >
                      {ACTIVITY_FORMATS.map(f => <SelectItem key={f}>{f}</SelectItem>)}
                    </Select>
                  </div>
                </section>

                <Divider />

                {/* --- ส่วนที่ 2: วันเวลาและค่าใช้จ่าย --- */}
                <section>
                  <SectionHeader title="วันเวลาและเงื่อนไข" icon={FiCalendar} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Input
                      type="date"
                      label="วันเริ่มค่าย"
                      value={formData.startDate}
                      min={today}
                      onValueChange={(v) => onFormDataChange({ ...formData, startDate: v })}
                      required
                      variant="bordered"
                    />
                    <Input
                      type="date"
                      label="วันสิ้นสุดค่าย"
                      value={formData.endDate}
                      min={minEndDate}
                      onValueChange={(v) => onFormDataChange({ ...formData, endDate: v })}
                      required
                      variant="bordered"
                    />
                    <Input
                      type="date"
                      label="ปิดรับสมัครวันที่"
                      value={formData.registrationDeadline}
                      min={today}
                      max={maxRegistrationDeadline}
                      onValueChange={(v) => onFormDataChange({ ...formData, registrationDeadline: v })}
                      required
                      variant="bordered"
                      color="danger"
                      description="ต้องปิดรับก่อนวันเริ่มค่าย"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                    <Input
                      type="number"
                      label="จำนวนที่รับ (คน)"
                      placeholder="0"
                      value={formData.capacity}
                      onValueChange={(v) => onFormDataChange({ ...formData, capacity: v })}
                      required
                      variant="bordered"
                      startContent={<FiUsers className="text-gray-400" />}
                    />
                    <Input
                      type="number"
                      label="ค่าเข้าร่วม (บาท)"
                      placeholder="ใส่ 0 หากฟรี"
                      value={formData.fee}
                      onValueChange={(v) => onFormDataChange({ ...formData, fee: v })}
                      variant="bordered"
                      startContent={<FiDollarSign className="text-gray-400" />}
                    />
                  </div>
                </section>

                <Divider />

                {/* --- ส่วนที่ 3: สื่อประชาสัมพันธ์ --- */}
                <section>
                  <SectionHeader title="ภาพประกอบและแท็ก" icon={FiImage} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600">รูปปกค่าย (Cover Image)</label>
                      <SimpleImageUpload
                        value={formData.image}
                        onChange={(url) => onFormDataChange({ ...formData, image: url })}
                        label="อัปโหลดรูปปก"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600">รูปบรรยากาศ (Gallery)</label>
                      <SimpleMultiImageUpload
                        values={formData.galleryImages}
                        onChange={(urls) => onFormDataChange({ ...formData, galleryImages: urls })}
                        label="เพิ่มรูปเพิ่มเติม"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">หมวดหมู่ (Tags)</label>
                    <TagSelector
                      selectedTags={formData.tags}
                      onChange={(tags) => onFormDataChange({ ...formData, tags })}
                      maxTags={5}
                    />
                  </div>
                </section>

                <Divider />

                {/* --- ส่วนที่ 4: คุณสมบัติและผู้จัด --- */}
                <section>
                  <SectionHeader title="คุณสมบัติและผู้จัด" icon={FiUserCheck} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <Select
                      label="ระดับการศึกษา"
                      selectedKeys={[formData.qualificationLevel]}
                      onChange={(e) => onFormDataChange({ ...formData, qualificationLevel: e.target.value })}
                      variant="bordered"
                    >
                      {EDUCATION_LEVELS.map(level => <SelectItem key={level}>{level}</SelectItem>)}
                    </Select>

                    <div className="flex gap-4 items-center px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.allowVocational}
                          onChange={(e) => onFormDataChange({ ...formData, allowVocational: e.target.checked })}
                          className="w-4 h-4 text-[#F2B33D] rounded focus:ring-[#F2B33D]"
                        />
                        <span className="text-sm font-medium">รับสายอาชีวะ</span>
                      </label>
                      <div className="w-px h-6 bg-gray-300 mx-2"></div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.hasCertificate}
                          onChange={(e) => onFormDataChange({ ...formData, hasCertificate: e.target.checked })}
                          className="w-4 h-4 text-[#F2B33D] rounded focus:ring-[#F2B33D]"
                        />
                        <span className="text-sm font-medium">มีเกียรติบัตร</span>
                      </label>
                    </div>
                  </div>

                  <Textarea
                    label="รายละเอียดคุณสมบัติเพิ่มเติม"
                    placeholder="เช่น ต้องมีพื้นฐาน Python, เตรียม Laptop มาเอง ฯลฯ"
                    value={formData.qualificationDetails}
                    onValueChange={(v) => onFormDataChange({ ...formData, qualificationDetails: v })}
                    minRows={2}
                    variant="bordered"
                  />

                  {/* Organizer Management */}
                  <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FiUsers className="text-gray-400" /> ทีมผู้จัด (Organizers)
                    </h3>

                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="ชื่อผู้จัด / วิทยากร"
                        value={organizerName}
                        onValueChange={setOrganizerName}
                        variant="flat"
                        size="sm"
                        className="flex-1"
                        classNames={{ inputWrapper: "bg-white" }}
                      />
                      <Button
                        color="primary"
                        size="sm"
                        startContent={<FiPlus />}
                        onPress={() => {
                          if (organizerName.trim()) {
                            onFormDataChange({
                              ...formData,
                              organizers: [...formData.organizers, { name: organizerName.trim(), imageUrl: '/api/placeholder/100/100' }]
                            });
                            setOrganizerName('');
                            toast.success('เพิ่มผู้จัดแล้ว');
                          }
                        }}
                      >
                        เพิ่ม
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {formData.organizers.map((org, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                          <div className="shrink-0">
                            <OrganizerImageUpload
                              organizerName={org.name}
                              imageUrl={org.imageUrl}
                              onImageChange={(url) => {
                                const updated = [...formData.organizers];
                                updated[i] = { ...updated[i], imageUrl: url };
                                onFormDataChange({ ...formData, organizers: updated });
                              }}
                            />
                          </div>
                          <div className="flex-1 font-medium text-gray-700">{org.name}</div>
                          <Button
                            isIconOnly size="sm" color="danger" variant="light"
                            onPress={() => onFormDataChange({ ...formData, organizers: formData.organizers.filter((_, idx) => idx !== i) })}
                          >
                            <FiX />
                          </Button>
                        </div>
                      ))}
                      {formData.organizers.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-2">-- ยังไม่มีข้อมูลผู้จัด --</p>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FiList className="text-gray-400" /> ข้อมูลเพิ่มเติม (สิ่งที่ต้องเตรียม/สวัสดิการ)
                    </h3>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="เช่น มีอาหารกลางวันเลี้ยง, เสื้อค่ายฟรี"
                        value={additionalInfoInput}
                        onValueChange={setAdditionalInfoInput}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (additionalInfoInput.trim()) {
                              onFormDataChange({ ...formData, additionalInfo: [...formData.additionalInfo, additionalInfoInput.trim()] });
                              setAdditionalInfoInput('');
                            }
                          }
                        }}
                        variant="bordered"
                        size="sm"
                      />
                      <Button
                        isIconOnly size="sm" color="secondary" variant="flat"
                        onPress={() => {
                          if (additionalInfoInput.trim()) {
                            onFormDataChange({ ...formData, additionalInfo: [...formData.additionalInfo, additionalInfoInput.trim()] });
                            setAdditionalInfoInput('');
                          }
                        }}
                      >
                        <FiPlus />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.additionalInfo.map((info, i) => (
                        <Chip key={i} onClose={() => onFormDataChange({ ...formData, additionalInfo: formData.additionalInfo.filter((_, idx) => idx !== i) })} variant="flat" color="primary">
                          {info}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </section>

              </div>
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={onClose} className="font-medium text-gray-500">
                ยกเลิก
              </Button>
              <Button
                className="bg-[#F2B33D] text-white font-bold shadow-lg shadow-orange-200"
                type="submit"
                startContent={<FiSave />}
                size="lg"
              >
                {isEditing ? 'บันทึกการแก้ไข' : 'ยืนยันสร้างค่าย'}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}