// src/components/organizer/CampFormModal.tsx
'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Chip, Select, SelectItem } from '@heroui/react';
import { FiPlus, FiX, FiSave } from 'react-icons/fi';
import SimpleImageUpload from './SimpleImageUpload';
import SimpleMultiImageUpload from './SimpleMultiImageUpload';
import toast from 'react-hot-toast';

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
const POPULAR_TAGS = ['Programming', 'Web Development', 'Mobile App', 'Data Science', 'AI/ML', 'UI/UX Design', 'Game Development', 'Cybersecurity', 'Cloud Computing', 'IoT'];

export default function CampFormModal({ isOpen, onClose, formData, onFormDataChange, onSubmit, isEditing = false }: CampFormModalProps) {
  const [tagInput, setTagInput] = useState('');
  const [additionalInfoInput, setAdditionalInfoInput] = useState('');
  const [organizerName, setOrganizerName] = useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(e); }}>
            <ModalHeader className="text-xl font-bold border-b">
              {isEditing ? 'แก้ไขค่าย' : 'สร้างค่ายใหม่'}
            </ModalHeader>

            <ModalBody className="py-6">
              <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
                {/* ข้อมูลพื้นฐาน */}
                <Input label="ชื่อค่าย" placeholder="Web Development Bootcamp" value={formData.name} onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })} required />
                <Textarea label="รายละเอียด" placeholder="อธิบายค่าย..." value={formData.description} onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })} minRows={3} required />
                <Input label="สถานที่" placeholder="มหาวิทยาลัย" value={formData.location} onChange={(e) => onFormDataChange({ ...formData, location: e.target.value })} required />
                
                <Select label="รูปแบบ" selectedKeys={[formData.activityFormat]} onChange={(e) => onFormDataChange({ ...formData, activityFormat: e.target.value })}>
                  {ACTIVITY_FORMATS.map(f => <SelectItem key={f}>{f}</SelectItem>)}
                </Select>

                {/* วันเวลา */}
                <div className="grid grid-cols-2 gap-4">
                  <Input type="date" label="เริ่ม" value={formData.startDate} onChange={(e) => onFormDataChange({ ...formData, startDate: e.target.value })} required />
                  <Input type="date" label="สิ้นสุด" value={formData.endDate} onChange={(e) => onFormDataChange({ ...formData, endDate: e.target.value })} required />
                </div>
                <Input type="date" label="ปิดรับ" value={formData.registrationDeadline} onChange={(e) => onFormDataChange({ ...formData, registrationDeadline: e.target.value })} required />

                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" label="จำนวน (คน)" value={formData.capacity} onChange={(e) => onFormDataChange({ ...formData, capacity: e.target.value })} required />
                  <Input type="number" label="ค่าใช้จ่าย (บาท)" value={formData.fee} onChange={(e) => onFormDataChange({ ...formData, fee: e.target.value })} />
                </div>

                {/* รูปภาพ */}
                <SimpleImageUpload value={formData.image} onChange={(url) => onFormDataChange({ ...formData, image: url })} label="รูปหน้าปก" />
                <SimpleMultiImageUpload values={formData.galleryImages} onChange={(urls) => onFormDataChange({ ...formData, galleryImages: urls })} label="รูปเพิ่มเติม" />

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Tags</label>
                  <div className="flex gap-2">
                    <Input placeholder="เพิ่ม tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) { onFormDataChange({ ...formData, tags: [...formData.tags, tagInput.trim()] }); setTagInput(''); }}}} className="flex-1" />
                    <Button isIconOnly color="primary" onPress={() => { if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) { onFormDataChange({ ...formData, tags: [...formData.tags, tagInput.trim()] }); setTagInput(''); }}}><FiPlus /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TAGS.map(tag => <Chip key={tag} size="sm" variant="flat" className="cursor-pointer" onClick={() => { if (!formData.tags.includes(tag)) onFormDataChange({ ...formData, tags: [...formData.tags, tag] }); }}>{tag}</Chip>)}
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => <Chip key={tag} color="primary" onClose={() => onFormDataChange({ ...formData, tags: formData.tags.filter(t => t !== tag) })}>{tag}</Chip>)}
                    </div>
                  )}
                </div>

                {/* คุณสมบัติ */}
                <Select label="ระดับการศึกษา" selectedKeys={[formData.qualificationLevel]} onChange={(e) => onFormDataChange({ ...formData, qualificationLevel: e.target.value })}>
                  {EDUCATION_LEVELS.map(level => <SelectItem key={level}>{level}</SelectItem>)}
                </Select>
                <Textarea label="รายละเอียดคุณสมบัติ" value={formData.qualificationDetails} onChange={(e) => onFormDataChange({ ...formData, qualificationDetails: e.target.value })} minRows={2} />

                <div className="flex gap-4 p-3 bg-gray-50 rounded">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.allowVocational} onChange={(e) => onFormDataChange({ ...formData, allowVocational: e.target.checked })} />
                    <span className="text-sm">สายอาชีวะ</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.hasCertificate} onChange={(e) => onFormDataChange({ ...formData, hasCertificate: e.target.checked })} />
                    <span className="text-sm">มีใบประกาศ</span>
                  </label>
                </div>

                {/* ผู้จัด */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">ผู้จัดค่าย</label>
                  <div className="flex gap-2">
                    <Input placeholder="ชื่อผู้จัด" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} className="flex-1" />
                    <Button color="primary" startContent={<FiPlus />} onPress={() => { if (organizerName.trim()) { onFormDataChange({ ...formData, organizers: [...formData.organizers, { name: organizerName.trim(), imageUrl: '/api/placeholder/100/100' }] }); setOrganizerName(''); toast.success('เพิ่มแล้ว'); }}}>เพิ่ม</Button>
                  </div>
                  {formData.organizers.map((org, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <span className="flex-1">{org.name}</span>
                      <Button isIconOnly size="sm" color="danger" variant="flat" onPress={() => onFormDataChange({ ...formData, organizers: formData.organizers.filter((_, idx) => idx !== i) })}><FiX /></Button>
                    </div>
                  ))}
                </div>

                {/* เพิ่มเติม */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">ข้อมูลเพิ่มเติม</label>
                  <div className="flex gap-2">
                    <Input placeholder="เช่น มีอาหารว่าง" value={additionalInfoInput} onChange={(e) => setAdditionalInfoInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (additionalInfoInput.trim()) { onFormDataChange({ ...formData, additionalInfo: [...formData.additionalInfo, additionalInfoInput.trim()] }); setAdditionalInfoInput(''); }}}} className="flex-1" />
                    <Button isIconOnly color="primary" onPress={() => { if (additionalInfoInput.trim()) { onFormDataChange({ ...formData, additionalInfo: [...formData.additionalInfo, additionalInfoInput.trim()] }); setAdditionalInfoInput(''); }}}><FiPlus /></Button>
                  </div>
                  {formData.additionalInfo.map((info, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                      <span className="flex-1 text-sm">{info}</span>
                      <Button isIconOnly size="sm" color="danger" variant="flat" onPress={() => onFormDataChange({ ...formData, additionalInfo: formData.additionalInfo.filter((_, idx) => idx !== i) })}><FiX /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="border-t">
              <Button variant="flat" onPress={onClose}>ยกเลิก</Button>
              <Button color="primary" type="submit" startContent={<FiSave />}>
                {isEditing ? 'บันทึก' : 'สร้างค่าย'}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
