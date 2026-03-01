// src/app/(tab)/path-finder/results/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button, Progress, Spinner, Chip } from '@heroui/react';
import { FiArrowRight, FiChevronDown, FiChevronUp, FiBriefcase, FiTrendingUp } from 'react-icons/fi';
import { FaArrowRight, FaLightbulb, FaStar } from 'react-icons/fa';
import ShareResultButton from '@/components/common/ShareResultButton';
import HeroBanner from '@/components/HeroBanner';
import { PathFinderResultWithDetails } from '@/types';
import { RIASEC_TYPES } from '@/data/riasec';
import CampCard from '@/components/(card)/CampCard';
import { Camp } from '@/types/camp';

interface CareerDetails {
  id: string;
  name: string;
  nameTh: string;
  description: string;
  personality: string;
  riasecCodes?: string[];
  requiredTags: string[];
  recommendedTags: string[];
  roadmapSteps: {
    level: 'beginner' | 'intermediate' | 'advanced';
    title: string;
    description: string;
    requiredSkills: string[];
    duration?: string;
  }[];
  averageSalary?: string;
  demandLevel?: 'high' | 'medium' | 'low';
}

export default function PathFinderResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [result, setResult] = useState<PathFinderResultWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedCamps, setRecommendedCamps] = useState<Camp[]>([]);
  const [campsLoading, setCampsLoading] = useState(false);
  const [showAllRIASEC, setShowAllRIASEC] = useState(false);

  const fetchRecommendedCamps = useCallback(async () => {
    try {
      setCampsLoading(true);
      const res = await fetch('/api/path-finder/recommended-camps');
      if (res.ok) {
        const data = await res.json();
        const camps: Camp[] = (data.recommendedCamps || []).map((c: Camp) => ({
          ...c,
          _id: c._id || (c as Camp & { id?: string }).id || '',
        }));
        setRecommendedCamps(camps.slice(0, 6));
      } else {
        const fallback = await fetch('/api/camps');
        if (fallback.ok) {
          const allCamps: Camp[] = await fallback.json();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const matchingCamps = allCamps
            .filter(camp => {
              const notFull = (camp.enrolled || 0) < (camp.capacity || camp.participantCount || 999);
              const deadlineDate = camp.registrationDeadline
                ? new Date(camp.registrationDeadline)
                : camp.deadline ? new Date(camp.deadline) : null;
              const stillOpen = !deadlineDate || deadlineDate >= today;
              return notFull && stillOpen;
            })
            .slice(0, 6);
          setRecommendedCamps(matchingCamps);
        }
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
        <HeroBanner
          badge="Quiz Completed"
          title="YOUR"
          titleHighlight="RESULTS"
          subtitle="ผลลัพธ์การทดสอบความถนัด"
          description="กำลังโหลดผลลัพธ์ของคุณ..."
          showButtons={false}
        />
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="animate-pulse space-y-12">
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
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
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const sortedRIASEC = Object.entries(result.riasecScores)
    .sort(([, a], [, b]) => b - a)
    .map(([code, score]) => ({
      code: code as keyof typeof RIASEC_TYPES,
      score,
      info: RIASEC_TYPES[code as keyof typeof RIASEC_TYPES],
    }));

  const totalScore = sortedRIASEC.reduce((sum, item) => sum + item.score, 0);

  const normalizedRIASEC = sortedRIASEC.map(item => ({
    ...item,
    percentage: totalScore > 0 ? Math.round((item.score / totalScore) * 100) : 0,
  }));

  return (
    <div className="min-h-screen bg-white">
      <HeroBanner
        badge="Quiz Completed"
        title="YOUR"
        titleHighlight="RESULTS"
        subtitle="ผลลัพธ์การทดสอบความถนัด"
        description={`วิเคราะห์จากคำตอบ ${result.answers.length} ข้อ • พร้อมแนะนำเส้นทางอาชีพที่เหมาะกับคุณ`}
        showButtons={false}
      >
        <div className="flex flex-row flex-wrap gap-3 items-center">
          <Button
            size="lg"
            className="bg-[#2C2C2C] text-white font-black px-8 rounded-2xl h-14 text-base hover:bg-black transition-all"
            onPress={() => router.push('/path-finder/quiz')}
          >
            ทำแบบทดสอบอีกครั้ง
          </Button>
          <ShareResultButton
            result={result}
            filename={`skillscout-pathfinder-${result?.topRIASECCodes?.join('') ?? 'result'}`}
            title="ผลลัพธ์ Path Finder - SkillScout"
            userName={session?.user?.name ?? undefined}
          />
        </div>
      </HeroBanner>

      <div className="container mx-auto px-4 max-w-8xl py-12">

        {/* ── RIASEC + Personality Summary (unified card) ── */}
        <Card className="mb-8 overflow-hidden shadow-sm border border-gray-100">
          {/* Dark header */}
          <div className="bg-[#2C2C2C] px-5 py-4 md:px-8 md:py-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#F2B33D] uppercase tracking-widest mb-0.5">RIASEC Profile</p>
              <h2 className="text-base md:text-lg font-black text-white">บุคลิกภาพของคุณ</h2>
            </div>
            <div className="flex gap-2">
              {result.topRIASECCodes.map((code) => (
                <div key={code} className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#F2B33D] text-[#2C2C2C] flex items-center justify-center font-black text-base md:text-lg">
                  {code}
                </div>
              ))}
            </div>
          </div>

          {/* Top 2 personality rows */}
          <CardBody className="p-0">
            {normalizedRIASEC.slice(0, 2).map(({ code, percentage, info }, idx) => (
              <div key={code} className={`px-5 py-4 md:px-8 md:py-5 ${idx === 0 ? '' : 'border-t border-gray-100'}`}>
                <div className="flex items-start gap-3 md:gap-4 mb-2.5">
                  {/* Code badge */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#F2B33D]/15 flex items-center justify-center font-black text-[#F2B33D] text-sm">
                    {code}
                  </div>
                  {/* Name + percentage */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <div>
                        <span className="font-bold text-gray-900 text-sm md:text-base">{info.thaiName}</span>
                        <span className="ml-2 text-xs text-gray-400">{info.name}</span>
                      </div>
                      <span className="font-black text-[#F2B33D] text-lg md:text-xl flex-shrink-0">{percentage}%</span>
                    </div>
                    <Progress value={percentage} color="warning" className="h-2 mb-1.5" />
                    <p className="text-xs text-gray-500 leading-relaxed">{info.description}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Expandable: ที่เหลือ */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showAllRIASEC ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="border-t border-gray-100 divide-y divide-gray-50">
                {normalizedRIASEC.slice(2).map(({ code, percentage, info }, index) => (
                  <div key={code} className="px-5 py-3 md:px-8 flex items-center gap-3" style={{ animationDelay: `${index * 60}ms` }}>
                    <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-xs">
                      {code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm text-gray-500">{info.thaiName}</span>
                        <span className="text-sm font-semibold text-gray-400 flex-shrink-0">{percentage}%</span>
                      </div>
                      <Progress value={percentage} color="default" className="h-1.5" classNames={{ indicator: 'bg-gray-300' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Toggle */}
            <button
              onClick={() => setShowAllRIASEC(!showAllRIASEC)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[#F2B33D] transition-colors py-3 border-t border-gray-100"
            >
              {showAllRIASEC ? 'ซ่อน' : 'ดูคะแนนทั้งหมด'}
              {showAllRIASEC ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
            </button>
          </CardBody>
        </Card>

        {/* Recommended Careers */}
        {result.recommendedCareerDetails && result.recommendedCareerDetails.length > 0 && (
          <div className="w-full mb-12">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 rounded-lg bg-[#F2B33D]/10">
                  <FaStar className="text-[#F2B33D] text-base md:text-xl" />
                </div>
                <h2 className="text-lg md:text-2xl font-black text-[#2C2C2C]">อาชีพที่แนะนำ</h2>
              </div>
              <Button size="sm" className="md:hidden bg-[#F2B33D] font-medium" endContent={<FiArrowRight className="w-4 h-4" />} onPress={() => router.push('/path-finder/careers')}>
                ดูอาชีพทั้งหมด
              </Button>
              <Button size="lg" className="hidden md:flex bg-[#F2B33D] font-medium" endContent={<FiArrowRight className="w-5 h-5" />} onPress={() => router.push('/path-finder/careers')}>
                ดูอาชีพทั้งหมด
              </Button>
            </div>

            <div className="space-y-6">
              {result.recommendedCareerDetails.map((career: CareerDetails, index: number) => (
                <Card
                  key={career.id}
                  className="overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
                >
                  {/* Top accent bar */}
                  <div className={`h-1 w-full ${index === 0 ? 'bg-[#F2B33D]' : 'bg-gray-200'}`} />

                  <CardBody className="p-0">
                    {/* Header */}
                    <div className="p-5 md:p-6 border-b border-gray-100">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#F2B33D] flex-shrink-0">
                            <FaLightbulb size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xl font-bold text-[#2C2C2C]">{career.nameTh}</h3>
                              {index === 0 && (
                                <Chip size="sm" className="bg-[#F2B33D] text-white text-[11px] font-bold h-5">แนะนำ #1</Chip>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 font-medium">{career.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {career.riasecCodes?.map((code: string) => (
                            <span
                              key={code}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 font-bold text-gray-600 text-xs"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Salary + Demand row */}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {career.averageSalary && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <FiBriefcase className="text-[#F2B33D]" size={13} />
                            {career.averageSalary}
                          </div>
                        )}
                        {career.demandLevel && (
                          <div className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg ${career.demandLevel === 'high' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
                            <FiTrendingUp size={13} />
                            {career.demandLevel === 'high' ? 'ต้องการสูงมาก' : career.demandLevel === 'medium' ? 'ต้องการปานกลาง' : 'ทั่วไป'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 md:p-6 space-y-5">
                      {/* Description */}
                      <p className="text-gray-700 leading-relaxed">{career.description}</p>

                      {/* Personality */}
                      <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                        <p className="text-[11px] font-bold text-[#F2B33D] mb-1.5 uppercase tracking-wide">บุคลิกภาพที่เหมาะสม</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{career.personality}</p>
                      </div>

                      {/* Tags */}
                      {(career.requiredTags?.length > 0 || career.recommendedTags?.length > 0) && (
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">ทักษะที่เกี่ยวข้อง</p>
                          <div className="flex flex-wrap gap-1.5">
                            {career.requiredTags?.map((tag: string) => (
                              <Chip key={tag} size="sm" className="bg-gray-100 text-gray-700 text-xs h-6">{tag}</Chip>
                            ))}
                            {career.recommendedTags?.map((tag: string) => (
                              <Chip key={tag} size="sm" variant="bordered" className="text-gray-400 border-gray-200 text-xs h-6">{tag}</Chip>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Roadmap */}
                      {career.roadmapSteps?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">เส้นทางการเติบโต</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {career.roadmapSteps.map((step, i) => (
                              <div key={step.level} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="w-5 h-5 rounded-full bg-[#F2B33D] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                    {i + 1}
                                  </span>
                                  <p className="font-semibold text-gray-800 text-sm leading-tight">{step.title}</p>
                                </div>
                                {step.duration && (
                                  <p className="text-xs text-gray-400 mb-2">{step.duration}</p>
                                )}
                                <div className="space-y-1.5">
                                  {step.requiredSkills.slice(0, 3).map((skill) => (
                                    <div key={skill} className="flex items-center gap-1.5 text-xs text-gray-600">
                                      <span className="w-1 h-1 rounded-full bg-[#F2B33D] flex-shrink-0" />
                                      {skill}
                                    </div>
                                  ))}
                                  {step.requiredSkills.length > 3 && (
                                    <p className="text-xs text-gray-400">+{step.requiredSkills.length - 3} เพิ่มเติม</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer link */}
                    <div className="px-5 md:px-6 pb-5 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => router.push(`/path-finder/careers/${career.id}`)}
                        className="flex items-center gap-2 text-sm font-semibold text-[#F2B33D] hover:text-[#d69a2e] transition-colors"
                      >
                        ดูรายละเอียดเพิ่มเติมและค่ายแนะนำ <FaArrowRight size={12} />
                      </button>
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
            <CardBody className="p-4 md:p-8">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                  <h2 className="text-lg md:text-2xl font-bold">ค่ายแนะนำสำหรับคุณ</h2>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">ค่ายที่เหมาะสมกับบุคลิกภาพและความถนัดของคุณ</p>
                </div>
                <Button size="sm" className="md:hidden bg-[#F2B33D] font-medium" endContent={<FiArrowRight className="w-4 h-4" />} onPress={() => router.push('/allcamps')}>
                  ดูค่ายทั้งหมด
                </Button>
                <Button size="lg" className="hidden md:flex bg-[#F2B33D] font-medium" endContent={<FiArrowRight className="w-5 h-5" />} onPress={() => router.push('/allcamps')}>
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
                        enrolled: camp.enrolled || 0,
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
