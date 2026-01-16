'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Chip, Spinner, Divider } from '@heroui/react';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardBody className="text-center py-12">
            <Spinner size="lg" color="warning" className="mb-4" />
            <p className="text-lg font-semibold text-gray-700">กำลังวิเคราะห์ข้อมูลของคุณ...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!data || data.campsAttended === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardBody className="text-center p-12">
                <div className="mb-6">
                  <div className="w-24 h-24 rounded-full bg-warning-100 flex items-center justify-center mx-auto mb-4">
                    <FiTarget className="w-12 h-12 text-warning-600" />
                  </div>
                  <h1 className="text-3xl font-bold mb-3">ยังไม่มีข้อมูลเพียงพอ</h1>
                  <p className="text-lg text-gray-600 mb-6">
                    คุณต้องเข้าร่วมค่ายที่{' '}
                    <Chip color="success" size="sm" variant="flat">
                      Check-in แล้ว
                    </Chip>{' '}
                    อย่างน้อย 1 ค่าย
                  </p>
                </div>

                <Card className="bg-warning-50 mb-6">
                  <CardBody>
                    <p className="font-semibold text-warning-900 mb-3">💡 ขั้นตอนการเข้าร่วมค่าย:</p>
                    <ol className="list-decimal list-inside space-y-2 text-left text-gray-700">
                      <li>สมัครค่ายและชำระเงิน</li>
                      <li>อัปโหลดสลิปโอนเงิน</li>
                      <li>รอผู้จัดค่ายตรวจสอบและอนุมัติ</li>
                      <li>เข้าร่วมค่ายและ Check-in ด้วย QR Code</li>
                    </ol>
                    <Divider className="my-3" />
                    <p className="text-sm text-gray-600">
                      ตรวจสอบสถานะได้ที่เมนู <strong> ค่ายของฉัน </strong>
                    </p>
                  </CardBody>
                </Card>

                <Button
                  size="lg"
                  color="warning"
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
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <HeroBanner
        badge="Find your Path"
        title="DISCOVERY"
        titleHighlight="PATH"
        subtitle="เส้นทางอาชีพของคุณ"
        description={`วิเคราะห์จากค่ายที่คุณเข้าร่วมจริง • ข้อมูลจาก ${data.campsAttended} ค่าย`}
        showButtons={false}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2 border-blue-500 bg-white">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-blue-600 mb-2">ค่ายที่เข้าร่วม</div>
                    <div className="text-3xl font-bold text-blue-700">{data.campsAttended}</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <FiBook className="text-2xl text-blue-500" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border-2 border-green-500 bg-white">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-green-600 mb-2">ทักษะที่ได้</div>
                    <div className="text-3xl font-bold text-green-700">{data.skillProfile.length}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <FiTarget className="text-2xl text-green-500" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border-2 border-purple-500 bg-white">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-purple-600 mb-2">อาชีพที่แนะนำ</div>
                    <div className="text-3xl font-bold text-purple-700">{data.recommendedCareers.length}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <FiTrendingUp className="text-2xl text-purple-500" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border-2 border-orange-500 bg-white">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-orange-600 mb-2">Match สูงสุด</div>
                    <div className="text-3xl font-bold text-orange-700">
                      {data.recommendedCareers[0]?.matchScore || 0}%
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <FiAward className="text-2xl text-orange-500" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* RIASEC Profile */}
          <Card>
            <CardHeader className="flex flex-col items-start gap-2 pb-4">
              <Chip color="secondary" variant="flat" size="sm">
                บุคลิกภาพ
              </Chip>
              <h2 className="text-2xl font-bold">RIASEC Personality Profile</h2>
              <p className="text-gray-600 text-sm">
                บุคลิกภาพและความชอบในการทำงานของคุณ (วิเคราะห์จากค่ายที่เข้าร่วม)
              </p>
            </CardHeader>
            <Divider />
            <CardBody className="pt-6">
              <RIASECProfile scores={data.riasecProfile} />
            </CardBody>
          </Card>

          {/* Skill Profile */}
          <Card>
            <CardHeader className="flex flex-col items-start gap-2 pb-4">
              <Chip color="warning" variant="flat" size="sm">
                ทักษะ
              </Chip>
              <h2 className="text-2xl font-bold">สัดส่วนประสบการณ์ของคุณ</h2>
              <p className="text-gray-600 text-sm">
                แสดงสัดส่วนทักษะจากค่ายทั้งหมดที่เข้าร่วม (ไม่ใช่การวัดความเก่งจริง)
              </p>
            </CardHeader>
            <Divider />
            <CardBody className="pt-6">
              <SkillPieChart skills={data.skillProfile} />
            </CardBody>
          </Card>

          {/* Career Recommendations */}
          <div className="space-y-6">
            <div>
              <Chip color="success" variant="flat" size="sm" className="mb-3">
                แนะนำอาชีพ
              </Chip>
              <h2 className="text-2xl font-bold">อาชีพที่เหมาะกับคุณ</h2>
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
            <div className="space-y-6">
              <div>
                <Chip color="warning" variant="flat" size="sm" className="mb-3">
                  ค่ายแนะนำ
                </Chip>
                <h2 className="text-2xl font-bold">ค่ายที่แนะนำเพื่อพัฒนาตัวเอง</h2>
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
    </div>
  );
}
