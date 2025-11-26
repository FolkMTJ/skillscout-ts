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

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16',
];

export default function SkillPieChart({ skills }: SkillPieChartProps) {
  const chartData = useMemo(() => {
    return skills.map((skill, index) => ({
      name: skill.name,
      value: skill.percentage,
      experienceCount: skill.experienceCount,
      level: skill.level,
      color: COLORS[index % COLORS.length]
    }));
  }, [skills]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const levelInfo = getSkillLevelInfo(data.level);

      return (
        <Card className="border-2 border-black shadow-xl">
          <CardBody className="p-4">
            <p className="font-black text-lg mb-2">{data.name}</p>
            <div className="space-y-1 text-sm">
              <p><span className="font-bold">สัดส่วน:</span> {data.value}%</p>
              <p><span className="font-bold">ประสบการณ์:</span> {data.experienceCount} ค่าย</p>
            </div>
            <Chip
              size="sm"
              className="mt-2"
              style={{
                backgroundColor: levelInfo.bgColor.replace('bg-', ''),
                color: levelInfo.color.replace('text-', ''),
                borderColor: levelInfo.borderColor.replace('border-', '')
              }}
            >
              {levelInfo.icon} {levelInfo.label}
            </Chip>
          </CardBody>
        </Card>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-black text-sm"
        stroke="black"
        strokeWidth="0.5"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {payload.map((entry: any, index: number) => (
          <Chip
            key={`legend-${index}`}
            variant="flat"
            className="cursor-pointer"
            startContent={
              <div
                className="w-3 h-3 rounded-full border border-gray-600"
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
      {/* Pie Chart */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
        <CardBody className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                stroke="#000"
                strokeWidth={3}
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

      {/* ตารางแสดงรายละเอียด */}
      <Table 
        aria-label="Skills table"
        classNames={{
          wrapper: "border-2 border-gray-300 shadow-lg",
          th: "bg-yellow-400 text-black font-black",
          td: "font-medium"
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
            return (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-black"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-bold">{skill.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Chip variant="flat" size="sm">
                    {skill.experienceCount} ค่าย
                  </Chip>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-black text-xl">{skill.percentage}%</span>
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
                    startContent={<span>{levelInfo.icon}</span>}
                  >
                    {levelInfo.label}
                  </Chip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* คำอธิบาย */}
      <Card className="bg-blue-50 border-2 border-blue-200">
        <CardBody className="p-4">
          <p className="text-sm text-blue-800">
            <span className="font-bold">💡 หมายเหตุ:</span> เปอร์เซ็นต์แสดงสัดส่วนประสบการณ์จากค่ายทั้งหมดที่เข้าร่วม 
            ไม่ใช่การวัดระดับความเก่งจริง ยิ่งเข้าค่ายที่เน้นทักษะใดมาก % ของทักษะนั้นก็จะสูงขึ้น
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
