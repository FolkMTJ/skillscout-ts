'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Chip, Divider } from '@heroui/react';
import { FiTrendingUp, FiTarget, FiBook, FiAward, FiArrowRight } from 'react-icons/fi';
import ShareResultButton from '@/components/common/ShareResultButton';
import HeroBanner from '@/components/HeroBanner';
import SkillPieChart from '@/components/discovery/SkillPieChart';
import RIASECProfile from '@/components/discovery/RIASECProfile';
import CareerCard from '@/components/discovery/CareerCard';
import CampCard from '@/components/(card)/CampCard';
import { Review } from '@/types/camp';

interface DiscoveryData {
  campsAttended: number;
  skillProfile: {
    name: string;
    experienceCount: number;
    percentage: number;
    level: 'novice' | 'intermediate' | 'experienced' | 'expert';
  }[];
  riasecProfile: {
    R: number;
    I: number;
    A: number;
    S: number;
    E: number;
    C: number;
  };
  recommendedCareers: {
    id: string;
    name: string;
    matchScore: number;
    description: string;
    salary: string;
    requiredSkills: string[];
    growthOutlook: string;
  }[];
  recommendedCamps: {
    id: string;
    name: string;
    reason: string;
    image: string;
  }[];
}

interface ApiCampData {
  _id: string;
  name: string;
  image: string;
  date: string;
  location: string;
  price: string;
  deadline: string;
  registrationDeadline?: string;
  description: string;
  category: string;
  avgRating: number;
  reviews: Review[];
  capacity?: number;
  participantCount?: number;
  enrolled?: number;
}

interface CampData {
  id: string;
  name: string;
  image: string;
  date: string;
  location: string;
  price: string;
  deadline: string;
  daysLeft: number;
  registrationDeadline?: string;
  description: string;
  category: string;
  avgRating: number;
  reviews: Review[];
  capacity?: number;
  participantCount?: number;
  enrolled?: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  colorClass: string;
}

export default function DiscoveryPathPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DiscoveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedCampsData, setRecommendedCampsData] = useState<CampData[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const fetchRecommendedCamps = useCallback(async (campIds: { id: string }[]) => {
    try {
      const campsRes = await fetch('/api/camps');
      if (campsRes.ok) {
        const allCamps = await campsRes.json() as ApiCampData[];

        const recommended = allCamps
          .filter((camp) => campIds.some(c => c.id === camp._id))
          .slice(0, 4)
          .map((camp): CampData => {
            const calculateDaysLeft = () => {
              if (!camp.deadline && !camp.registrationDeadline) return 0;
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

            return {
              id: camp._id,
              name: camp.name,
              image: camp.image,
              date: camp.date,
              location: camp.location,
              price: camp.price,
              deadline: camp.deadline,
              daysLeft: calculateDaysLeft(),
              registrationDeadline: camp.registrationDeadline,
              description: camp.description,
              category: camp.category,
              avgRating: camp.avgRating,
              reviews: camp.reviews,
              capacity: camp.capacity || camp.participantCount,
              enrolled: camp.enrolled || 0
            };
          });
        setRecommendedCampsData(recommended);
      }
    } catch (error) {
      console.error('Error fetching recommended camps:', error);
    }
  }, []);


  const fetchDiscoveryData = useCallback(async () => {
    try {
      const res = await fetch('/api/discovery/profile');
      if (res.ok) {
        const result = await res.json();
        console.log('Discovery data:', result);
        setData(result);

        if (result.recommendedCamps && result.recommendedCamps.length > 0) {
          fetchRecommendedCamps(result.recommendedCamps);
        }
      } else {
        console.error('Failed to fetch:', res.status, await res.text());
      }
    } catch (error) {
      console.error('Error fetching discovery data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchRecommendedCamps]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchDiscoveryData();
    }
  }, [status, router, fetchDiscoveryData]);

  const ModernStatCard = ({ title, value, icon: Icon, colorClass }: StatCardProps) => {
    // Map สีเพื่อให้ icon ชัดเจน
    const iconColorMap: Record<string, string> = {
      'bg-[#F2B33D]': 'text-[#F2B33D]',
      'bg-green-500': 'text-green-600',
      'bg-purple-500': 'text-purple-600',
      'bg-orange-500': 'text-orange-600',
    };
    
    const iconColor = iconColorMap[colorClass] || colorClass.replace('bg-', 'text-');
    
    return (
      <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white">
        <div className="p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
          </div>
          <div className="p-3 rounded-xl">
            <Icon className={`w-10 h-10 ${iconColor}`} />
          </div>
        </div>
        <div className={`h-1 w-full bg-opacity-20 ${colorClass}`}>
          <div className={`h-full ${colorClass} w-[70%]`}></div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-50 to-transparent -z-10" />
        
        {/* Hero Banner - แสดงจริง */}
        <HeroBanner
          badge="Find your Path"
          title="DISCOVERY"
          titleHighlight="PATH"
          subtitle="เส้นทางอาชีพของคุณ"
          description="กำลังวิเคราะห์ข้อมูลของคุณ..."
          showButtons={false}
        />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>

            {/* Content Skeleton */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-64 mb-6"></div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.campsAttended === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Banner */}
        <HeroBanner
          badge="Find your Path"
          title="DISCOVERY"
          titleHighlight="PATH"
          subtitle="เส้นทางอาชีพของคุณ"
          description="วิเคราะห์จากค่ายที่เข้าร่วมจริง • เริ่มได้เลยสมัครค่ายแรกของคุณ"
          showButtons={false}
        />

        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Main Card - neobrutalism style */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden">
            
            {/* Top accent bar */}
            <div className="bg-[#F2B33D] h-2 w-full" />

            <div className="p-10 md:p-14">
              {/* Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
                <div className="bg-[#F2B33D] border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                  <FiTarget className="w-10 h-10 text-black" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-[#2C2C2C] mb-2">
                    ยังไม่มีข้อมูลเพียงพอ
                  </h1>
                  <p className="text-gray-600 text-lg">
                    คุณต้องเข้าร่วมค่ายที่{' '}
                    <span className="inline-flex items-center bg-green-100 text-green-700 font-bold px-3 py-0.5 border-2 border-green-700 text-sm">
                      Check-in แล้ว
                    </span>{' '}
                    อย่างน้อย <strong>1 ค่าย</strong> เพื่อเริ่มวิเคราะห์
                  </p>
                </div>
              </div>

              {/* Steps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {[
                  { step: '01', title: 'สมัครค่ายและชำระเงิน', desc: 'เลือกค่ายที่สนใจและดำเนินการชำระเงิน', icon: FiBook },
                  { step: '02', title: 'อัปโหลดสลิปโอนเงิน', desc: 'แนบหลักฐานการชำระเงินเพื่อยืนยัน', icon: FiTarget },
                  { step: '03', title: 'รอผู้จัดค่ายอนุมัติ', desc: 'ผู้จัดค่ายจะตรวจสอบและยืนยันการสมัคร', icon: FiAward },
                  { step: '04', title: 'Check-in ด้วย QR Code', desc: 'เข้าร่วมค่ายและ Check-in เพื่อรับข้อมูล', icon: FiArrowRight },
                ].map(({ step, title, desc, icon: Icon }) => (
                  <div key={step} className="flex items-start gap-4 p-4 border-2 border-black bg-gray-50 hover:bg-[#FFF9ED] transition-colors">
                    <div className="bg-black text-white font-black text-sm px-2 py-1 flex-shrink-0 min-w-[36px] text-center">
                      {step}
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon className="text-[#F2B33D] mt-0.5 flex-shrink-0" size={16} />
                      <div>
                        <p className="font-bold text-[#2C2C2C] text-sm">{title}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-amber-50 border-2 border-[#F2B33D] mb-8">
                <FiTrendingUp className="text-[#F2B33D] flex-shrink-0" size={20} />
                <p className="text-sm text-gray-700">
                  ตรวจสอบสถานะได้ที่เมนู{' '}
                  <button
                    onClick={() => router.push('/my-camps')}
                    className="font-black text-[#2C2C2C] underline underline-offset-2 hover:text-[#F2B33D] transition-colors"
                  >
                    ค่ายของฉัน
                  </button>{' '}
                  เมื่อค่ายอนุมัติแล้ว Discovery Path จะพร้อมใช้งาน
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/allcamps')}
                  className="flex-1 bg-[#F2B33D] text-black font-black py-4 px-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  ค้นหาค่ายที่น่าสนใจ
                  <FiArrowRight />
                </button>
                <button
                  onClick={() => router.push('/path-finder')}
                  className="flex-1 bg-white text-black font-black py-4 px-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  ลองทำ Path Finder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-50 to-transparent -z-10" />

      {/* Hero Banner */}
      <HeroBanner
        badge="Find your Path"
        title="DISCOVERY"
        titleHighlight="PATH"
        subtitle="เส้นทางอาชีพของคุณ"
        description={`วิเคราะห์จากค่ายที่คุณเข้าร่วมจริง • ข้อมูลจาก ${data.campsAttended} ค่าย`}
        showButtons={false}
      >
        <Button
            size="lg"
            className="bg-[#2C2C2C] text-white font-black px-8 rounded-2xl h-14 text-base hover:bg-black transition-all"
            onPress={() => router.push('/path-finder/quiz')}
          >
            ค่ายอื่นๆที่น่าสนใจ
        </Button>
        <ShareResultButton
          targetRef={resultRef}
          filename="skillscout-discovery-path"
          title="Discovery Path - SkillScout"
        />
      </HeroBanner>

      <div ref={resultRef} className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Stats Grid - Modern Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ModernStatCard
            title="ค่ายที่เข้าร่วม"
            value={data.campsAttended}
            icon={FiBook}
            colorClass="bg-[#F2B33D]"
          />
          <ModernStatCard
            title="ทักษะที่ได้"
            value={data.skillProfile.length}
            icon={FiTarget}
            colorClass="bg-green-500"
          />
          <ModernStatCard
            title="อาชีพที่แนะนำ"
            value={data.recommendedCareers.length}
            icon={FiTrendingUp}
            colorClass="bg-purple-500"
          />
          <ModernStatCard
            title="Match สูงสุด"
            value={`${data.recommendedCareers[0]?.matchScore || 0}%`}
            icon={FiAward}
            colorClass="bg-orange-500"
          />
        </div>

        {/* RIASEC Profile */}
        <Card className="mb-8 shadow-sm border-none">
          <CardHeader className="flex flex-col items-start gap-2 p-8 pb-4">
            <Chip className="bg-purple-100 text-purple-600" variant="flat" size="sm">
              บุคลิกภาพ
            </Chip>
            <h2 className="text-2xl font-bold text-gray-800">RIASEC Personality Profile</h2>
            <p className="text-gray-600 text-sm">
              บุคลิกภาพและความชอบในการทำงานของคุณ (วิเคราะห์จากค่ายที่เข้าร่วม)
            </p>
          </CardHeader>
          <Divider />
          <CardBody className="p-8 pt-6">
            <RIASECProfile scores={data.riasecProfile} />
          </CardBody>
        </Card>

        {/* Skill Profile */}
        <Card className="mb-8 shadow-sm border-none">
          <CardHeader className="flex flex-col items-start gap-2 p-8 pb-4">
            <Chip className="bg-orange-100 text-[#F2B33D]" variant="flat" size="sm">
              ทักษะ
            </Chip>
            <h2 className="text-2xl font-bold text-gray-800">สัดส่วนประสบการณ์ของคุณ</h2>
            <p className="text-gray-600 text-sm">
              แสดงสัดส่วนทักษะจากค่ายทั้งหมดที่เข้าร่วม (ไม่ใช่การวัดความเก่งจริง)
            </p>
          </CardHeader>
          <Divider />
          <CardBody className="p-8 pt-6">
            <SkillPieChart skills={data.skillProfile} />
          </CardBody>
        </Card>

        {/* Career Recommendations */}
        <div className="mb-8">
          <div className="mb-6">
            <Chip className="bg-green-100 text-green-600 mb-3" variant="flat" size="sm">
              แนะนำอาชีพ
            </Chip>
            <h2 className="text-2xl font-bold text-gray-800">อาชีพที่เหมาะกับคุณ</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.recommendedCareers.map((career, index) => (
              <CareerCard
                key={career.id}
                career={career}
                rank={index + 1}
              />
            ))}
          </div>
        </div>

        {/* Recommended Camps */}
        {recommendedCampsData.length > 0 && (
          <div className="mb-8">
            <div className="mb-6">
              <Chip className="bg-orange-100 text-[#F2B33D] mb-3" variant="flat" size="sm">
                ค่ายแนะนำ
              </Chip>
              <h2 className="text-2xl font-bold text-gray-800">ค่ายที่แนะนำเพื่อพัฒนาตัวเอง</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedCampsData.map((camp) => (
                <CampCard key={camp.id} camp={camp} variant="compact" />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}