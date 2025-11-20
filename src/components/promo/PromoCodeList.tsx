"use client";

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { FiPlus, FiTag, FiEdit2, FiTrash2, FiMoreVertical, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { PromoCode, DiscountType } from '@/types';
import PromoCodeFormModal from './PromoCodeFormModal';

interface Camp {
  _id: string;
  name: string;
}

interface PromoCodeListProps {
  userRole: 'admin' | 'organizer';
  organizerCamps?: Camp[];
}

export default function PromoCodeList({ userRole, organizerCamps = [] }: PromoCodeListProps) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/promo-codes');
      const data = await response.json();

      if (response.ok) {
        setPromoCodes(data.promoCodes || []);
      } else {
        toast.error('ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/promo-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถเปลี่ยนสถานะได้');
      }

      toast.success(currentStatus ? 'ปิดใช้งานโค้ดแล้ว' : 'เปิดใช้งานโค้ดแล้ว');
      fetchPromoCodes();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      toast.error(message);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`ต้องการลบโค้ด "${code}" ใช่หรือไม่?`)) return;

    try {
      const response = await fetch(`/api/promo-codes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถลบได้');
      }

      toast.success('ลบโค้ดสำเร็จ');
      fetchPromoCodes();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      toast.error(message);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDiscountDisplay = (promo: PromoCode) => {
    if (promo.discountType === DiscountType.PERCENTAGE) {
      return `${promo.discountValue}%`;
    }
    return `฿${promo.discountValue}`;
  };

  const getStatusChip = (promo: PromoCode) => {
    const now = new Date();
    const validFrom = new Date(promo.validFrom);
    const validUntil = new Date(promo.validUntil);

    if (!promo.isActive) {
      return <Chip color="default" size="sm">ปิดใช้งาน</Chip>;
    }

    if (now < validFrom) {
      return <Chip color="warning" size="sm">ยังไม่เริ่ม</Chip>;
    }

    if (now > validUntil) {
      return <Chip color="danger" size="sm">หมดอายุ</Chip>;
    }

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return <Chip color="danger" size="sm">ใช้ครบแล้ว</Chip>;
    }

    return <Chip color="success" size="sm">ใช้งานได้</Chip>;
  };

  const getCampNames = (promo: PromoCode) => {
    if (!promo.applicableCamps || promo.applicableCamps.length === 0) {
      return <Chip size="sm" variant="flat" className="bg-blue-100 dark:bg-blue-900/30">ใช้ได้ทั้งหมด</Chip>;
    }

    const campNames = promo.applicableCamps
      .map(campId => {
        const camp = organizerCamps.find(c => c._id === campId);
        return camp?.name || 'ไม่พบข้อมูล';
      })
      .join(', ');

    return (
      <Tooltip content={campNames}>
        <Chip size="sm" variant="flat">
          {promo.applicableCamps.length} ค่าย
        </Chip>
      </Tooltip>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiTag className="text-orange-500" />
            โค้ดโปรโมชั่น
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {userRole === 'admin' ? 'จัดการโค้ดส่วนลดทั้งหมด' : 'จัดการโค้ดสำหรับค่ายของคุณ'}
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold"
          startContent={<FiPlus />}
          onPress={() => setIsModalOpen(true)}
        >
          สร้างโค้ดใหม่
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">โค้ดทั้งหมด</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {promoCodes.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">ใช้งานได้</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {promoCodes.filter(p => {
              const now = new Date();
              const validUntil = new Date(p.validUntil);
              return p.isActive && now <= validUntil && (!p.usageLimit || p.usedCount < p.usageLimit);
            }).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">หมดอายุ</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
            {promoCodes.filter(p => new Date(p.validUntil) < new Date()).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">ถูกใช้งาน</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {promoCodes.reduce((sum, p) => sum + p.usedCount, 0)}
          </p>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <Table aria-label="Promo codes table">
          <TableHeader>
            <TableColumn>รหัส</TableColumn>
            <TableColumn>ส่วนลด</TableColumn>
            <TableColumn>เงื่อนไข</TableColumn>
            <TableColumn>ใช้ได้กับ</TableColumn>
            <TableColumn>ระยะเวลา</TableColumn>
            <TableColumn>การใช้งาน</TableColumn>
            <TableColumn>สถานะ</TableColumn>
            <TableColumn>จัดการ</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={isLoading}
            emptyContent={
              <div className="text-center py-12">
                <FiTag className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500">ยังไม่มีโค้ดโปรโมชั่น</p>
                <Button
                  className="mt-4"
                  color="primary"
                  variant="flat"
                  onPress={() => setIsModalOpen(true)}
                >
                  สร้างโค้ดแรก
                </Button>
              </div>
            }
          >
            {promoCodes.map((promo) => (
              <TableRow key={promo._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <FiTag className="text-orange-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{promo.code}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(promo.createdAt)}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div>
                    <p className="font-bold text-orange-600 dark:text-orange-400">
                      {getDiscountDisplay(promo)}
                    </p>
                    {promo.discountType === DiscountType.PERCENTAGE && promo.maxDiscount && (
                      <p className="text-xs text-gray-500">สูงสุด ฿{promo.maxDiscount}</p>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm">
                    {promo.minAmount && (
                      <p className="text-gray-600 dark:text-gray-400">
                        ขั้นต่ำ ฿{promo.minAmount}
                      </p>
                    )}
                    {promo.usageLimit ? (
                      <p className="text-gray-600 dark:text-gray-400">
                        ใช้ได้ {promo.usageLimit} ครั้ง
                      </p>
                    ) : (
                      <p className="text-gray-500">ไม่จำกัด</p>
                    )}
                  </div>
                </TableCell>

                <TableCell>{getCampNames(promo)}</TableCell>

                <TableCell>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <p>{formatDate(promo.validFrom)}</p>
                    <p>ถึง {formatDate(promo.validUntil)}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {promo.usedCount}
                    </span>
                    {promo.usageLimit && (
                      <span className="text-gray-500">/ {promo.usageLimit}</span>
                    )}
                  </div>
                </TableCell>

                <TableCell>{getStatusChip(promo)}</TableCell>

                <TableCell>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                      >
                        <FiMoreVertical />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Actions">
                      <DropdownItem
                        key="toggle"
                        startContent={promo.isActive ? <FiEyeOff /> : <FiEye />}
                        onPress={() => handleToggleActive(promo._id, promo.isActive)}
                      >
                        {promo.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<FiTrash2 />}
                        onPress={() => handleDelete(promo._id, promo.code)}
                      >
                        ลบโค้ด
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create Modal */}
      <PromoCodeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPromoCodes}
        userRole={userRole}
        organizerCamps={organizerCamps}
      />
    </div>
  );
}
