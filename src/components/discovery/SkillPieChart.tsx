'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardBody, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
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

interface LegendProps {
  payload?: Array<{ value: string; color: string }>;
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

  const CustomLegend = ({ payload }: LegendProps) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {payload?.map((entry, index) => (
          <Chip
            key={`legend-${index}`}
            variant="flat"
            size="sm"
            className="cursor-pointer"
            startContent={
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
            }
          >
            <span className="font-bold">{entry.value}</span>
            <span className="text-gray-600 ml-1">({chartData[index].value}%)</span>
          </Chip>
        ))}
      </div>
    );
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
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardBody className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={130}
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
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* ตารางแสดงรายละเอียด - ขวา */}
        <div className="flex flex-col">
          <Table 
            aria-label="Skills table"
            classNames={{
              wrapper: "shadow-md flex-1",
            }}
          >
            <TableHeader>
              <TableColumn>ทักษะ</TableColumn>
              <TableColumn className="text-center">ประสบการณ์</TableColumn>
              <TableColumn className="text-center">สัดส่วน</TableColumn>
              <TableColumn className="text-center">ระดับ</TableColumn>
            </TableHeader>
            <TableBody>
              {skills.map((skill, index) => {
                const levelInfo = getSkillLevelInfo(skill.level);
                const displayPercentage = chartData[index].value;
                
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-semibold">{skill.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Chip variant="flat" size="sm" color="default">
                        {skill.experienceCount} ค่าย
                      </Chip>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-lg">{displayPercentage}%</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          levelInfo.label === 'ผู้เริ่มต้น' ? 'success' :
                          levelInfo.label === 'มีพื้นฐาน' ? 'primary' :
                          levelInfo.label === 'มีประสบการณ์' ? 'secondary' :
                          'warning'
                        }
                      >
                        {levelInfo.label}
                      </Chip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
