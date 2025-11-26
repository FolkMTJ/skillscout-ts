'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Chip, Spinner, Divider } from '@heroui/react';
import { FiTrendingUp, FiTarget, FiBook, FiAward, FiArrowRight } from 'react-icons/fi';
import SkillPieChart from '@/components/discovery/SkillPieChart';
import RIASECProfile from '@/components/discovery/RIASECProfile';
import CareerCard from '@/components/discovery/CareerCard';
import RecommendedCamps from '@/components/discovery/RecommendedCamps';

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

export default function DiscoveryPathPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DiscoveryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchDiscoveryData();
    }
  }, [status, router]);

  const fetchDiscoveryData = async () => {
    try {
      const res = await fetch('/api/discovery/profile');
      if (res.ok) {
        const result = await res.json();
        console.log('Discovery data:', result);
        setData(result);
      } else {
        console.error('Failed to fetch:', res.status, await res.text());
      }
    } catch (error) {
      console.error('Error fetching discovery data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#F2B33D] via-amber-400 to-orange-400">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Chip color="warning" variant="solid" className="mb-4 bg-white text-[#F2B33D] font-semibold">
              ✨ Discovery Path
            </Chip>
            <h1 className="text-5xl font-bold mb-4">เส้นทางอาชีพของคุณ</h1>
            <p className="text-xl mb-2 opacity-90">
              วิเคราะห์จากค่ายที่คุณเข้าร่วมจริง
            </p>
            <p className="text-lg opacity-75">
              ข้อมูลจาก <span className="font-semibold">{data.campsAttended}</span> ค่าย
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
              <CardBody className="p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-white/20">
                    <FiBook className="text-2xl" />
                  </div>
                  <div className="text-sm font-medium opacity-90">ค่ายที่เข้าร่วม</div>
                </div>
                <div className="text-3xl font-bold">{data.campsAttended}</div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600">
              <CardBody className="p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-white/20">
                    <FiTarget className="text-2xl" />
                  </div>
                  <div className="text-sm font-medium opacity-90">ทักษะที่ได้</div>
                </div>
                <div className="text-3xl font-bold">{data.skillProfile.length}</div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
              <CardBody className="p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-white/20">
                    <FiTrendingUp className="text-2xl" />
                  </div>
                  <div className="text-sm font-medium opacity-90">อาชีพที่แนะนำ</div>
                </div>
                <div className="text-3xl font-bold">{data.recommendedCareers.length}</div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-[#F2B33D] to-orange-500">
              <CardBody className="p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-white/20">
                    <FiAward className="text-2xl" />
                  </div>
                  <div className="text-sm font-medium opacity-90">Match สูงสุด</div>
                </div>
                <div className="text-3xl font-bold">
                  {data.recommendedCareers[0]?.matchScore || 0}%
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
              <h2 className="text-2xl font-bold">🎯 สัดส่วนประสบการณ์ของคุณ</h2>
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
            <div className="space-y-4">
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
          {data.recommendedCamps.length > 0 && (
            <div className="space-y-6">
              <div>
                <Chip color="warning" variant="flat" size="sm" className="mb-3">
                  ค่ายแนะนำ
                </Chip>
                <h2 className="text-2xl font-bold">ค่ายที่แนะนำเพื่อพัฒนาตัวเอง</h2>
              </div>
              <RecommendedCamps camps={data.recommendedCamps} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
