'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiTrendingUp, FiTarget, FiBook, FiAward } from 'react-icons/fi';
import SkillRadarChart from '@/components/discovery/SkillRadarChart';
import RIASECProfile from '@/components/discovery/RIASECProfile';
import CareerCard from '@/components/discovery/CareerCard';
import RecommendedCamps from '@/components/discovery/RecommendedCamps';

interface DiscoveryData {
  campsAttended: number;
  skillProfile: {
    name: string;
    level: number;
    experienceCount: number;
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
        setData(result);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
          <p className="text-lg font-bold">กำลังวิเคราะห์ข้อมูลของคุณ...</p>
        </div>
      </div>
    );
  }

  if (!data || data.campsAttended === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-yellow-400 border-4 border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <FiTarget className="w-20 h-20 mx-auto mb-6" />
              <h1 className="text-3xl font-black mb-4">ยังไม่มีข้อมูลเพียงพอ</h1>
              <p className="text-lg mb-6">
                คุณต้องเข้าร่วมค่ายอย่างน้อย 1 ค่าย เพื่อให้ระบบสามารถวิเคราะห์และแนะนำเส้นทางอาชีพที่เหมาะสมได้
              </p>
              <button
                onClick={() => router.push('/allcamps')}
                className="bg-black text-white px-8 py-4 text-lg font-bold border-4 border-black hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                ค้นหาค่ายที่น่าสนใจ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-yellow-400 border-b-4 border-black">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-black mb-4">Discovery Path</h1>
            <p className="text-xl font-bold mb-2">
              เส้นทางอาชีพและสายการเรียนที่เหมาะกับคุณ
            </p>
            <p className="text-lg opacity-80">
              วิเคราะห์จาก {data.campsAttended} ค่ายที่คุณเข้าร่วม
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              icon={<FiBook />}
              label="ค่ายที่เข้าร่วม"
              value={data.campsAttended}
              color="bg-blue-400"
            />
            <StatCard
              icon={<FiTarget />}
              label="ทักษะที่ได้"
              value={data.skillProfile.length}
              color="bg-green-400"
            />
            <StatCard
              icon={<FiTrendingUp />}
              label="อาชีพที่แนะนำ"
              value={data.recommendedCareers.length}
              color="bg-purple-400"
            />
            <StatCard
              icon={<FiAward />}
              label="Match สูงสุด"
              value={`${data.recommendedCareers[0]?.matchScore || 0}%`}
              color="bg-yellow-400"
            />
          </div>

          {/* RIASEC Profile */}
          <section className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-black mb-6">
              RIASEC Personality Profile
            </h2>
            <p className="text-lg mb-6">
              บุคลิกภาพและความชอบในการทำงานของคุณ (วิเคราะห์จากค่ายที่เข้าร่วม)
            </p>
            <RIASECProfile scores={data.riasecProfile} />
          </section>

          {/* Skill Profile */}
          <section className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-black mb-6">
              ทักษะของคุณ
            </h2>
            <SkillRadarChart skills={data.skillProfile} />
          </section>

          {/* Career Recommendations */}
          <section>
            <h2 className="text-3xl font-black mb-6">
              อาชีพที่แนะนำสำหรับคุณ
            </h2>
            <div className="space-y-6">
              {data.recommendedCareers.map((career, index) => (
                <CareerCard
                  key={career.id}
                  career={career}
                  rank={index + 1}
                />
              ))}
            </div>
          </section>

          {/* Recommended Camps */}
          {data.recommendedCamps.length > 0 && (
            <section>
              <h2 className="text-3xl font-black mb-6">
                ค่ายที่แนะนำเพื่อพัฒนาตัวเอง
              </h2>
              <RecommendedCamps camps={data.recommendedCamps} />
            </section>
          )}

        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  color: string;
}) {
  return (
    <div className={`${color} border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="text-2xl">{icon}</div>
        <div className="text-sm font-bold opacity-80">{label}</div>
      </div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
}
