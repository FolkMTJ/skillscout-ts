'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, Button, Input, Chip } from '@heroui/react';
import { FiArrowLeft, FiSmartphone, FiCheckCircle, FiAlertCircle, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface PayoutInfo {
  promptpayId: string;
  accountName: string;
  createdAt: string;
  updatedAt: string;
}

export default function PayoutSettingsPage() {
  const router = useRouter();
  const { status } = useSession();

  const [payoutInfo, setPayoutInfo] = useState<PayoutInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [promptpayId, setPromptpayId] = useState('');
  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPayoutInfo();
    }
  }, [status]);

  const fetchPayoutInfo = async () => {
    try {
      const res = await fetch('/api/organizer/payout');
      const data = await res.json();
      if (data.success && data.payoutInfo) {
        setPayoutInfo(data.payoutInfo);
        setPromptpayId(data.payoutInfo.promptpayId);
        setAccountName(data.payoutInfo.accountName);
      }
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!promptpayId) { toast.error('กรุณากรอก PromptPay ID'); return; }
    if (!/^(\d{10}|\d{13})$/.test(promptpayId)) {
      toast.error('PromptPay ID ต้องเป็นเบอร์โทร 10 หลัก หรือเลขบัตรประชาชน 13 หลัก');
      return;
    }
    if (!accountName.trim()) { toast.error('กรุณากรอกชื่อบัญชี'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/organizer/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptpayId, accountName }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'บันทึกไม่สำเร็จ');
        return;
      }

      setPayoutInfo(data.payoutInfo);
      toast.success('บันทึกข้อมูล PromptPay สำเร็จ');
    } catch {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  const formatPromptpay = (id: string) =>
    id.length === 10
      ? id.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
      : id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push('/organizer')}
            className="text-gray-600"
          >
            <FiArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">ตั้งค่า PromptPay</h1>
            <p className="text-xs text-gray-500">สำหรับรับโอนเงินค่าลงทะเบียนจากผู้เข้าร่วม</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Status Card */}
        {payoutInfo ? (
          <Card className="border-none shadow-sm bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-full">
                  <FiCheckCircle className="text-green-500" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{payoutInfo.accountName}</p>
                  <p className="text-gray-600 text-sm font-mono">{formatPromptpay(payoutInfo.promptpayId)}</p>
                  <p className="text-gray-400 text-xs">
                    {payoutInfo.promptpayId.length === 10 ? 'เบอร์โทรศัพท์' : 'เลขบัตรประชาชน'}
                  </p>
                </div>
              </div>
              <Chip size="sm" color="success" variant="flat">ลงทะเบียนแล้ว</Chip>
            </div>
          </Card>
        ) : (
          <Card className="border-none shadow-sm bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <FiSmartphone className="text-gray-400" size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-sm">ยังไม่มีข้อมูล PromptPay</p>
                <p className="text-gray-500 text-xs">กรอกข้อมูลด้านล่างเพื่อรับโอนเงินจากผู้สมัคร</p>
              </div>
            </div>
          </Card>
        )}

        {/* Info Banner */}
        <Card className="border-none shadow-sm bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-blue-500 mt-0.5 shrink-0" size={16} />
            <p className="text-blue-700 text-xs leading-relaxed">
              ผู้สมัครจะโอนเงินตรงมาหา PromptPay ของคุณ ระบบจะสร้าง QR Code ให้อัตโนมัติ และตรวจสอบสลิปด้วย API ของ RDCW
            </p>
          </div>
        </Card>

        {/* Form Card */}
        <Card className="border-none shadow-sm bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <FiSmartphone size={16} />
            ข้อมูล PromptPay
          </h2>

          <Input
            label="PromptPay ID"
            placeholder="เบอร์โทร 10 หลัก หรือ เลขบัตรประชาชน 13 หลัก"
            value={promptpayId}
            onValueChange={(v) => setPromptpayId(v.replace(/\D/g, '').slice(0, 13))}
            description={
              promptpayId.length === 10
                ? 'เบอร์โทรศัพท์'
                : promptpayId.length === 13
                ? 'เลขบัตรประชาชน'
                : 'กรอกเบอร์โทร 10 หลัก หรือเลขบัตรประชาชน 13 หลัก'
            }
            classNames={{ inputWrapper: 'bg-gray-50 border-none' }}
            maxLength={13}
          />

          <Input
            label="ชื่อบัญชี (ชื่อ-นามสกุล)"
            placeholder="ชื่อที่ผูกกับ PromptPay"
            value={accountName}
            onValueChange={setAccountName}
            classNames={{ inputWrapper: 'bg-gray-50 border-none' }}
          />

          <Button
            className="w-full bg-[#F2B33D] text-white font-semibold"
            onPress={handleSubmit}
            isLoading={saving}
            startContent={!saving && <FiSave size={16} />}
          >
            บันทึกข้อมูล
          </Button>
        </Card>
      </div>
    </div>
  );
}
