'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Chip, Divider, Spinner } from '@heroui/react';
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8">
          <CardBody className="text-center">
            <Spinner size="lg" color="secondary" className="mb-4" />
            <p className="text-lg font-bold">กำลังวิเคราะห์ข้อมูลของคุณ...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!data || data.campsAttended === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-yellow-400 shadow-lg">
              <CardBody className="text-center p-12">
                <FiTarget className="w-20 h-20 mx-auto mb-6 text-yellow-600" />
                <h1 className="text-3xl font-black mb-4">ยังไม่มีข้อมูลเพียงพอ</h1>
                <p className="text-lg mb-6 text-gray-700">
                  คุณต้องเข้าร่วมค่ายที่ได้รับการ <Chip color="success" variant="flat" className="font-bold">Check-in แล้ว</Chip> อย่างน้อย 1 ค่าย
                  <br />
                  เพื่อให้ระบบสามารถวิเคราะห์และแนะนำเส้นทางอาชีพที่เหมาะสมได้
                </p>

                <Card className="bg-blue-50 border-2 border-blue-200 mb-6">
                  <CardBody>
                    <p className="font-bold text-blue-800 mb-3">💡 ขั้นตอนการเข้าร่วมค่าย:</p>
                    <ol className="list-decimal list-inside space-y-2 text-left text-gray-700">
                      <li>สมัครค่ายและชำระเงิน</li>
                      <li>อัปโหลดสลิปโอนเงิน</li>
                      <li>รอผู้จัดค่ายตรวจสอบและอนุมัติ</li>
                      <li>เข้าร่วมค่ายและ Check-in ด้วย QR Code</li>
                    </ol>
                    <Divider className="my-3" />
                    <p className="text-sm text-blue-800">
                      ตรวจสอบสถานะได้ที่เมนู <span className="font-bold">"ค่ายของฉัน"</span>
                    </p>
                  </CardBody>
                </Card>

                <Button
                  size="lg"
                  color="secondary"
                  className="font-bold"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Chip color="warning" variant="flat" className="mb-4 font-bold">
              ✨ Discovery Path
            </Chip>
            <h1 className="text-5xl font-black mb-4">เส้นทางอาชีพของคุณ</h1>
            <p className="text-xl mb-2 opacity-90">
              วิเคราะห์จากค่ายที่คุณเข้าร่วมจริง
            </p>
            <p className="text-lg opacity-75">
              ข้อมูลจาก <span className="font-bold">{data.campsAttended}</span> ค่าย
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-2 border-blue-700">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FiBook className="text-3xl" />
                  <div className="text-sm font-bold opacity-90">ค่ายที่เข้าร่วม</div>
                </div>
                <div className="text-4xl font-black">{data.campsAttended}</div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-2 border-green-700">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FiTarget className="text-3xl" />
                  <div className="text-sm font-bold opacity-90">ทักษะที่ได้</div>
                </div>
                <div className="text-4xl font-black">{data.skillProfile.length}</div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-2 border-purple-700">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FiTrendingUp className="text-3xl" />
                  <div className="text-sm font-bold opacity-90">อาชีพที่แนะนำ</div>
                </div>
                <div className="text-4xl font-black">{data.recommendedCareers.length}</div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-2 border-yellow-700">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FiAward className="text-3xl" />
                  <div className="text-sm font-bold opacity-90">Match สูงสุด</div>
                </div>
                <div className="text-4xl font-black">{data.recommendedCareers[0]?.matchScore || 0}%</div>
              </CardBody>
            </Card>
          </div>

          {/* RIASEC Profile */}
          <Card className="border-2 border-purple-200 shadow-lg">
            <CardHeader className="flex flex-col items-start gap-2 pb-0">
              <Chip color="secondary" variant="flat" className="font-bold">
                บุคลิกภาพ
              </Chip>
              <h2 className="text-3xl font-black">RIASEC Personality Profile</h2>
              <p className="text-gray-600">
                บุคลิกภาพและความชอบในการทำงานของคุณ (วิเคราะห์จากค่ายที่เข้าร่วม)
              </p>
            </CardHeader>
            <CardBody className="pt-6">
              <RIASECProfile scores={data.riasecProfile} />
            </CardBody>
          </Card>

          {/* Skill Profile */}
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="flex flex-col items-start gap-2 pb-0">
              <Chip color="primary" variant="flat" className="font-bold">
                ทักษะ
              </Chip>
              <h2 className="text-3xl font-black">🎯 สัดส่วนประสบการณ์ของคุณ</h2>
              <p className="text-gray-600">
                แสดงสัดส่วนทักษะจากค่ายทั้งหมดที่เข้าร่วม (ไม่ใช่การวัดความเก่งจริง)
              </p>
            </CardHeader>
            <CardBody className="pt-6">
              <SkillPieChart skills={data.skillProfile} />
            </CardBody>
          </Card>

          {/* Career Recommendations */}
          <div>
            <div className="mb-6">
              <Chip color="success" variant="flat" className="font-bold mb-3">
                แนะนำอาชีพ
              </Chip>
              <h2 className="text-3xl font-black">อาชีพที่เหมาะกับคุณ</h2>
            </div>
            <div className="space-y-6">
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
            <div>
              <div className="mb-6">
                <Chip color="warning" variant="flat" className="font-bold mb-3">
                  ค่ายแนะนำ
                </Chip>
                <h2 className="text-3xl font-black">ค่ายที่แนะนำเพื่อพัฒนาตัวเอง</h2>
              </div>
              <RecommendedCamps camps={data.recommendedCamps} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
