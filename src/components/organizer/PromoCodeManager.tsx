// src/components/organizer/PromoCodeManager.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Button,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // Optimistic update — flip immediately, no full reload
    setPromoCodes(prev =>
      prev.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c)
    );
    try {
      const res = await fetch(`/api/promo-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error('Failed to toggle');
      toast.success(currentStatus ? 'ปิดการใช้งานแล้ว' : 'เปิดการใช้งานแล้ว');
    } catch (error) {
      // Rollback on failure
      setPromoCodes(prev =>
        prev.map(c => c._id === id ? { ...c, isActive: currentStatus } : c)
      );
      console.error('Error toggling promo code:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const now = new Date();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">
            {userRole === 'admin' ? 'รหัสส่วนลดทั้งเว็บ' : 'รหัสส่วนลดของคุณ'}
          </p>
          {!loading && promoCodes.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
              {promoCodes.length}
            </span>
          )}
        </div>
        <Button
          className="bg-[#F2B33D] text-white font-bold"
          startContent={<FiPlus size={15} />}
          size="sm"
          onPress={() => handleOpenModal()}
        >
          สร้างรหัสใหม่
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : promoCodes.length === 0 ? (
        <div className="text-center py-14 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FiTag className="text-[#F2B33D]" size={22} />
          </div>
          <p className="text-gray-500 text-sm font-medium mb-3">ยังไม่มีรหัสโปรโมชั่น</p>
          <Button size="sm" className="bg-[#F2B33D] text-white font-semibold"
            startContent={<FiPlus size={13} />} onPress={() => handleOpenModal()}>
            สร้างรหัสแรก
          </Button>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {promoCodes.map((code) => {
            const isExpired = new Date(code.validUntil) < now;
            const usagePct = code.usageLimit
              ? Math.min(100, Math.round((code.usedCount / code.usageLimit) * 100))
              : 0;

            return (
              <div
                key={code._id}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all ${!code.isActive || isExpired
                  ? 'bg-gray-50 border-gray-100 opacity-60'
                  : 'bg-white border-gray-100 hover:border-[#F2B33D]/30 hover:shadow-sm'
                  }`}
              >
                {/* Left: Code info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-black text-[#F2B33D] tracking-widest text-sm">{code.code}</span>
                    {/* Discount badge */}
                    <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${code.discountType === DiscountType.PERCENTAGE
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                      }`}>
                      {code.discountType === DiscountType.PERCENTAGE
                        ? <>{code.discountValue}%</>
                        : <>฿{code.discountValue}</>
                      }
                    </span>
                    {/* Scope chip */}
                    {code.applicableCamps && code.applicableCamps.length > 0 ? (
                      <Chip size="sm" variant="flat" color="primary" className="text-[10px] h-5">{code.applicableCamps.length} ค่าย</Chip>
                    ) : (
                      <Chip size="sm" variant="flat" color="success" className="text-[10px] h-5">ทั้งเว็บ</Chip>
                    )}
                    {isExpired && (
                      <Chip size="sm" variant="flat" color="danger" className="text-[10px] h-5">หมดอายุ</Chip>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {code.description && (
                      <span className="truncate max-w-[160px] text-gray-500">{code.description}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <FiCalendar size={10} />
                      {new Date(code.validUntil).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      {code.usedCount}<span className="text-gray-300">/</span>{code.usageLimit || '∞'}
                      {code.usageLimit && usagePct >= 80 && (
                        <span className={`font-semibold ${usagePct >= 100 ? 'text-red-500' : 'text-orange-500'}`}>
                          ({usagePct}%)
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Right: Toggle + Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Switch
                    size="sm"
                    isSelected={code.isActive}
                    onValueChange={() => handleToggleActive(code._id, code.isActive)}
                    classNames={{ wrapper: 'mr-0' }}
                  />
                  <Button isIconOnly size="sm" variant="flat"
                    className="w-7 h-7 min-w-0 bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                    onPress={() => handleOpenModal(code)}>
                    <FiEdit2 size={13} />
                  </Button>
                  <Button isIconOnly size="sm" variant="flat"
                    className="w-7 h-7 min-w-0 bg-red-50 text-red-400 hover:bg-red-100"
                    onPress={() => { setDeletingId(code._id); onDeleteOpen(); }}>
                    <FiTrash2 size={13} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
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
