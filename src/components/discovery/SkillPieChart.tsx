'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardBody, Chip } from '@heroui/react';
import { getSkillLevelInfo } from '@/lib/utils/riasec-calculator';

interface SkillPieChartProps {
  skills: {
    name: string;
    experienceCount: number;
    percentage: number;
    level: 'novice' | 'intermediate' | 'experienced' | 'expert';
  }[];
}

interface ChartDataItem {
  name: string;
  value: number;
  experienceCount: number;
  level: string;
  color: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataItem }>;
}


const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16',
];

export default function SkillPieChart({ skills }: SkillPieChartProps) {
  const chartData = useMemo(() => {
    // skills มา percentage อยู่แล้วที่รวมเป็น 100%
    // แต่เราจะตรวจสอบอีกครั้ง
    const total = skills.reduce((sum, skill) => sum + skill.percentage, 0);
    
    return skills.map((skill, index) => ({
      name: skill.name,
      // ถ้ารวมไม่ได้ 100 ให้ normalize ใหม่
      value: total > 0 && total !== 100 
        ? Math.round((skill.percentage / total) * 100)
        : skill.percentage,
      experienceCount: skill.experienceCount,
      level: skill.level,
      color: COLORS[index % COLORS.length]
    }));
  }, [skills]);

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const levelInfo = getSkillLevelInfo(data.level as 'novice' | 'intermediate' | 'experienced' | 'expert');

      return (
        <Card className="shadow-lg">
          <CardBody className="p-4">
            <p className="font-bold text-lg mb-2">{data.name}</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-semibold">สัดส่วน:</span> {data.value}%</p>
              <p><span className="font-semibold">ประสบการณ์:</span> {data.experienceCount} ค่าย</p>
            </div>
            <Chip
              size="sm"
              variant="flat"
              className="mt-2"
              color={
                levelInfo.label === 'ผู้เริ่มต้น' ? 'success' :
                levelInfo.label === 'มีพื้นฐาน' ? 'primary' :
                levelInfo.label === 'มีประสบการณ์' ? 'secondary' :
                'warning'
              }
            >
              {levelInfo.label}
            </Chip>
          </CardBody>
        </Card>
      );
    }
    return null;
  };


  if (skills.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12 text-gray-500">
          ยังไม่มีข้อมูลทักษะ
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Layout: Chart ซ้าย + Table ขวา */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - ซ้าย */}
        <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* HTML Legend */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-3">
            {chartData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-semibold text-gray-700">{entry.name}</span>
                <span className="text-xs font-bold">({entry.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* รายละเอียดทักษะ - ขวา (responsive list) */}
        <div className="flex flex-col rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm divide-y divide-gray-100">
          {skills.map((skill, index) => {
            const levelInfo = getSkillLevelInfo(skill.level);
            const displayPercentage = chartData[index].value;
            const levelColor = (
              levelInfo.label === 'ผู้เริ่มต้น' ? 'success' :
              levelInfo.label === 'มีพื้นฐาน' ? 'primary' :
              levelInfo.label === 'มีประสบการณ์' ? 'secondary' :
              'warning'
            ) as 'success' | 'primary' | 'secondary' | 'warning';

            return (
              <div key={index} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="flex-1 font-semibold text-sm text-gray-800 min-w-0 truncate">{skill.name}</span>
                <span className="text-sm font-bold text-gray-700 flex-shrink-0">{displayPercentage}%</span>
                <Chip size="sm" variant="flat" color={levelColor} className="flex-shrink-0 hidden sm:flex">
                  {levelInfo.label}
                </Chip>
                <span className="text-xs text-gray-400 flex-shrink-0">{skill.experienceCount} ค่าย</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* คำอธิบาย */}
      <Card className="bg-primary-50">
        <CardBody className="p-4">
          <p className="text-sm text-primary-800">
            <span className="font-semibold">หมายเหตุ:</span> เปอร์เซ็นต์แสดงสัดส่วนประสบการณ์จากค่ายทั้งหมดที่เข้าร่วม 
            ไม่ใช่การวัดระดับความเก่งจริง ยิ่งเข้าค่ายที่เน้นทักษะใดมาก เปอร์เซ็นต์ของทักษะนั้นก็จะสูงขึ้น
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
