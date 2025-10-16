"use client";

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardBody, Spinner } from '@heroui/react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaTicketAlt } from 'react-icons/fa';

interface TicketData {
  success: boolean;
  alreadyCheckedIn?: boolean;
  message?: string;
  registration?: {
    userName: string;
    campName: string;
    campDate: string;
    campLocation: string;
    checkedInAt: string;
    status?: string;
  };
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TicketData | null>(null);

  const verifyTicket = useCallback(async () => {
    try {
      const response = await fetch(`/api/ticket/verify?id=${registrationId}`);
      const data: TicketData = await response.json();
      setResult(data);
    } catch {
      setResult({
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบ'
      });
    } finally {
      setLoading(false);
    }
  }, [registrationId]);

  useEffect(() => {
    if (registrationId) {
      verifyTicket();
    } else {
      setLoading(false);
    }
  }, [registrationId, verifyTicket]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardBody className="text-center py-12">
            <Spinner size="lg" color="warning" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">กำลังตรวจสอบ...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!registrationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-red-300">
          <CardBody className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
              <FaTimesCircle className="text-red-500 text-4xl" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
              ไม่พบข้อมูลบัตร
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              กรุณาสแกน QR Code จากบัตรเข้าค่าย
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Success - Checked in
  if (result?.success && !result?.alreadyCheckedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-4 border-green-500">
          <CardBody className="text-center py-12">
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <FaCheckCircle className="text-green-500 text-5xl" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
              ✓ เช็คอินสำเร็จ!
            </h2>
            <p className="text-xl font-bold text-green-600 dark:text-green-400 mb-6">
              ยินดีต้อนรับ {result.registration?.userName}
            </p>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 space-y-3 text-left">
              <div className="flex items-center gap-3">
                <FaTicketAlt className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ค่าย</p>
                  <p className="font-bold text-gray-900 dark:text-white">{result.registration?.campName}</p>
                </div>
              </div>
              <div className="border-t border-green-200 dark:border-green-800 my-3"></div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">วันที่</p>
                <p className="font-semibold text-gray-900 dark:text-white">{result.registration?.campDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">สถานที่</p>
                <p className="font-semibold text-gray-900 dark:text-white">{result.registration?.campLocation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">เวลาเช็คอิน</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {result.registration?.checkedInAt && new Date(result.registration.checkedInAt).toLocaleString('th-TH')}
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
              ขอให้สนุกกับกิจกรรม! 
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Already checked in
  if (result?.alreadyCheckedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-4 border-yellow-500">
          <CardBody className="text-center py-12">
            <div className="w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-6">
              <FaExclamationTriangle className="text-yellow-500 text-5xl" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
              เช็คอินแล้ว
            </h2>
            <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-6">
              {result.registration?.userName}
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 space-y-3 text-left">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ค่าย</p>
                <p className="font-bold text-gray-900 dark:text-white">{result.registration?.campName}</p>
              </div>
              <div className="border-t border-yellow-200 dark:border-yellow-800 my-3"></div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">เช็คอินเมื่อ</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {result.registration?.checkedInAt && new Date(result.registration.checkedInAt).toLocaleString('th-TH')}
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              คุณได้เช็คอินไปแล้วก่อนหน้านี้
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Error or Not approved
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-red-300">
        <CardBody className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <FaTimesCircle className="text-red-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
            ไม่สามารถเช็คอินได้
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {result?.message || 'เกิดข้อผิดพลาด'}
          </p>
          
          {result?.registration && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400">ชื่อ</p>
              <p className="font-bold text-gray-900 dark:text-white mb-2">
                {result.registration.userName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">สถานะ</p>
              <p className="font-semibold text-red-600 dark:text-red-400">
                {result.registration.status}
              </p>
            </div>
          )}

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            กรุณาติดต่อเจ้าหน้าที่
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardBody className="text-center py-12">
            <Spinner size="lg" color="warning" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">กำลังโหลด...</p>
          </CardBody>
        </Card>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
