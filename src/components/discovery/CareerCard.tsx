'use client';

import { Card, CardBody, CardHeader, Chip, Button, Divider } from '@heroui/react';
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

  const getMatchLabel = (score: number) => {
    if (score >= 90) return 'Perfect Match!';
    if (score >= 80) return 'Excellent Match';
    if (score >= 70) return 'Great Match';
    if (score >= 60) return 'Good Match';
    return 'Potential Match';
  };

  const matchColor = getMatchColor(career.matchScore);
  const matchLabel = getMatchLabel(career.matchScore);

  return (
    <Card className="w-full">
      {/* Header with Rank and Match Score */}
      <CardHeader className={`bg-gradient-to-r ${
        matchColor === 'success' ? 'from-green-500 to-green-600' :
        matchColor === 'primary' ? 'from-blue-500 to-blue-600' :
        matchColor === 'warning' ? 'from-yellow-500 to-yellow-600' :
        'from-gray-500 to-gray-600'
      } text-white p-6`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Chip
              color={matchColor}
              variant="solid"
              size="lg"
              className="w-14 h-14 text-2xl font-bold"
            >
              #{rank}
            </Chip>
            <div>
              <h3 className="text-2xl font-bold">
                {career.name}
              </h3>
              <p className="opacity-90 text-sm">{matchLabel}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold">
              {career.matchScore}%
            </div>
            <div className="text-sm font-medium">MATCH</div>
          </div>
        </div>
      </CardHeader>

      <Divider />

      {/* Content */}
      <CardBody className="p-6 space-y-6">
        {/* Description */}
        <p className="text-base leading-relaxed text-gray-700">{career.description}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Salary */}
          <Card className="bg-success-50">
            <CardBody className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiDollarSign className="text-xl text-success-600" />
                <span className="font-semibold">ช่วงเงินเดือน</span>
              </div>
              <div className="text-2xl font-bold text-success-700">{career.salary}</div>
            </CardBody>
          </Card>

          {/* Growth Outlook */}
          <Card className="bg-primary-50">
            <CardBody className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiTrendingUp className="text-xl text-primary-600" />
                <span className="font-semibold">แนวโน้มตลาดงาน</span>
              </div>
              <div className="text-xl font-bold text-primary-700">{career.growthOutlook}</div>
            </CardBody>
          </Card>
        </div>

        {/* Required Skills */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FiCheckCircle className="text-xl text-warning-600" />
            <span className="font-semibold text-base">ทักษะที่ต้องใช้:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {career.requiredSkills.map((skill) => (
              <Chip
                key={skill}
                color="warning"
                variant="flat"
              >
                {skill}
              </Chip>
            ))}
          </div>
        </div>

        <Divider />

        {/* CTA */}
        <Button
          color={matchColor}
          size="lg"
          className="w-full font-semibold"
          endContent={<FiArrowRight />}
        >
          ดูรายละเอียดเส้นทางอาชีพนี้
        </Button>
      </CardBody>
    </Card>
  );
}
