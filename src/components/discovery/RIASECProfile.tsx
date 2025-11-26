'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardBody, Chip } from '@heroui/react';
import { RIASEC_TYPES } from '@/data/riasec';

interface RIASECProfileProps {
  scores: {
    R: number;
    I: number;
    A: number;
    S: number;
    E: number;
    C: number;
  };
  showDetails?: boolean;
}

interface ChartDataItem {
  code: string;
  name: string;
  thaiName: string;
  value: number;
  color: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataItem }>;
}

interface LegendProps {
  payload?: Array<{ value: string; color: string; payload: ChartDataItem }>;
}

const RIASEC_COLORS: Record<string, string> = {
  'R': '#3B82F6', // blue
  'I': '#8B5CF6', // purple
  'A': '#F59E0B', // amber
  'S': '#10B981', // green
  'E': '#EF4444', // red
  'C': '#6B7280', // gray
};

export default function RIASECProfile({ scores, showDetails = true }: RIASECProfileProps) {
  const chartData = useMemo(() => {
    const total = Object.values(scores).reduce((sum, val) => sum + val, 0);
    
    const normalized = Object.entries(scores).map(([code, value]) => ({
      code,
      name: RIASEC_TYPES[code as keyof typeof RIASEC_TYPES].name,
      thaiName: RIASEC_TYPES[code as keyof typeof RIASEC_TYPES].thaiName,
      originalValue: value,
      value: total > 0 ? Math.round((value / total) * 100) : 0,
      color: RIASEC_COLORS[code]
    }));

    return normalized.sort((a, b) => b.value - a.value);
  }, [scores]);

  const topCode = chartData[0].code as keyof typeof RIASEC_TYPES;

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Chip
                variant="solid"
                size="sm"
                className="font-bold"
                style={{ backgroundColor: data.color, color: 'white' }}
              >
                {data.code}
              </Chip>
              <span className="font-bold">{data.thaiName}</span>
            </div>
            <p className="text-sm text-gray-600">{data.name}</p>
            <p className="text-2xl font-bold mt-2">{data.value}%</p>
          </CardBody>
        </Card>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: LegendProps) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {payload?.map((entry, index) => (
          <div
            key={`legend-${index}`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <div className="text-sm">
              <span className="font-bold">{entry.payload.code}</span>
              <span className="text-gray-600 ml-1">- {entry.payload.thaiName}</span>
              <span className="font-bold ml-2">{entry.payload.value}%</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const hasData = Object.values(scores).some(score => score > 0);

  if (!hasData) {
    return (
      <Card>
        <CardBody className="text-center py-12 text-gray-500">
          ยังไม่มีข้อมูล RIASEC Profile
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Layout: Chart ซ้าย + Rankings ขวา */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - ซ้าย */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardBody className="p-6">
            <ResponsiveContainer width="100%" height={450}>
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

        {/* All Rankings - ขวา */}
        <Card>
          <CardBody className="p-4">
            <h3 className="text-lg font-bold mb-3">อันดับบุคลิกภาพของคุณ</h3>
            <div className="space-y-2">
              {chartData.map((item, index) => {
                const info = RIASEC_TYPES[item.code as keyof typeof RIASEC_TYPES];
                return (
                  <div 
                    key={item.code} 
                    className="flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.01]"
                    style={{ 
                      backgroundColor: `${item.color}10`,
                      borderLeft: `3px solid ${item.color}`
                    }}
                  >
                    <div 
                      className="rounded-full px-3 py-1 font-bold text-sm min-w-[45px] text-center"
                      style={{ backgroundColor: item.color, color: 'white' }}
                    >
                      #{index + 1}
                    </div>
                    <Chip
                      variant="solid"
                      size="md"
                      className="font-bold min-w-[50px] text-lg"
                      style={{ backgroundColor: item.color, color: 'white' }}
                    >
                      {item.code}
                    </Chip>
                    <div className="flex-1">
                      <div className="font-bold">{info.thaiName}</div>
                      <div className="text-xs text-gray-600">{info.name}</div>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: item.color }}>
                      {item.value}%
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Top Personality Description */}
      {showDetails && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <Chip
                variant="solid"
                size="lg"
                className="text-2xl font-bold w-16 h-16 flex items-center justify-center"
                style={{ backgroundColor: RIASEC_COLORS[topCode], color: 'white' }}
              >
                {topCode}
              </Chip>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  บุคลิกภาพเด่น: {RIASEC_TYPES[topCode].thaiName}
                </h3>
                <p className="text-base mb-4 text-gray-700 leading-relaxed">
                  {RIASEC_TYPES[topCode].description}
                </p>
                
                <div className="space-y-3">
                  <div className="font-semibold text-lg">อาชีพ IT ที่เหมาะสม:</div>
                  <div className="flex flex-wrap gap-2">
                    {RIASEC_TYPES[topCode].careers.map((career) => (
                      <Chip
                        key={career}
                        variant="flat"
                        size="lg"
                        style={{ 
                          backgroundColor: `${RIASEC_COLORS[topCode]}20`,
                          borderColor: RIASEC_COLORS[topCode],
                          borderWidth: '1px'
                        }}
                      >
                        {career}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ข้อมูลเพิ่มเติม */}
      <Card className="bg-blue-50">
        <CardBody className="p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">คำอธิบาย:</span> RIASEC Profile คำนวณจาก tags ของค่ายที่คุณเข้าร่วม 
            ยิ่งเข้าค่ายที่เน้นด้านใด บุคลิกภาพด้านนั้นก็จะแสดงมากขึ้น
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
