'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Chip, Divider } from '@heroui/react';
import { FiTrendingUp, FiTarget, FiBook, FiAward, FiArrowRight } from 'react-icons/fi';
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
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-50 to-transparent -z-10" />
        
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="border-none shadow-lg">
              <CardBody className="text-center p-12">
                <div className="mb-6">
                  <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <FiTarget className="w-12 h-12 text-[#F2B33D]" />
                  </div>
                  <h1 className="text-3xl font-bold mb-3">ยังไม่มีข้อมูลเพียงพอ</h1>
                  <p className="text-lg text-gray-600 mb-6">
                    คุณต้องเข้าร่วมค่ายที่{' '}
                    <Chip className="bg-green-100 text-green-600" size="sm" variant="flat">
                      Check-in แล้ว
                    </Chip>{' '}
                    อย่างน้อย 1 ค่าย
                  </p>
                </div>

                <Card className="bg-orange-50 mb-6 border-none">
                  <CardBody>
                    <p className="font-semibold text-[#2C2C2C] mb-3">💡 ขั้นตอนการเข้าร่วมค่าย:</p>
                    <ol className="list-decimal list-inside space-y-2 text-left text-gray-700">
                      <li>สมัครค่ายและชำระเงิน</li>
                      <li>อัปโหลดสลิปโอนเงิน</li>
                      <li>รอผู้จัดค่ายตรวจสอบและอนุมัติ</li>
                      <li>เข้าร่วมค่ายและ Check-in ด้วย QR Code</li>
                    </ol>
                    <Divider className="my-3" />
                    <p className="text-sm text-gray-600">
                      ตรวจสอบสถานะได้ที่เมนู <strong>ค่ายของฉัน</strong>
                    </p>
                  </CardBody>
                </Card>

                <Button
                  size="lg"
                  className="bg-[#F2B33D] text-white font-bold shadow-lg"
                  endContent={<FiArrowRight />}
                  onPress={() => router.push('/allcamps')}
                >
                  ค้นหาค่ายที่น่าสนใจ
                </Button>
              </CardBody>
            </Card>
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
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">

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