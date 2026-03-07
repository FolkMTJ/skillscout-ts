// src/app/(tab)/path-finder/careers/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardBody, Button, Chip, Spinner, Tabs, Tab } from '@heroui/react';
import { 
  FiArrowLeft, 
  FiCheckCircle, 
  FiTarget, 
  FiTrendingUp, 
  FiMapPin, 
  FiCalendar, 
  FiBookOpen,
  FiAward,
  FiBriefcase
} from 'react-icons/fi';
import { Career } from '@/data/path-finder';
import { IT_CAREERS } from '@/data/path-finder/careers';
import { Camp } from '@/types';

export default function CareerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const careerId = params.id as string;

  const [career, setCareer] = useState<Career | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [recommendedCamps, setRecommendedCamps] = useState<(Camp & { matchScore?: number; matchingTags?: string[] })[]>([]);
  const [loadingCamps, setLoadingCamps] = useState(false);

  const fetchRecommendedCamps = useCallback(async () => {
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
  }, [career, selectedLevel]);

  useEffect(() => {
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
  }, [career, fetchRecommendedCamps]);

  if (!career) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
           <Spinner size="lg" color="warning" />
           <p className="text-gray-500 animate-pulse">กำลังโหลดข้อมูลอาชีพ...</p>
        </div>
      </div>
    );
  }

  const currentRoadmapStep = career.roadmapSteps.find((step) => step.level === selectedLevel);

  const getDemandLabel = (level: string) => {
    switch (level) {
      case 'high': return 'ต้องการสูงมาก';
      case 'medium': return 'ต้องการปานกลาง';
      default: return 'ทั่วไป';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      
      {/* --- Hero Section with Gradient --- */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white pb-24 pt-10 px-4">
        
        <div className="max-w-[1536px] mx-auto relative z-10">
          <Button
            variant="light"
            startContent={<FiArrowLeft />}
            onClick={() => router.push('/path-finder/careers')}
            className="text-white/80 hover:text-white mb-6"
          >
            ย้อนกลับ
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <div className="flex items-center gap-3 mb-2">
                 <Chip color="warning" variant="solid" className="text-black font-bold">IT Career</Chip>
                 <span className="text-white/60 text-sm font-medium tracking-wide uppercase">{career.id}</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-bold mb-2">{career.nameTh}</h1>
               <p className="text-xl text-white/70 font-light">{career.name}</p>
            </div>

            {/* RIASEC Badges */}
            <div className="flex gap-3">
              {career.riasecCodes.map((code) => (
                <div key={code} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl font-bold text-[#F2B33D] shadow-lg">
                    {code}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1536px] mx-auto -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Left Column: Main Info --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Overview Card */}
            <Card className="shadow-lg border-none">
              <CardBody className="p-8">
                <div className="flex items-center gap-2 mb-4">
                   <FiBookOpen className="text-[#F2B33D] text-xl" />
                   <h2 className="text-xl font-bold text-gray-800">เกี่ยวกับอาชีพนี้</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  {career.description}
                </p>

                <div className="bg-orange-50/50 rounded-xl p-6 border border-orange-100">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FiTarget className="text-[#F2B33D]" /> บุคลิกภาพที่เหมาะสม
                  </h3>
                  <p className="text-gray-700">{career.personality}</p>
                </div>
              </CardBody>
            </Card>

            {/* Roadmap Section */}
            <div>
               <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                 <FiBriefcase className="text-[#F2B33D]" /> เส้นทางการเติบโต (Career Path)
               </h2>
               
               <Card className="shadow-md border-none overflow-visible">
                 <CardBody className="p-0">
                    <Tabs
                      selectedKey={selectedLevel}
                      onSelectionChange={(key) => setSelectedLevel(key as 'beginner' | 'intermediate' | 'advanced')}
                      variant="underlined"
                      color="warning"
                      classNames={{
                        tabList: "p-4 border-b border-gray-100 w-full justify-start gap-8",
                        cursor: "w-full bg-[#F2B33D]",
                        tab: "h-12 text-base px-0",
                        tabContent: "group-data-[selected=true]:text-[#F2B33D] group-data-[selected=true]:font-bold text-gray-500"
                      }}
                    >
                      <Tab key="beginner" title="Step 1: Beginner" />
                      <Tab key="intermediate" title="Step 2: Intermediate" />
                      <Tab key="advanced" title="Step 3: Advanced" />
                    </Tabs>

                    {currentRoadmapStep && (
                      <div className="p-8 animate-appearance-in">
                         <div className="flex flex-col md:flex-row gap-6 mb-8">
                            <div className="flex-1">
                               <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-2xl font-bold text-gray-800">{currentRoadmapStep.title}</h3>
                                  {currentRoadmapStep.duration && (
                                    <Chip size="sm" variant="flat" color="warning">{currentRoadmapStep.duration}</Chip>
                                  )}
                               </div>
                               <p className="text-gray-600">{currentRoadmapStep.description}</p>
                            </div>
                         </div>

                         <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                               <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                 <FiCheckCircle className="text-green-500" /> ทักษะที่ต้องมี
                               </h4>
                               <ul className="space-y-2">
                                 {currentRoadmapStep.requiredSkills.map((skill, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                                      {skill}
                                    </li>
                                 ))}
                               </ul>
                            </div>
                            
                            <div className="bg-orange-50/50 rounded-xl p-5 border border-orange-100 flex flex-col justify-center items-center text-center">
                               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-500 text-2xl mb-3">
                                 <FiAward />
                               </div>
                               <p className="font-semibold text-gray-700">พร้อมหรือยัง?</p>
                               <p className="text-sm text-gray-500 mt-1">ค้นหาค่ายเพื่อฝึกฝนทักษะเหล่านี้ได้เลย</p>
                            </div>
                         </div>
                      </div>
                    )}
                 </CardBody>
               </Card>
            </div>

            {/* Recommended Camps Section */}
            <div id="camps">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-gray-800">
                    ค่ายแนะนำสำหรับระดับ{' '}
                    <span className="text-[#F2B33D]">
                      {selectedLevel === 'beginner' ? 'เริ่มต้น' : selectedLevel === 'intermediate' ? 'ปานกลาง' : 'ขั้นสูง'}
                    </span>
                 </h2>
               </div>

               {loadingCamps ? (
                 <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                   <Spinner size="lg" color="warning" />
                   <p className="text-gray-400 mt-4">กำลังค้นหาค่ายที่เหมาะสม...</p>
                 </div>
               ) : recommendedCamps.length > 0 ? (
                 <div className="grid md:grid-cols-2 gap-6">
                   {recommendedCamps.map((camp) => (
                     <Card 
                       key={camp._id} 
                       isPressable 
                       onPress={() => router.push(`/camps/${camp.slug}`)}
                       className="group border-none shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white"
                     >
                       <CardBody className="p-0">
                         {/* Image */}
                         <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                           <Image 
                             src={camp.image} 
                             alt={camp.name} 
                             fill 
                             className="object-cover transition-transform duration-500 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                           
                           {/* Match Score Badge */}
                           {camp.matchScore && camp.matchScore > 0 && (
                             <div className="absolute top-3 right-3">
                               <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-md bg-opacity-90">
                                 <FiTarget /> แมตช์ {camp.matchScore} ทักษะ
                               </div>
                             </div>
                           )}

                           <div className="absolute bottom-3 left-3 text-white">
                              <p className="font-bold text-lg leading-tight line-clamp-1">{camp.name}</p>
                           </div>
                         </div>

                         {/* Content */}
                         <div className="p-5">
                           <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                             <div className="flex items-center gap-1"><FiCalendar className="text-[#F2B33D]" /> {camp.date}</div>
                             <div className="flex items-center gap-1"><FiMapPin className="text-[#F2B33D]" /> {camp.location}</div>
                           </div>
                           
                           {/* Matching Tags */}
                           {camp.matchingTags && camp.matchingTags.length > 0 && (
                             <div className="flex flex-wrap gap-1 mb-4">
                               {camp.matchingTags.slice(0, 3).map(tag => (
                                 <span key={tag} className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded border border-orange-100 font-medium">
                                   {tag}
                                 </span>
                               ))}
                               {camp.matchingTags.length > 3 && (
                                 <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded">+{camp.matchingTags.length - 3}</span>
                               )}
                             </div>
                           )}

                           <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <span className="text-xl font-bold text-[#F2B33D]">{camp.price}</span>
                              <span className="text-xs text-gray-400 group-hover:text-[#F2B33D] transition-colors font-medium">ดูรายละเอียด &rarr;</span>
                           </div>
                         </div>
                       </CardBody>
                     </Card>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <FiCalendar size={24} />
                    </div>
                    <p className="text-gray-500 font-medium">ยังไม่มีค่ายแนะนำสำหรับระดับนี้</p>
                    <p className="text-sm text-gray-400">ลองดูระดับอื่น หรือค้นหาค่ายทั้งหมด</p>
                 </div>
               )}
            </div>

          </div>

          {/* --- Right Column: Stats & Tags (Sticky) --- */}
          <div className="lg:col-span-1 space-y-6">
             <div className="sticky top-20 space-y-6">
                
                {/* Demand Card */}
                <Card className="shadow-md border-none">
                  <CardBody className="p-6">
                     <h3 className="font-bold text-gray-800 mb-4">ข้อมูลตลาดแรงงาน</h3>
                     
                     <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                           <div className="flex items-center gap-2 mb-1 text-gray-500 text-sm">
                             <FiTrendingUp /> ความต้องการตลาด
                           </div>
                           <div className={`text-lg font-bold flex items-center gap-2 ${career.demandLevel === 'high' ? 'text-green-600' : 'text-gray-800'}`}>
                             {getDemandLabel(career.demandLevel || 'medium')}
                             {career.demandLevel === 'high' && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>}
                           </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                           <div className="flex items-center gap-2 mb-1 text-gray-500 text-sm">
                             <FiBriefcase /> เงินเดือนเริ่มต้น (ประมาณ)
                           </div>
                           <div className="text-lg font-bold text-gray-800">
                             {career.averageSalary || '25,000 - 45,000 บาท'}
                           </div>
                           <p className="text-[10px] text-gray-400 mt-1">*ขึ้นอยู่กับทักษะและบริษัท</p>
                        </div>
                     </div>
                  </CardBody>
                </Card>

                {/* Skills Cloud */}
                <Card className="shadow-md border-none">
                   <CardBody className="p-6">
                      <h3 className="font-bold text-gray-800 mb-4">Tag ที่เกี่ยวข้อง</h3>
                      <div className="flex flex-wrap gap-2">
                        {career.requiredTags.map(tag => (
                           <Chip key={tag} color="default" variant="flat" size="sm" className="bg-gray-100 hover:bg-gray-200 transition-colors cursor-default">
                             {tag}
                           </Chip>
                        ))}
                        {career.recommendedTags.map(tag => (
                           <Chip key={tag} variant="bordered" size="sm" className="text-gray-500 border-gray-300">
                             {tag}
                           </Chip>
                        ))}
                      </div>
                   </CardBody>
                </Card>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
