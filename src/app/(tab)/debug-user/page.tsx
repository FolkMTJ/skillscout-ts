'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, Button } from '@heroui/react';
import { FiRefreshCw, FiUser } from 'react-icons/fi';

interface UserData {
  session: {
    userId: string;
    email: string;
    name: string;
    role: string;
  };
  user: {
    _id: string;
    email: string;
    name: string;
    role: string;
  } | null;
  registrations: {
    totalInSystem: number;
    myRegistrations: number;
    myRegistrationsByEmail: number;
    myRegistrationsByStringId: number;
    details: {
      byObjectId: unknown[];
      byEmail: unknown[];
    };
  };
  payments: {
    total: number;
    details: unknown[];
  };
  debug: unknown;
}

export default function DebugUserPage() {
  const { status } = useSession();
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/debug/check-user');
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                <FiUser />
                Debug: User Information
              </h1>
              <p className="text-gray-600">ข้อมูลผู้ใช้และการสมัครค่าย</p>
            </div>
            <Button
              color="primary"
              startContent={<FiRefreshCw />}
              onPress={fetchData}
            >
              Refresh
            </Button>
          </div>

          {/* Session Info */}
          <Card className="p-6 mb-6 border-2 border-blue-400">
            <h2 className="text-2xl font-black mb-4 text-blue-800">Session Info</h2>
            <div className="space-y-2 font-mono text-sm">
              <p><strong>User ID:</strong> {data.session.userId}</p>
              <p><strong>Email:</strong> {data.session.email}</p>
              <p><strong>Name:</strong> {data.session.name}</p>
              <p><strong>Role:</strong> {data.session.role}</p>
            </div>
          </Card>

          {/* User from DB */}
          <Card className="p-6 mb-6 border-2 border-green-400">
            <h2 className="text-2xl font-black mb-4 text-green-800">User from Database</h2>
            {data.user ? (
              <div className="space-y-2 font-mono text-sm">
                <p><strong>_id:</strong> {data.user._id}</p>
                <p><strong>Email:</strong> {data.user.email}</p>
                <p><strong>Name:</strong> {data.user.name}</p>
                <p><strong>Role:</strong> {data.user.role}</p>
              </div>
            ) : (
              <p className="text-red-600">❌ User not found in database!</p>
            )}
          </Card>

          {/* Registrations Summary */}
          <Card className="p-6 mb-6 border-2 border-orange-400">
            <h2 className="text-2xl font-black mb-4 text-orange-800">Registrations</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-600">Total in System</p>
                <p className="text-3xl font-black">{data.registrations.totalInSystem}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded">
                <p className="text-sm text-gray-600">By ObjectId</p>
                <p className="text-3xl font-black text-blue-600">{data.registrations.myRegistrations}</p>
              </div>
              <div className="bg-green-100 p-4 rounded">
                <p className="text-sm text-gray-600">By Email</p>
                <p className="text-3xl font-black text-green-600">{data.registrations.myRegistrationsByEmail}</p>
              </div>
              <div className="bg-purple-100 p-4 rounded">
                <p className="text-sm text-gray-600">By String ID</p>
                <p className="text-3xl font-black text-purple-600">{data.registrations.myRegistrationsByStringId}</p>
              </div>
            </div>

            {/* Details */}
            {data.registrations.details.byObjectId.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold mb-2">Found by ObjectId:</h3>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(data.registrations.details.byObjectId, null, 2)}
                </pre>
              </div>
            )}

            {data.registrations.details.byEmail.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold mb-2">Found by Email:</h3>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(data.registrations.details.byEmail, null, 2)}
                </pre>
              </div>
            )}

            {data.registrations.totalInSystem === 0 && (
              <div className="bg-red-100 border-2 border-red-400 p-4 rounded">
                <p className="text-red-800 font-bold">⚠️ ไม่มี registration ใดๆ ในระบบเลย!</p>
                <p className="text-sm text-red-700 mt-2">
                  กรุณาลองสมัครค่ายดูครับ เพื่อทดสอบว่าระบบบันทึกข้อมูลได้หรือไม่
                </p>
              </div>
            )}
          </Card>

          {/* Payments */}
          <Card className="p-6 mb-6 border-2 border-purple-400">
            <h2 className="text-2xl font-black mb-4 text-purple-800">Payments</h2>
            <p className="text-lg mb-4">Total: <strong>{data.payments.total}</strong></p>
            {data.payments.total > 0 && (
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(data.payments.details, null, 2)}
              </pre>
            )}
          </Card>

          {/* Debug Info */}
          <Card className="p-6 border-2 border-gray-400">
            <h2 className="text-2xl font-black mb-4">Debug Info</h2>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(data.debug, null, 2)}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
}
