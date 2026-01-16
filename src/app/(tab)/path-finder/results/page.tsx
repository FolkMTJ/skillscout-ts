// src/app/(tab)/path-finder/results/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button, Progress, Spinner, Chip } from '@heroui/react';
import { FiArrowRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import HeroBanner from '@/components/HeroBanner';
import { PathFinderResultWithDetails } from '@/types';
import { RIASEC_TYPES } from '@/data/riasec';
import { FaArrowRight, FaLightbulb, FaStar } from 'react-icons/fa';
import CampCard from '@/components/(card)/CampCard';
import { Camp } from '@/types/camp';

interface CareerDetails {
  id: string;
  name: string;
  nameTh: string;
  personality: string;
  riasecCodes?: string[];
}

export default function PathFinderResultsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [result, setResult] = useState<PathFinderResultWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedCamps, setRecommendedCamps] = useState<Camp[]>([]);
  const [campsLoading, setCampsLoading] = useState(false);
  const [showAllRIASEC, setShowAllRIASEC] = useState(false); // State สำหรับแสดง/ซ่อน RIASEC

  const fetchRecommendedCamps = useCallback(async () => {
    try {
      setCampsLoading(true);
      const res = await fetch('/api/camps');
      if (res.ok) {
        const camps: Camp[] = await res.json();

        // Filter camps based on availability
        const matchingCamps = camps
          .filter(camp => (camp.enrolled || 0) < (camp.capacity || camp.participantCount || 0))
          .slice(0, 4);

        setRecommendedCamps(matchingCamps);
      }
    } catch (error) {
      console.error('Error fetching camps:', error);
    } finally {
      setCampsLoading(false);
    }
  }, []);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch('/api/path-finder/results');
      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
        // Fetch recommended camps
        if (data.result?.topRIASECCodes) {
          fetchRecommendedCamps();
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
  }, [router, fetchRecommendedCamps]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchResults();
    }
  }, [status, router, fetchResults]);

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
      <div className="min-h-screen bg-white">
        {/* Hero Banner - แสดงจริงเลย */}
        <HeroBanner
          badge="Quiz Completed"
          title="YOUR"
          titleHighlight="RESULTS"
          subtitle="ผลลัพธ์การทดสอบความถนัด"
          description="กำลังโหลดผลลัพธ์ของคุณ..."
          showButtons={false}
        />

        {/* Content Skeleton */}
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="animate-pulse space-y-12">
            {/* RIASEC Scores Section */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
              
              {/* Top 2 RIASEC Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 rounded-full w-full mt-4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Remaining RIASEC Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Careers Section */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-80 mb-6"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex gap-1.5">
                        <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
                        <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
                        <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Camps Section */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-72 mb-6"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      </div>
                      <div className="flex justify-between items-center pt-4">
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                        <div className="h-10 bg-gray-200 rounded-xl w-28"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <HeroBanner
        badge="Quiz Completed"
        title="YOUR"
        titleHighlight="RESULTS"
        subtitle="ผลลัพธ์การทดสอบความถนัด"
        description={`วิเคราะห์จากคำตอบ ${result.answers.length} ข้อ • พร้อมแนะนำเส้นทางอาชีพที่เหมาะกับคุณ`}
        showButtons={false}
      >
        {/* Custom Buttons in Banner */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Button
            size="lg"
            className="bg-[#2C2C2C] text-white font-black px-10 rounded-2xl h-16 text-lg shadow-2xl hover:bg-black transition-all group"
            onPress={() => router.push('/path-finder/quiz')}
          >
            ทำแบบทดสอบอีกครั้ง
          </Button>

          <Button
            variant="light"
            size="lg"
            className="text-[#2C2C2C] font-black text-lg group h-16"
            onPress={() => router.push('/path-finder/careers')}
            endContent={<FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
          >
            ดูอาชีพทั้งหมด
          </Button>
        </div>
      </HeroBanner>

      <div className="container mx-auto px-4 max-w-8xl py-12">

        {/* RIASEC Scores */}
        <Card className="mb-8 shadow-lg">
          <CardBody className="p-8">
            <h2 className="text-2xl font-bold mb-6">คะแนนบุคลิกภาพของคุณ (RIASEC)</h2>

            <div className="space-y-4">
              {/* 2 อันดับแรก - แสดงตลอด */}
              {sortedRIASEC.slice(0, 2).map(({ code, score, info }) => (
                <div key={code} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-[#F2B33D] text-white rounded-full flex items-center justify-center font-bold transition-all">
                        {code}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{info.thaiName}</p>
                        <p className="text-sm text-gray-600">{info.name}</p>
                      </div>
                    </div>
                    <span className="font-bold text-xl text-[#F2B33D]">{score}%</span>
                  </div>
                  <Progress
                    value={score}
                    color="warning"
                    className="h-3"
                  />
                  <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                </div>
              ))}

              {/* อันดับ 3-6 - แสดงเมื่อเปิด */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${showAllRIASEC ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="space-y-4 pt-4">
                  {sortedRIASEC.slice(2).map(({ code, score, info }, index) => (
                    <div
                      key={code}
                      className="rounded-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold transition-all">
                            {code}
                          </div>
                          <div>
                            <p className="font-semibold text-base text-gray-600">{info.thaiName}</p>
                            <p className="text-sm text-gray-500">{info.name}</p>
                          </div>
                        </div>
                        <span className="font-bold text-base text-gray-500">{score}%</span>
                      </div>
                      <Progress
                        value={score}
                        color="default"
                        className="h-2"
                        classNames={{ indicator: 'bg-gray-300' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* แตะเพื่อแสดง/ซ่อน */}
            <div
              onClick={() => setShowAllRIASEC(!showAllRIASEC)}
              className="mt-6 pt-6 border-t border-gray-200 cursor-pointer group transition-all duration-300"
            >
              <div className="flex items-center justify-center gap-2 text-[#F2B33D] font-semibold hover:text-[#d69a2e] transition-colors">
                <span>{showAllRIASEC ? 'แตะเพื่อซ่อน' : 'แตะเพื่อเปิดดูคะแนนทั้งหมด'}</span>
                {showAllRIASEC ? (
                  <FiChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
                ) : (
                  <FiChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
                )}
              </div>
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
                className='bg-[#F2B33D] font-medium'
                endContent={<FiArrowRight className="w-5 h-5" />}
                onPress={() => router.push('/path-finder/careers')}
              >
                ดูอาชีพทั้งหมด
              </Button>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {result.recommendedCareerDetails.map((career: CareerDetails) => (
                <Card
                  key={career.id}
                  isPressable
                  onPress={() => router.push(`/path-finder/careers/${career.id}`)}
                  className="group relative w-full h-full bg-white dark:bg-[#2C2C2C] border border-gray-100 dark:border-gray-700 hover:border-[#F2B33D] shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <CardBody className="p-5 flex flex-col h-full">

                    {/* Header: Icon & Name */}
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 text-[#F2B33D]">
                        <FaLightbulb size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-[#2C2C2C] dark:text-white group-hover:text-[#F2B33D] transition-colors truncate">
                          {career.nameTh}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide truncate">
                          {career.name}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Personality */}
                    <div className="mb-6 pl-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                        <span className="text-[#F2B33D] mr-2">●</span>
                        {career.personality}
                      </p>
                    </div>

                    {/* Footer: Tags & Action */}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">

                      {/* RIASEC Tags */}
                      <div className="flex gap-1.5">
                        {career.riasecCodes?.slice(0, 3).map((code: string) => (
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
                  size="lg"
                  className='bg-[#F2B33D] font-medium'
                  endContent={<FiArrowRight className="w-5 h-5" />}
                  onPress={() => router.push('/allcamps')}
                >
                  ดูค่ายทั้งหมด
                </Button>
              </div>

              {campsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner color="warning" />
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {recommendedCamps.map((camp) => (
                    <CampCard
                      key={camp._id}
                      camp={{
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
                      }}
                      variant="compact"
                    />
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
