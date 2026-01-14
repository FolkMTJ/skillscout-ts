// src/app/(tab)/path-finder/results/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button, Progress, Spinner, Chip } from '@heroui/react';
import { FiArrowLeft, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { PathFinderResultWithDetails } from '@/types';
import { RIASEC_TYPES } from '@/data/riasec';
import { FaArrowRight, FaLightbulb, FaStar } from 'react-icons/fa';
import CampCard from '@/components/(card)/CampCard';
import { Camp } from '@/types/camp';

export default function PathFinderResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [result, setResult] = useState<PathFinderResultWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedCamps, setRecommendedCamps] = useState<any[]>([]);
  const [campsLoading, setCampsLoading] = useState(false);

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
        // Fetch recommended camps
        if (data.result?.topRIASECCodes) {
          fetchRecommendedCamps(data.result.topRIASECCodes);
        }
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

  const fetchRecommendedCamps = async (topCodes: string[]) => {
    try {
      setCampsLoading(true);
      const res = await fetch('/api/camps');
      if (res.ok) {
        const camps: Camp[] = await res.json();

        // Filter camps based on RIASEC match
        const matchingCamps = camps
          .filter(camp => (camp.enrolled || 0) < (camp.capacity || camp.participantCount || 0))
          .slice(0, 4)
          .map(camp => ({
            id: camp._id,
            name: camp.name,
            image: camp.image,
            date: camp.date,
            location: camp.location,
            price: camp.price,
            deadline: camp.deadline,
            daysLeft: calculateDaysLeft(camp),
            description: camp.description,
            category: camp.category,
            avgRating: camp.avgRating,
            reviews: camp.reviews,
            capacity: camp.capacity || camp.participantCount,
            enrolled: camp.enrolled || 0
          }));

        setRecommendedCamps(matchingCamps);
      }
    } catch (error) {
      console.error('Error fetching camps:', error);
    } finally {
      setCampsLoading(false);
    }
  };

  const calculateDaysLeft = (camp: Camp) => {
    if (!camp.deadline) return 0;
    try {
      const deadlineDate = camp.registrationDeadline
        ? new Date(camp.registrationDeadline)
        : new Date(camp.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadlineDate.setHours(0, 0, 0, 0);
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 0;
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
    <div className="min-h-screen bg-white py-12">
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
              {sortedRIASEC.map(({ code, score, info }, index) => {
                // 2 อันดับแรก = สีเหลือง + ใหญ่, อันดับอื่น = สีเทา + เล็ก
                const isTopTwo = index < 2;

                return (
                  <div key={code}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`${isTopTwo
                            ? 'w-14 h-14 bg-[#F2B33D] text-white'
                            : 'w-10 h-10 bg-gray-300 text-gray-600'
                            } rounded-full flex items-center justify-center font-bold transition-all`}
                        >
                          {code}
                        </div>
                        <div>
                          <p className={`font-semibold ${isTopTwo ? 'text-lg' : 'text-base text-gray-600'
                            }`}>
                            {info.thaiName}
                          </p>
                          <p className={`text-sm ${isTopTwo ? 'text-gray-600' : 'text-gray-500'
                            }`}>
                            {info.name}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold ${isTopTwo ? 'text-xl text-[#F2B33D]' : 'text-base text-gray-500'
                        }`}>
                        {score}%
                      </span>
                    </div>
                    <Progress
                      value={score}
                      color={isTopTwo ? "warning" : "default"}
                      className={isTopTwo ? 'h-3' : 'h-2'}
                      classNames={{
                        indicator: isTopTwo ? '' : 'bg-gray-300'
                      }}
                    />
                    {isTopTwo && (
                      <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                    )}
                  </div>
                );
              })}
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


        {/* Recommended Careers Section */}
        {result.recommendedCareerDetails && result.recommendedCareerDetails.length > 0 && (
          <div className="w-full mb-12">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#F2B33D]/10">
                  <FaStar className="text-[#F2B33D] text-xl" />
                </div>
                <h2 className="text-2xl font-black text-[#2C2C2C] dark:text-white">
                  อาชีพที่แนะนำ
                </h2>

              </div>
              <Button
                size="lg"
                color="warning"
                endContent={<FiArrowRight className="w-5 h-5" />}
                onClick={() => router.push('/path-finder/careers')}
              >
                เลือกดูอาชีพทั้งหมด
              </Button>
              {/* Optional: Add 'See All' if needed later */}
            </div>

            {/* Grid Layout - ใช้ items-stretch เพื่อให้การ์ดสูงเท่ากัน */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {result.recommendedCareerDetails.map((career: any) => (
                <Card
                  key={career.id}
                  isPressable
                  onPress={() => router.push(`/path-finder/careers/${career.id}`)}
                  className="group relative w-full h-full bg-white dark:bg-[#2C2C2C] border border-gray-100 dark:border-gray-700 hover:border-[#F2B33D] shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <CardBody className="p-5 flex flex-col h-full">

                    {/* 1. Header: Icon & Name (ส่วนสำคัญที่สุดอยู่บน) */}
                    <div className="flex items-start gap-4 mb-3">
                      {/* Decorative Icon Box */}
                      <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 text-[#F2B33D]">
                        {/* ถ้ามี icon ใน data ให้ใช้ career.icon ถ้าไม่มีใช้ icon กลาง */}
                        <FaLightbulb size={20} />
                      </div>

                      <div className="flex-1 min-w-0"> {/* min-w-0 ช่วยแก้ text overflow */}
                        <h3 className="text-lg font-bold text-[#2C2C2C] dark:text-white group-hover:text-[#F2B33D] transition-colors truncate">
                          {career.nameTh}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide truncate">
                          {career.name}
                        </p>
                      </div>
                    </div>

                    {/* 2. Middle: Personality (เนื้อหาตรงกลาง) */}
                    <div className="mb-6 pl-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                        <span className="text-[#F2B33D] mr-2">●</span>
                        {career.personality}
                      </p>
                    </div>

                    {/* 3. Footer: Tags & Action (ใช้ mt-auto ดันไปล่างสุดเสมอ) */}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">

                      {/* RIASEC Tags (Clean Look) */}
                      <div className="flex gap-1.5">
                        {career.riasecCodes?.slice(0, 3).map((code: string) => ( // โชว์แค่ 3 ตัวแรกกันล้น
                          <span
                            key={code}
                            className="inline-flex items-center justify-center w-6 h-6 text-[10px] font-bold rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-[#F2B33D] group-hover:text-white transition-colors"
                          >
                            {code}
                          </span>
                        ))}
                      </div>

                      {/* Arrow Button */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#F2B33D] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        ดูรายละเอียด <FaArrowRight />
                      </div>

                    </div>

                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Camps */}
        {recommendedCamps.length > 0 && (
          <Card className="mb-8 shadow-lg">
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">ค่ายแนะนำสำหรับคุณ</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    ค่ายที่เหมาะสมกับบุคลิกภาพและความถนัดของคุณ
                  </p>
                </div>
                <Button
                  variant="flat"
                  color="warning"
                  size="sm"
                  onClick={() => router.push('/allcamps')}
                >
                  ดูทั้งหมด
                </Button>
              </div>

              {campsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner color="warning" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {recommendedCamps.map((camp) => (
                    <CampCard key={camp.id} camp={camp} variant="compact" />
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}


      </div>
    </div>
  );
}
