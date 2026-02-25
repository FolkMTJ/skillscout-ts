'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Chip, Divider } from '@heroui/react';
import { FiTrendingUp, FiTarget, FiBook, FiAward, FiArrowRight, FiShare2 } from 'react-icons/fi';
import ShareDiscoveryModal from '@/components/common/ShareDiscoveryModal';
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DiscoveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedCampsData, setRecommendedCampsData] = useState<CampData[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

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
      <div className="min-h-screen bg-[#F8F9FA]">
        <HeroBanner
          badge="Find your Path"
          title="DISCOVERY"
          titleHighlight="PATH"
          subtitle="เส้นทางอาชีพของคุณ"
          description="วิเคราะห์จากค่ายที่เข้าร่วมจริง • เริ่มได้เลยสมัครค่ายแรกของคุณ"
          showButtons={false}
        />

        <div className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#F2B33D] to-orange-400" />

            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF3D0] flex items-center justify-center flex-shrink-0">
                  <FiTarget className="w-7 h-7 text-[#F2B33D]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2C2C2C]">ยังไม่มีข้อมูลเพียงพอ</h2>
                  <p className="text-gray-500 mt-0.5 text-sm">
                    เข้าร่วมค่ายที่{' '}
                    <span className="inline-flex items-center bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-md text-xs border border-green-200">
                      Check-in แล้ว
                    </span>{' '}
                    อย่างน้อย <strong>1 ค่าย</strong> เพื่อเริ่มวิเคราะห์
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[
                  { step: '01', title: 'สมัครค่ายและชำระเงิน', desc: 'เลือกค่ายที่สนใจและดำเนินการชำระเงิน', icon: FiBook, color: 'bg-blue-50 text-blue-500' },
                  { step: '02', title: 'อัปโหลดสลิปโอนเงิน', desc: 'แนบหลักฐานการชำระเงินเพื่อยืนยัน', icon: FiTarget, color: 'bg-purple-50 text-purple-500' },
                  { step: '03', title: 'รอผู้จัดค่ายอนุมัติ', desc: 'ผู้จัดค่ายจะตรวจสอบและยืนยันการสมัคร', icon: FiAward, color: 'bg-orange-50 text-orange-500' },
                  { step: '04', title: 'Check-in ด้วย QR Code', desc: 'เข้าร่วมค่ายและ Check-in เพื่อรับข้อมูล', icon: FiArrowRight, color: 'bg-green-50 text-green-500' },
                ].map(({ step, title, desc, icon: Icon, color }) => (
                  <div key={step} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-[#FFFBF0] transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-[#F2B33D]">{step}</span>
                        <p className="font-semibold text-[#2C2C2C] text-sm">{title}</p>
                      </div>
                      <p className="text-gray-400 text-xs">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info note */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-8">
                <FiTrendingUp className="text-[#F2B33D] flex-shrink-0 mt-0.5" size={16} />
                <p className="text-sm text-gray-600">
                  ตรวจสอบสถานะได้ที่เมนู{' '}
                  <button
                    onClick={() => router.push('/my-camps')}
                    className="font-bold text-[#F2B33D] hover:underline transition-colors"
                  >
                    ค่ายของฉัน
                  </button>{' '}
                  เมื่อค่ายอนุมัติแล้ว Discovery Path จะพร้อมใช้งาน
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/allcamps')}
                  className="flex-1 bg-[#F2B33D] hover:bg-[#e0a530] text-white font-bold py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md"
                >
                  ค้นหาค่ายที่น่าสนใจ
                  <FiArrowRight />
                </button>
                <button
                  onClick={() => router.push('/path-finder')}
                  className="flex-1 bg-white hover:bg-gray-50 text-[#2C2C2C] font-bold py-3.5 px-6 rounded-2xl border border-gray-200 transition-all flex items-center justify-center gap-2 text-sm"
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
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-50 to-transparent -z-10" />

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
        <Button
          size="lg"
          className="bg-[#F2B33D] text-[#1a1a1a] font-black px-8 rounded-2xl h-14 text-base hover:bg-[#d69a2e] transition-all"
          onPress={() => setShareModalOpen(true)}
          startContent={<FiShare2 className="w-5 h-5" />}
        >
          แชร์ผลลัพธ์
        </Button>
        <ShareDiscoveryModal
          data={{
            riasecProfile: data.riasecProfile,
            recommendedCareers: data.recommendedCareers,
          }}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          userName={session?.user?.name ?? undefined}
        />
      </HeroBanner>

      <div ref={resultRef} className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Stats Grid */}
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
