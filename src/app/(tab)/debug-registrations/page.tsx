'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, Chip, Button } from '@heroui/react';
import { FiCheckCircle, FiClock, FiXCircle, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Registration {
  id: string;
  campId: string;
  campName?: string;
  status: string;
  createdAt: string;
  appliedAt?: string;
}

interface DebugData {
  userId: string;
  totalRegistrations: number;
  confirmedCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  registrations: Registration[];
}

export default function MyRegistrationsDebugPage() {
  const { status } = useSession();
  const [data, setData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/debug/my-registrations');
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAll = async () => {
    if (!confirm('ต้องการอนุมัติค่ายที่ pending ทั้งหมดใช่หรือไม่?')) return;

    setApproving(true);
    try {
      const res = await fetch('/api/debug/approve-all', {
        method: 'POST'
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(`อนุมัติสำเร็จ! ${result.approvedCount} ค่าย`);
        // Refresh data
        fetchData();
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg font-bold">ไม่พบข้อมูล</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black mb-2">Debug: My Registrations</h1>
          <p className="text-gray-600 mb-8">ตรวจสอบสถานะการสมัครทั้งหมดของคุณ</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-blue-50 border-2 border-blue-400">
              <p className="text-sm text-gray-600 mb-1">ทั้งหมด</p>
              <p className="text-3xl font-black">{data.totalRegistrations}</p>
            </Card>

            <Card className="p-4 bg-green-50 border-2 border-green-400">
              <p className="text-sm text-gray-600 mb-1">Confirmed</p>
              <p className="text-3xl font-black text-green-600">{data.confirmedCount || 0}</p>
            </Card>

            <Card className="p-4 bg-purple-50 border-2 border-purple-400">
              <p className="text-sm text-gray-600 mb-1">Approved</p>
              <p className="text-3xl font-black text-purple-600">{data.approvedCount || 0}</p>
            </Card>

            <Card className="p-4 bg-yellow-50 border-2 border-yellow-400">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-black text-yellow-600">{data.pendingCount}</p>
            </Card>
          </div>

          {/* Info Box */}
          <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4 mb-8">
            <h3 className="font-bold text-blue-900 mb-2">📋 สำคัญ!</h3>
            <p className="text-sm text-blue-800 mb-1">
              Discovery Path จะแสดงผลก็ต่อเมื่อมีค่ายที่ status = <strong>attended</strong> เท่านั้น
            </p>
            <p className="text-xs text-blue-700 mb-3">
              (เฉพาะค่ายที่<strong>เข้าร่วมจริงแล้ว</strong> - ต้อง check-in ด้วย QR Code)
            </p>
            {data.pendingCount > 0 && (
              <Button
                color="warning"
                size="sm"
                startContent={<FiZap />}
                onPress={handleApproveAll}
                isLoading={approving}
                className="font-bold"
              >
                อนุมัติค่าย Pending ทั้งหมด ({data.pendingCount} ค่าย)
              </Button>
            )}
          </div>

          {/* Registrations List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black mb-4">รายการสมัครทั้งหมด</h2>
            {data.registrations.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">ยังไม่มีการสมัครค่าย</p>
              </Card>
            ) : (
              data.registrations.map((reg) => (
                <Card key={reg.id} className="p-4 border-2 border-black">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-lg mb-2">Camp ID: {reg.campId}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        Registration ID: {reg.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        สมัครเมื่อ: {new Date(reg.createdAt).toLocaleString('th-TH')}
                      </p>
                    </div>
                    <StatusChip status={reg.status} />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const statusConfig: Record<string, {
    color: 'success' | 'primary' | 'secondary' | 'warning' | 'danger' | 'default';
    icon: React.ReactNode;
    label: string
  }> = {
    attended: {
      color: 'success',
      icon: <FiCheckCircle />,
      label: '✅ เข้าร่วมแล้ว'
    },
    confirmed: {
      color: 'primary',
      icon: <FiCheckCircle />,
      label: 'ยืนยันแล้ว'
    },
    approved: {
      color: 'secondary',
      icon: <FiCheckCircle />,
      label: 'อนุมัติแล้ว'
    },
    pending: {
      color: 'warning',
      icon: <FiClock />,
      label: 'รอตรวจสอบ'
    },
    rejected: {
      color: 'danger',
      icon: <FiXCircle />,
      label: 'ถูกปฏิเสธ'
    }
  };

  const config = statusConfig[status] || {
    color: 'default',
    icon: null,
    label: status
  };

  return (
    <Chip
      color={config.color}
      variant="flat"
      startContent={config.icon}
      className="font-bold"
    >
      {config.label}
    </Chip>
  );
}
