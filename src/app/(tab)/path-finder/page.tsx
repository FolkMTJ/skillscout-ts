// src/app/(tab)/path-finder/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button, Spinner } from '@heroui/react';
import { FiCompass, FiArrowRight, FiTarget } from 'react-icons/fi';

export default function PathFinderLandingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [hasResult] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkExistingResult = useCallback(async () => {
    try {
      const res = await fetch('/api/path-finder/results');
      if (res.ok) {
        // ถ้าเคยทำ quiz แล้ว ให้ redirect ไป results เลย
        router.push('/path-finder/results');
        return;
      }
    } catch (error) {
      console.error('Error checking results:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === 'authenticated') {
      checkExistingResult();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, checkExistingResult]);

  const handleStartTest = () => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    router.push('/path-finder/quiz');
  };

  const handleViewResults = () => {
    router.push('/path-finder/results');
  };

  const handleBrowseCareers = () => {
    router.push('/path-finder/careers');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
        {/* Hero Section - แสดงจริง */}
        <div className="relative bg-[#F2B33D] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
                <FiCompass className="w-5 h-5 text-white" />
                <span className="text-white font-medium">PATH FINDER</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                ค้นพบความถนัดของคุณ
              </h1>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                ด้วย Holland Codes
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
                แบบทดสอบความถนัดในอาชีพสายไอที
                <br />
                กำลังตรวจสอบข้อมูล...
              </p>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 max-w-xl mx-auto">
                <p className="text-white text-sm mb-2">
                  แบบทดสอบนี้ใช้ทฤษฎี RIASEC (Holland Codes) ซึ่งเป็นทฤษฎีที่ใช้กันอย่างแพร่หลายในการประเมินบุคลิกภาพและแนะนำอาชีพ 
                  โดยจะวิเคราะห์ความถนัดของคุณใน 6 ด้าน และแนะนำเส้นทางอาชีพที่เหมาะสม
                  พร้อมค่ายที่ควรเข้าร่วมตั้งแต่ระดับเริ่มต้นจนถึงขั้นสูง
                </p>
              </div>

              {/* Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-pulse">
                <div className="h-14 bg-white/30 rounded-xl w-48 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Cards Skeleton */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA Button Skeleton */}
          <div className="text-center mt-16 animate-pulse">
            <div className="h-12 bg-gray-200 rounded-xl w-64 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Hero Section */}
      <div className="relative bg-[#F2B33D] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <FiCompass className="w-5 h-5 text-white" />
              <span className="text-white font-medium">PATH FINDER</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              ค้นพบความถนัดของคุณ
            </h1>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              ด้วย Holland Codes
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              แบบทดสอบความถนัดในอาชีพสายไอที
              <br />
              แนะนำอาชีพที่เหมาะสมกับบุคลิกภาพและความสนใจของคุณ
            </p>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 max-w-xl mx-auto">
              <p className="text-white text-sm mb-2">
                แบบทดสอบนี้ใช้ทฤษฎี RIASEC (Holland Codes) ซึ่งเป็นทฤษฎีที่ใช้กันอย่างแพร่หลายในการประเมินบุคลิกภาพและแนะนำอาชีพ 
                โดยจะวิเคราะห์ความถนัดของคุณใน 6 ด้าน และแนะนำเส้นทางอาชีพที่เหมาะสม
                พร้อมค่ายที่ควรเข้าร่วมตั้งแต่ระดับเริ่มต้นจนถึงขั้นสูง
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hasResult ? (
                <>
                  <Button
                    size="lg"
                    color="warning"
                    className="bg-white text-[#F2B33D] font-semibold shadow-lg"
                    endContent={<FiArrowRight className="w-5 h-5" />}
                    onClick={handleViewResults}
                  >
                    ดูผลลัพธ์ของคุณ
                  </Button>
                  <Button
                    size="lg"
                    variant="bordered"
                    className="border-white text-white font-semibold"
                    onClick={handleStartTest}
                  >
                    ทำแบบทดสอบใหม่
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  color="warning"
                  className="bg-white text-[#F2B33D] font-semibold shadow-lg px-12"
                  endContent={<FiArrowRight className="w-5 h-5" />}
                  onClick={handleStartTest}
                >
                  ทำแบบทดสอบ
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardBody className="p-8 text-center">
              <div className="w-16 h-16 bg-[#F2B33D] rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTarget className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">แม่นยำด้วย RIASEC</h3>
              <p className="text-gray-600">
                ใช้ทฤษฎีที่ได้รับการยอมรับระดับสากลในการวิเคราะห์บุคลิกภาพและความถนัดในอาชีพ
              </p>
            </CardBody>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardBody className="p-8 text-center">
              <div className="w-16 h-16 bg-[#F2B33D] rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCompass className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">เส้นทางชัดเจน</h3>
              <p className="text-gray-600">
                แนะนำเส้นทางการเรียนรู้ตั้งแต่ระดับเริ่มต้นจนถึงขั้นสูง พร้อมค่ายที่เหมาะสม
              </p>
            </CardBody>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardBody className="p-8 text-center">
              <div className="w-16 h-16 bg-[#F2B33D] rounded-full flex items-center justify-center mx-auto mb-4">
                <FiArrowRight className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">ค่ายที่เหมาะสม</h3>
              <p className="text-gray-600">
                แนะนำค่ายที่ตรงกับความถนัดและเป้าหมายอาชีพของคุณ
              </p>
            </CardBody>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button
            size="lg"
            variant="bordered"
            className="font-semibold"
            onClick={handleBrowseCareers}
          >
            เลือกค้นหาเส้นทางอาชีพตัวเอง
          </Button>
        </div>
      </div>
    </div>
  );
}
