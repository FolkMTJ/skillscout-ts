// src/app/(tab)/path-finder/careers/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, Button, Chip, Spinner, Tabs, Tab } from '@heroui/react';
import { FiArrowLeft, FiCheckCircle, FiTarget, FiTrendingUp } from 'react-icons/fi';
import { Career, RoadmapStep } from '@/data/path-finder';
import { IT_CAREERS } from '@/data/path-finder/careers';
import { RIASEC_TYPES } from '@/data/riasec';
import { Camp } from '@/types';

export default function CareerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const careerId = params.id as string;

  const [career, setCareer] = useState<Career | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [recommendedCamps, setRecommendedCamps] = useState<(Camp & { matchScore?: number; matchingTags?: string[] })[]>([]);
  const [loadingCamps, setLoadingCamps] = useState(false);

  useEffect(() => {
    // ดึงข้อมูลอาชีพจาก local data
    const foundCareer = IT_CAREERS.find((c) => c.id === careerId);
    if (foundCareer) {
      setCareer(foundCareer);
    } else {
      router.push('/path-finder/careers');
    }
  }, [careerId, router]);

  useEffect(() => {
    if (career) {
      fetchRecommendedCamps();
    }
  }, [career, selectedLevel]);

  const fetchRecommendedCamps = async () => {
    if (!career) return;

    setLoadingCamps(true);
    try {
      const res = await fetch(
        `/api/path-finder/recommended-camps?careerId=${career.id}&level=${selectedLevel}`
      );
      if (res.ok) {
        const data = await res.json();
        setRecommendedCamps(data.recommendedCamps || []);
      }
    } catch (error) {
      console.error('Error fetching recommended camps:', error);
    } finally {
      setLoadingCamps(false);
    }
  };

  if (!career) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="warning" />
      </div>
    );
  }

  const currentRoadmapStep = career.roadmapSteps.find((step) => step.level === selectedLevel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="light"
            startContent={<FiArrowLeft className="w-5 h-5" />}
            onClick={() => router.push('/path-finder/careers')}
            className="mb-4"
          >
            กลับไปดูอาชีพทั้งหมด
          </Button>
        </div>

        {/* Career Overview */}
        <Card className="mb-8 shadow-lg">
          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold">{career.nameTh}</h1>
                  <div className="flex gap-2">
                    {career.riasecCodes.map((code) => (
                      <div
                        key={code}
                        className="w-10 h-10 bg-[#F2B33D] rounded-full flex items-center justify-center font-bold text-white"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xl text-gray-500 mb-6">{career.name}</p>

                {/* RIASEC Info */}
                <div className="bg-yellow-50 rounded-lg p-6 mb-6">
                  <p className="font-semibold mb-2">บุคลิกภาพที่เหมาะสม:</p>
                  <p className="text-gray-700">{career.personality}</p>
                </div>

                <p className="text-gray-600 mb-6">{career.description}</p>

                {/* Tags */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                      ทักษะที่จำเป็น:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {career.requiredTags.map((tag) => (
                        <Chip key={tag} color="warning" variant="flat">
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {career.recommendedTags.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">
                        ทักษะเสริม:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {career.recommendedTags.map((tag) => (
                          <Chip key={tag} variant="bordered">
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex-shrink-0">
                {career.demandLevel && (
                  <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FiTrendingUp className="w-5 h-5 text-[#F2B33D]" />
                      <p className="font-semibold">ความต้องการ</p>
                    </div>
                    <Chip
                      size="lg"
                      className={
                        career.demandLevel === 'high'
                          ? 'bg-green-100 text-green-700'
                          : career.demandLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {career.demandLevel === 'high'
                        ? 'สูง'
                        : career.demandLevel === 'medium'
                        ? 'ปานกลาง'
                        : 'ต่ำ'}
                    </Chip>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Roadmap Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">เส้นทางการเรียนรู้</h2>

          {/* Level Tabs */}
          <Tabs
            selectedKey={selectedLevel}
            onSelectionChange={(key) => setSelectedLevel(key as any)}
            color="warning"
            size="lg"
            className="mb-6"
          >
            <Tab key="beginner" title="พื้นฐาน (Beginner)" />
            <Tab key="intermediate" title="กลาง (Intermediate)" />
            <Tab key="advanced" title="ขั้นสูง (Advanced)" />
          </Tabs>

          {/* Current Step Details */}
          {currentRoadmapStep && (
            <Card className="shadow-lg">
              <CardBody className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#F2B33D] rounded-full flex items-center justify-center">
                    <FiTarget className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{currentRoadmapStep.title}</h3>
                    <p className="text-gray-600">{currentRoadmapStep.description}</p>
                  </div>
                  {currentRoadmapStep.duration && (
                    <Chip color="warning" variant="flat" size="lg">
                      ⏱️ {currentRoadmapStep.duration}
                    </Chip>
                  )}
                </div>

                {/* Required Skills */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="font-semibold mb-3">ทักษะที่ควรเรียนรู้:</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {currentRoadmapStep.requiredSkills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Recommended Camps */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            ค่ายที่แนะนำสำหรับระดับ {
              selectedLevel === 'beginner' ? 'พื้นฐาน' :
              selectedLevel === 'intermediate' ? 'กลาง' : 'ขั้นสูง'
            }
          </h2>

          {loadingCamps ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" color="warning" />
            </div>
          ) : recommendedCamps.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCamps.map((camp) => (
                <Card
                  key={camp._id}
                  isPressable
                  onPress={() => router.push(`/camps/${camp.slug}`)}
                  className="shadow-md hover:shadow-xl transition-all cursor-pointer"
                >
                  <CardBody className="p-0">
                    {/* Camp Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={camp.image}
                        alt={camp.name}
                        className="w-full h-full object-cover"
                      />
                      {camp.matchScore && camp.matchScore > 0 && (
                        <div className="absolute top-3 right-3">
                          <Chip color="success" className="bg-green-500 text-white font-bold">
                            {camp.matchScore} ทักษะตรง
                          </Chip>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2 line-clamp-2">
                        {camp.name}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <span>📅 {camp.date}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <span>📍 {camp.location}</span>
                      </div>

                      {/* Matching Tags */}
                      {camp.matchingTags && camp.matchingTags.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-2">ทักษะที่ตรง:</p>
                          <div className="flex flex-wrap gap-1">
                            {camp.matchingTags.slice(0, 3).map((tag) => (
                              <Chip key={tag} size="sm" color="warning" variant="flat">
                                {tag}
                              </Chip>
                            ))}
                            {camp.matchingTags.length > 3 && (
                              <Chip size="sm" variant="flat">
                                +{camp.matchingTags.length - 3}
                              </Chip>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-[#F2B33D]">
                          {camp.price}
                        </span>
                        {camp.daysLeft !== undefined && camp.daysLeft > 0 && (
                          <Chip size="sm" color="danger" variant="flat">
                            เหลือ {camp.daysLeft} วัน
                          </Chip>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-md">
              <CardBody className="p-12 text-center">
                <p className="text-gray-500">
                  ยังไม่มีค่ายที่แนะนำสำหรับระดับนี้ในขณะนี้
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
