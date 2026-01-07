// src/app/(tab)/path-finder/careers/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Input, Chip, Spinner } from '@heroui/react';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import { Career } from '@/data/path-finder';
import { RIASEC_TYPES } from '@/data/riasec';

export default function CareersPage() {
  const router = useRouter();
  const [careers, setCareers] = useState<Career[]>([]);
  const [filteredCareers, setFilteredCareers] = useState<Career[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRIASEC, setSelectedRIASEC] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCareers();
  }, []);

  useEffect(() => {
    filterCareers();
  }, [careers, searchQuery, selectedRIASEC]);

  const fetchCareers = async () => {
    try {
      const res = await fetch('/api/path-finder/careers');
      if (res.ok) {
        const data = await res.json();
        setCareers(data.careers);
        setFilteredCareers(data.careers);
      }
    } catch (error) {
      console.error('Error fetching careers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCareers = () => {
    let filtered = careers;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (career) =>
          career.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
          career.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          career.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by RIASEC
    if (selectedRIASEC.length > 0) {
      filtered = filtered.filter((career) =>
        selectedRIASEC.some((code) => career.riasecCodes.includes(code as any))
      );
    }

    setFilteredCareers(filtered);
  };

  const toggleRIASEC = (code: string) => {
    if (selectedRIASEC.includes(code)) {
      setSelectedRIASEC(selectedRIASEC.filter((c) => c !== code));
    } else {
      setSelectedRIASEC([...selectedRIASEC, code]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="warning" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            เลือกเส้นทางอาชีพที่ใช่สำหรับคุณ
          </h1>
          <p className="text-xl text-gray-600">
            สำรวจอาชีพด้าน IT ทั้งหมด พร้อมเส้นทางการเรียนรู้
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-lg">
          <CardBody className="p-6">
            {/* Search */}
            <div className="mb-6">
              <Input
                placeholder="ค้นหาอาชีพ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<FiSearch className="text-gray-400" />}
                size="lg"
                className="max-w-xl"
              />
            </div>

            {/* RIASEC Filter */}
            <div>
              <p className="font-semibold mb-3">กรองตามบุคลิกภาพ (RIASEC):</p>
              <div className="flex flex-wrap gap-3">
                {Object.entries(RIASEC_TYPES).map(([code, info]) => (
                  <Chip
                    key={code}
                    onClick={() => toggleRIASEC(code)}
                    className={`cursor-pointer px-4 py-6 transition-all ${
                      selectedRIASEC.includes(code)
                        ? 'bg-[#F2B33D] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="font-bold">{code}</span>
                    <span className="ml-2">{info.thaiName}</span>
                  </Chip>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            พบ <span className="font-bold text-[#F2B33D]">{filteredCareers.length}</span> อาชีพ
          </p>
        </div>

        {/* Careers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map((career) => (
            <Card
              key={career.id}
              isPressable
              onPress={() => router.push(`/path-finder/careers/${career.id}`)}
              className="shadow-md hover:shadow-xl transition-all cursor-pointer"
            >
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold flex-1">{career.nameTh}</h3>
                  <div className="flex gap-1 flex-shrink-0">
                    {career.riasecCodes.map((code) => (
                      <div
                        key={code}
                        className="w-8 h-8 bg-[#F2B33D] rounded-full flex items-center justify-center text-xs font-bold text-white"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-3">{career.name}</p>

                <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-gray-700 line-clamp-2">
                    {career.personality}
                  </p>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {career.description}
                </p>

                {/* Demand Level */}
                {career.demandLevel && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500">ความต้องการ:</span>
                    <Chip
                      size="sm"
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

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {career.requiredTags.slice(0, 3).map((tag) => (
                    <Chip key={tag} size="sm" variant="flat">
                      {tag}
                    </Chip>
                  ))}
                  {career.requiredTags.length > 3 && (
                    <Chip size="sm" variant="flat">
                      +{career.requiredTags.length - 3}
                    </Chip>
                  )}
                </div>

                <div className="flex items-center text-[#F2B33D] font-semibold text-sm">
                  <span>ดูรายละเอียด</span>
                  <FiArrowRight className="ml-1 w-4 h-4" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredCareers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">ไม่พบอาชีพที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
}
