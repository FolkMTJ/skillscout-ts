'use client';

import { useState } from 'react';
import { Card, Button } from '@heroui/react';
import { FiTag, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CampUpdate {
  campName: string;
  tagsAdded: string[];
}

interface ResultData {
  message: string;
  updated: CampUpdate[];
  instructions: string[];
}

export default function DebugTagsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);

  const handleAddTags = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/debug/add-camp-tags', {
        method: 'POST'
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        toast.success(`อัปเดต ${data.updated.length} ค่าย!`);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-4 flex items-center justify-center gap-3">
              <FiTag className="text-purple-500" />
              เพิ่ม Tags ให้ค่าย
            </h1>
            <p className="text-gray-600">
              เพิ่ม tags อัตโนมัติให้ค่ายที่ยังไม่มี tags
            </p>
          </div>

          {/* Warning */}
          <Card className="p-6 mb-6 bg-yellow-100 border-2 border-yellow-400">
            <h2 className="text-xl font-bold text-yellow-900 mb-3">⚠️ คำเตือน</h2>
            <p className="text-sm text-yellow-800">
              Tool นี้จะเพิ่ม tags ให้กับค่ายที่ยังไม่มี tags โดยอัตโนมัติ
              <br />
              Tags จะถูกเลือกตามชื่อค่าย
            </p>
          </Card>

          {/* Action Button */}
          {!result && (
            <Card className="p-8 border-2 border-black text-center">
              <p className="text-lg mb-6 text-gray-700">
                กดปุ่มด้านล่างเพื่อเพิ่ม tags ให้ค่ายที่ยังไม่มี tags
              </p>
              <Button
                size="lg"
                color="secondary"
                className="font-bold text-lg px-8"
                startContent={<FiTag />}
                onPress={handleAddTags}
                isLoading={loading}
              >
                เพิ่ม Tags อัตโนมัติ
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

                {/* Updated Camps */}
                {result.updated && result.updated.length > 0 && (
                  <div className="bg-white p-4 rounded border-2 border-green-300 mb-4">
                    <h3 className="font-bold mb-3 text-green-900">📋 ค่ายที่อัปเดต:</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {result.updated.map((camp, i) => (
                        <div key={i} className="border-b border-green-200 pb-3 last:border-0">
                          <p className="font-semibold text-gray-900">{camp.campName}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {camp.tagsAdded.map((tag, j) => (
                              <span
                                key={j}
                                className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-100 p-4 rounded border-2 border-blue-300 mb-4">
                  <h3 className="font-bold mb-3 text-blue-900">📝 ขั้นตอนต่อไป:</h3>
                  <ol className="space-y-1 text-sm text-blue-800 list-decimal list-inside">
                    {result.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    size="lg"
                    color="primary"
                    className="flex-1 font-bold"
                    onPress={() => window.location.href = '/discovery'}
                  >
                    ไปดู Discovery Path
                  </Button>
                  <Button
                    size="lg"
                    color="secondary"
                    variant="flat"
                    className="flex-1 font-bold"
                    onPress={() => window.open('/api/debug/camp-tags', '_blank')}
                  >
                    เช็ค Tags
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
