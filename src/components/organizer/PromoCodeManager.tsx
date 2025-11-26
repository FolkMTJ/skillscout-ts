// src/components/organizer/PromoCodeManager.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Chip,
  useDisclosure,
  Switch,
  Textarea,
} from '@heroui/react';
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiCalendar, FiPercent } from 'react-icons/fi';
import { PromoCode, DiscountType, Camp } from '@/types';
import toast from 'react-hot-toast';

interface PromoCodeManagerProps {
  userId: string;
  userRole: 'admin' | 'organizer';
  camps?: Camp[]; // สำหรับ Organizer เลือกค่าย
}

export default function PromoCodeManager({ userId, userRole, camps = [] }: PromoCodeManagerProps) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deletingId, setDeletingId] = useState<string>('');

  const [formData, setFormData] = useState({
    code: '',
    discountType: DiscountType.PERCENTAGE,
    discountValue: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    applicableToAllCamps: false,
    applicableCamps: [] as string[],
    description: '',
    minAmount: '',
    maxDiscount: '',
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []); // ✅ เพิ่ม empty array เพื่อเรียกแค่ครั้งเดียว

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const url = userRole === 'organizer' 
        ? `/api/promo-codes?organizerId=${userId}`
        : '/api/promo-codes';
      
      const res = await fetch(url, {
        cache: 'no-store' // ป้องกัน cache
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch');
      }
      
      const data = await res.json();
      setPromoCodes(Array.isArray(data) ? data : data.promoCodes || []);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('ไม่สามารถโหลดรหัสโปรโมชั่นได้');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (code?: PromoCode) => {
    if (code) {
      setEditingCode(code);
      setFormData({
        code: code.code,
        discountType: code.discountType,
        discountValue: code.discountValue.toString(),
        maxUses: code.usageLimit?.toString() || '',
        validFrom: new Date(code.validFrom).toISOString().slice(0, 16),
        validUntil: new Date(code.validUntil).toISOString().slice(0, 16),
        applicableToAllCamps: !code.applicableCamps || code.applicableCamps.length === 0,
        applicableCamps: code.applicableCamps || [],
        description: code.description || '',
        minAmount: code.minAmount?.toString() || '',
        maxDiscount: code.maxDiscount?.toString() || '',
      });
    } else {
      setEditingCode(null);
      setFormData({
        code: '',
        discountType: DiscountType.PERCENTAGE,
        discountValue: '',
        maxUses: '',
        validFrom: '',
        validUntil: '',
        applicableToAllCamps: userRole === 'admin',
        applicableCamps: [],
        description: '',
        minAmount: '',
        maxDiscount: '',
      });
    }
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.code || !formData.discountValue || !formData.maxUses || 
          !formData.validFrom || !formData.validUntil) {
        toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }

      if (userRole === 'organizer' && !formData.applicableToAllCamps && formData.applicableCamps.length === 0) {
        toast.error('กรุณาเลือกค่ายอย่างน้อย 1 ค่าย');
        return;
      }

      const body = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        maxUses: parseInt(formData.maxUses),
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
        applicableToAllCamps: formData.applicableToAllCamps,
        applicableCamps: formData.applicableToAllCamps ? [] : formData.applicableCamps,
        description: formData.description,
        minAmount: formData.minAmount ? parseFloat(formData.minAmount) : undefined,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
      };

      if (editingCode) {
        // Update
        const res = await fetch(`/api/promo-codes/${editingCode._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to update');
        }

        toast.success('อัพเดทรหัสโปรโมชั่นสำเร็จ');
      } else {
        // Create
        const res = await fetch('/api/promo-codes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to create');
        }

        toast.success('สร้างรหัสโปรโมชั่นสำเร็จ');
      }

      onClose();
      fetchPromoCodes();
    } catch (error) {
      console.error('Error saving promo code:', error);
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/promo-codes/${deletingId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      toast.success('ลบรหัสโปรโมชั่นสำเร็จ');
      onDeleteClose();
      fetchPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast.error('ไม่สามารถลบรหัสโปรโมชั่นได้');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/promo-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) throw new Error('Failed to toggle');

      toast.success(currentStatus ? 'ปิดการใช้งานแล้ว' : 'เปิดการใช้งานแล้ว');
      fetchPromoCodes();
    } catch (error) {
      console.error('Error toggling promo code:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600 text-sm">
            {userRole === 'admin' 
              ? 'สร้างรหัสส่วนลดที่ใช้ได้ทั้งเว็บ' 
              : 'สร้างรหัสส่วนลดสำหรับค่ายของคุณ'}
          </p>
        </div>
        <Button
          color="warning"
          className="font-bold"
          startContent={<FiPlus />}
          onPress={() => handleOpenModal()}
        >
          สร้างรหัสใหม่
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>
      ) : promoCodes.length === 0 ? (
        <div className="text-center py-12">
          <FiTag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">ยังไม่มีรหัสโปรโมชั่น</p>
          <Button
            color="warning"
            variant="flat"
            startContent={<FiPlus />}
            onPress={() => handleOpenModal()}
          >
            สร้างรหัสแรก
          </Button>
        </div>
      ) : (
        <Table aria-label="Promo codes table">
          <TableHeader>
            <TableColumn>รหัส</TableColumn>
            <TableColumn>ประเภท</TableColumn>
            <TableColumn>ส่วนลด</TableColumn>
            <TableColumn>ใช้แล้ว</TableColumn>
            <TableColumn>วันหมดอายุ</TableColumn>
            <TableColumn>สถานะ</TableColumn>
            <TableColumn>จัดการ</TableColumn>
          </TableHeader>
          <TableBody>
              {promoCodes.map((code) => (
                <TableRow key={code._id}>
                  <TableCell>
                    <div>
                      <p className="font-bold text-orange-600">{code.code}</p>
                      {code.description && (
                        <p className="text-xs text-gray-500">{code.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {code.applicableCamps && code.applicableCamps.length > 0 ? (
                      <Chip size="sm" color="primary" variant="flat">
                        {code.applicableCamps.length} ค่าย
                      </Chip>
                    ) : (
                      <Chip size="sm" color="success" variant="flat">
                        ทั้งเว็บ
                      </Chip>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {code.discountType === DiscountType.PERCENTAGE ? (
                        <>
                          <FiPercent className="w-3 h-3" />
                          {code.discountValue}%
                        </>
                      ) : (
                        <>฿{code.discountValue}</>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {code.usedCount} / {code.usageLimit || '∞'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <FiCalendar className="w-3 h-3" />
                      {new Date(code.validUntil).toLocaleDateString('th-TH')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      size="sm"
                      isSelected={code.isActive}
                      onValueChange={() => handleToggleActive(code._id, code.isActive)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        isIconOnly
                        variant="light"
                        color="primary"
                        onPress={() => handleOpenModal(code)}
                      >
                        <FiEdit2 />
                      </Button>
                      <Button
                        size="sm"
                        isIconOnly
                        variant="light"
                        color="danger"
                        onPress={() => {
                          setDeletingId(code._id);
                          onDeleteOpen();
                        }}
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {editingCode ? 'แก้ไขรหัสโปรโมชั่น' : 'สร้างรหัสโปรโมชั่นใหม่'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="รหัสโปรโมชั่น"
                placeholder="SUMMER2025"
                value={formData.code}
                onValueChange={(v) => setFormData({ ...formData, code: v.toUpperCase() })}
                isRequired
              />

              <Textarea
                label="คำอธิบาย"
                placeholder="ส่วนลดพิเศษฤดูร้อน..."
                value={formData.description}
                onValueChange={(v) => setFormData({ ...formData, description: v })}
                minRows={2}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="ประเภทส่วนลด"
                  selectedKeys={[formData.discountType]}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
                  isRequired
                >
                  <SelectItem key={DiscountType.PERCENTAGE}>
                    เปอร์เซ็นต์
                  </SelectItem>
                  <SelectItem key={DiscountType.FIXED}>
                    จำนวนเงิน
                  </SelectItem>
                </Select>

                <Input
                  label={formData.discountType === DiscountType.PERCENTAGE ? 'เปอร์เซ็นต์' : 'จำนวนเงิน'}
                  type="number"
                  placeholder={formData.discountType === DiscountType.PERCENTAGE ? '10' : '100'}
                  value={formData.discountValue}
                  onValueChange={(v) => setFormData({ ...formData, discountValue: v })}
                  isRequired
                  endContent={
                    formData.discountType === DiscountType.PERCENTAGE ? '%' : '฿'
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ยอดซื้อขั้นต่ำ (ถ้ามี)"
                  type="number"
                  placeholder="500"
                  value={formData.minAmount}
                  onValueChange={(v) => setFormData({ ...formData, minAmount: v })}
                  startContent="฿"
                />

                {formData.discountType === DiscountType.PERCENTAGE && (
                  <Input
                    label="ส่วนลดสูงสุด (ถ้ามี)"
                    type="number"
                    placeholder="1000"
                    value={formData.maxDiscount}
                    onValueChange={(v) => setFormData({ ...formData, maxDiscount: v })}
                    startContent="฿"
                  />
                )}
              </div>

              <Input
                label="จำนวนครั้งที่ใช้ได้"
                type="number"
                placeholder="100"
                value={formData.maxUses}
                onValueChange={(v) => setFormData({ ...formData, maxUses: v })}
                isRequired
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="เริ่มใช้งาน"
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  isRequired
                />

                <Input
                  label="หมดอายุ"
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  isRequired
                />
              </div>

              {userRole === 'admin' && (
                <Switch
                  isSelected={formData.applicableToAllCamps}
                  onValueChange={(checked) => 
                    setFormData({ ...formData, applicableToAllCamps: checked, applicableCamps: [] })
                  }
                >
                  ใช้ได้กับทุกค่าย
                </Switch>
              )}

              {!formData.applicableToAllCamps && camps.length > 0 && (
                <Select
                  label="เลือกค่ายที่ใช้ได้"
                  selectionMode="multiple"
                  placeholder="เลือกค่าย"
                  selectedKeys={formData.applicableCamps}
                  onSelectionChange={(keys) => 
                    setFormData({ ...formData, applicableCamps: Array.from(keys as Set<string>) })
                  }
                  isRequired={userRole === 'organizer'}
                >
                  {camps.map((camp) => (
                    <SelectItem key={camp._id}>
                      {camp.name}
                    </SelectItem>
                  ))}
                </Select>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              ยกเลิก
            </Button>
            <Button color="warning" onPress={handleSubmit}>
              {editingCode ? 'บันทึก' : 'สร้าง'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>ยืนยันการลบ</ModalHeader>
          <ModalBody>
            <p>คุณแน่ใจหรือไม่ที่จะลบรหัสโปรโมชั่นนี้?</p>
            <p className="text-sm text-gray-500">การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>
              ยกเลิก
            </Button>
            <Button color="danger" onPress={handleDelete}>
              ลบ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
