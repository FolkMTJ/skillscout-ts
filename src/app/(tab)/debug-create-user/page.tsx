'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, Button } from '@heroui/react';
import { FiCheckCircle, FiZap, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ResultData {
  message: string;
  registrations: {
    created: number;
    details: Array<{ campName: string; status: string }>;
  };
  nextSteps: string[];
}

export default function CreateTestUserPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);

  const isOrganizer = session?.user?.role === 'organizer' || session?.user?.role === 'admin';
  const isUser = session?.user?.role === 'user';

  const handleAddRegistrations = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/debug/add-registrations', {
        method: 'POST'
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        toast.success(`สร้างสำเร็จ! ${data.registrations.created} ค่าย`);
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-4 flex items-center justify-center gap-3">
              <FiZap className="text-yellow-500" />
              ทดสอบ Discovery Path
            </h1>
            <p className="text-gray-600">
              เพิ่ม registrations ให้ user ปัจจุบัน
            </p>
          </div>

          {/* Current User Info */}
          {session && (
            <Card className="p-4 mb-6 border-2 border-blue-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current User:</p>
                  <p className="font-bold">{session.user.email}</p>
                  <p className="text-sm">Role: <span className="font-bold text-blue-600">{session.user.role}</span></p>
                </div>
                {!isUser && (
                  <FiAlertCircle className="text-red-500 text-3xl" />
                )}
              </div>
            </Card>
          )}

          {/* Warning for Organizer */}
          {isOrganizer && (
            <Card className="p-6 mb-6 bg-red-100 border-2 border-red-400">
              <h2 className="text-xl font-bold text-red-900 mb-3">⚠️ คุณเป็น {session?.user.role}!</h2>
              <p className="text-sm text-red-800 mb-4">
                Discovery Path <strong>ใช้ได้เฉพาะ role = user</strong> เท่านั้น
              </p>
              <p className="text-sm text-red-700 mb-4">
                กรุณา <strong>สร้าง User account ใหม่</strong> ผ่านหน้า Register แทน:
              </p>
              <Button
                color="primary"
                size="sm"
                onPress={() => router.push('/register')}
              >
                ไปหน้า Register
              </Button>
            </Card>
          )}

          {/* Action Button for User */}
          {isUser && !result && (
            <Card className="p-8 border-2 border-black text-center">
              <p className="text-lg mb-6 text-gray-700">
                กดปุ่มด้านล่างเพื่อเพิ่ม registrations ที่ confirmed แล้ว
              </p>
              <Button
                size="lg"
                color="warning"
                className="font-bold text-lg px-8"
                startContent={<FiZap />}
                onPress={handleAddRegistrations}
                isLoading={loading}
              >
                เพิ่ม Registrations
              </Button>
            </Card>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-6">
              <Card className="p-6 border-2 border-green-500 bg-green-50">
                <div className="flex items-start gap-3 mb-4">
                  <FiCheckCircle className="text-green-600 text-3xl flex-shrink-0" />
                  <div>
                    <h2 className="text-2xl font-black text-green-900 mb-2">
                      สำเร็จ!
                    </h2>
                    <p className="text-green-800">
                      {result.message}
                    </p>
                  </div>
                </div>

                {/* Registrations */}
                <div className="bg-white p-4 rounded border-2 border-green-300 mb-4">
                  <h3 className="font-bold mb-3 text-green-900">Registrations:</h3>
                  <p className="mb-2">สร้าง/อัปเดต <strong>{result.registrations.created}</strong> รายการ</p>
                  {result.registrations.details.length > 0 && (
                    <ul className="space-y-1 text-sm">
                      {result.registrations.details.map((reg, i) => (
                        <li key={i} className="text-gray-700">
                          • {reg.campName} ({reg.status})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Next Steps */}
                <div className="bg-blue-100 p-4 rounded border-2 border-blue-300 mb-4">
                  <h3 className="font-bold mb-3 text-blue-900">📝 ขั้นตอนต่อไป:</h3>
                  <ol className="space-y-1 text-sm text-blue-800 list-decimal list-inside">
                    {result.nextSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    size="lg"
                    color="primary"
                    className="flex-1 font-bold"
                    onPress={() => router.push('/discovery')}
                  >
                    ไปดู Discovery Path
                  </Button>
                  <Button
                    size="lg"
                    color="secondary"
                    variant="flat"
                    className="flex-1 font-bold"
                    onPress={() => router.push('/debug-registrations')}
                  >
                    ตรวจสอบ Registrations
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Debug Raw Data */}
          {result && (
            <Card className="p-6 border-2 border-gray-400">
              <h3 className="font-bold mb-3">Raw Data:</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
