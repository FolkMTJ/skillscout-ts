'use client';

import { Card, CardBody, Chip, Divider, Button } from '@heroui/react';
import { FiTrendingUp, FiDollarSign, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

interface Career {
  id: string;
  name: string;
  matchScore: number;
  description: string;
  salary: string;
  requiredSkills: string[];
  growthOutlook: string;
}

interface CareerCardProps {
  career: Career;
  rank: number;
}

export default function CareerCard({ career, rank }: CareerCardProps) {
  const getMatchColor = (score: number): "success" | "primary" | "warning" | "default" => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'default';
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#F59E0B'; // gold
    if (rank === 2) return '#9CA3AF'; // silver
    if (rank === 3) return '#CD7F32'; // bronze
    return '#6B7280';
  };

  const matchColor = getMatchColor(career.matchScore);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardBody className="p-6 space-y-4 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1  line-clamp-2">{career.name}</h3>
            <Chip
              color={matchColor}
              variant="flat"
              size="sm"
            >
              {career.matchScore}% Match
            </Chip>
          </div>
          <div 
            className="rounded-full px-3 py-1.5 font-bold text-sm min-w-[45px] text-center flex-shrink-0"
            style={{ backgroundColor: getRankColor(rank), color: 'white' }}
          >
            #{rank}
          </div>
        </div>

        <Divider />

        {/* Description - Fixed height */}
        <p className="text-sm leading-relaxed text-gray-700 h-[3rem] line-clamp-3">{career.description}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Salary */}
          <div className="flex items-start gap-2 p-3 bg-success-50 rounded-lg">
            <FiDollarSign className="text-lg text-success-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="font-semibold text-xs text-gray-700 mb-1">เงินเดือน</div>
              <div className="text-sm font-bold text-success-700 break-words">{career.salary}</div>
            </div>
          </div>

          {/* Growth Outlook */}
          <div className="flex items-start gap-2 p-3 bg-primary-50 rounded-lg">
            <FiTrendingUp className="text-lg text-primary-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="font-semibold text-xs text-gray-700 mb-1">แนวโน้ม</div>
              <div className="text-sm font-bold text-primary-700 break-words">{career.growthOutlook}</div>
            </div>
          </div>
        </div>

        {/* Required Skills - Fixed height */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FiCheckCircle className="text-base text-warning-600" />
            <span className="font-semibold text-sm">ทักษะที่ต้องใช้:</span>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[2rem]">
            {career.requiredSkills.map((skill) => (
              <Chip
                key={skill}
                color="default"
                variant="flat"
                size="sm"
              >
                {skill}
              </Chip>
            ))}
          </div>
        </div>

        <Divider />

        {/* CTA Button */}
        <Button
          color={matchColor}
          variant="flat"
          className="w-full font-semibold mt-auto"
          endContent={<FiArrowRight />}
        >
          ดูรายละเอียดเพิ่มเติม
        </Button>
      </CardBody>
    </Card>
  );
}
