// src/app/(tab)/path-finder/results/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button, Progress, Spinner, Chip } from '@heroui/react';
import { FiArrowLeft, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { PathFinderResultWithDetails } from '@/types';
import { RIASEC_TYPES } from '@/data/riasec';

export default function PathFinderResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [result, setResult] = useState<PathFinderResultWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchResults();
    }
  }, [status, router]);

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/path-finder/results');
      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
      } else {
        router.push('/path-finder');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      router.push('/path-finder');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="warning" />
      </div>
    );
  }

  if (!result) {
    return null;
  }

  // เรียงคะแนน RIASEC จากมากไปน้อย
  const sortedRIASEC = Object.entries(result.riasecScores)
    .sort(([, a], [, b]) => b - a)
    .map(([code, score]) => ({
      code: code as keyof typeof RIASEC_TYPES,
      score,
      info: RIASEC_TYPES[code as keyof typeof RIASEC_TYPES],
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="light"
            startContent={<FiArrowLeft className="w-5 h-5" />}
            onClick={() => router.push('/path-finder')}
            className="mb-4"
          >
            กลับ
          </Button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-100 px-6 py-3 rounded-full mb-4">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-600 font-medium">ทำแบบทดสอบเสร็จสิ้น</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              ผลลัพธ์การทดสอบความถนัด
            </h1>
            <p className="text-gray-600">
              วิเคราะห์จากคำตอบ {result.answers.length} ข้อ
            </p>
          </div>
        </div>

        {/* RIASEC Scores */}
        <Card className="mb-8 shadow-lg">
          <CardBody className="p-8">
            <h2 className="text-2xl font-bold mb-6">คะแนนบุคลิกภาพของคุณ (RIASEC)</h2>
            
            <div className="space-y-4">
              {sortedRIASEC.map(({ code, score, info }) => (
                <div key={code}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#F2B33D] rounded-full flex items-center justify-center font-bold text-white">
                        {code}
                      </div>
                      <div>
                        <p className="font-semibold">{info.thaiName}</p>
                        <p className="text-sm text-gray-600">{info.name}</p>
                      </div>
                    </div>
                    <span className="font-bold text-lg">{score}%</span>
                  </div>
                  <Progress
                    value={score}
                    color="warning"
                    className="h-3"
                  />
                  <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Top RIASEC Codes */}
        <Card className="mb-8 shadow-lg">
          <CardBody className="p-8">
            <h2 className="text-2xl font-bold mb-4">บุคลิกภาพเด่นของคุณ</h2>
            <div className="flex flex-wrap gap-3">
              {result.topRIASECCodes.map((code) => {
                const info = RIASEC_TYPES[code];
                return (
                  <Chip
                    key={code}
                    size="lg"
                    className="bg-[#F2B33D] text-white font-semibold px-6 py-6"
                  >
                    {code} - {info.thaiName}
                  </Chip>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Recommended Careers */}
        {result.recommendedCareerDetails && result.recommendedCareerDetails.length > 0 && (
          <Card className="mb-8 shadow-lg">
            <CardBody className="p-8">
              <h2 className="text-2xl font-bold mb-6">อาชีพที่แนะนำสำหรับคุณ</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {result.recommendedCareerDetails.map((career) => (
                  <Card key={career.id} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardBody className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold">{career.nameTh}</h3>
                        <div className="flex gap-1">
                          {career.riasecCodes.map((code) => (
                            <div
                              key={code}
                              className="w-8 h-8 bg-[#F2B33D] rounded-full flex items-center justify-center text-xs font-bold text-white"
                            >
                              {code}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{career.name}</p>
                      
                      <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-gray-700">{career.personality}</p>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{career.description}</p>
                      
                      <Button
                        size="sm"
                        color="warning"
                        variant="flat"
                        endContent={<FiArrowRight className="w-4 h-4" />}
                        onClick={() => router.push(`/path-finder/careers/${career.id}`)}
                      >
                        ดูเส้นทางการเรียนรู้
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            color="warning"
            endContent={<FiArrowRight className="w-5 h-5" />}
            onClick={() => router.push('/path-finder/careers')}
          >
            เลือกดูอาชีพทั้งหมด
          </Button>
          
          <Button
            size="lg"
            variant="bordered"
            onClick={() => router.push('/path-finder/quiz')}
          >
            ทำแบบทดสอบใหม่
          </Button>
        </div>
      </div>
    </div>
  );
}
