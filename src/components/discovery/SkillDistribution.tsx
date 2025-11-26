'use client';

import { useMemo, useState } from 'react';
import { getSkillLevelInfo } from '@/lib/utils/riasec-calculator';

interface SkillDistributionProps {
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

export default function SkillDistribution({ skills }: SkillDistributionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (skills.length === 0) {
    return <div className="text-center py-12 text-gray-500">ยังไม่มีข้อมูลทักษะ</div>;
  }

  return (
    <div className="w-full space-y-8">
      {/* Progress Bars */}
      <div className="space-y-4">
        {skills.map((skill, index) => {
          const levelInfo = getSkillLevelInfo(skill.level);
          return (
            <div
              key={index}
              className="transition-all duration-200"
              style={{
                opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.5
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-black"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-bold text-lg">{skill.name}</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded border ${levelInfo.borderColor} ${levelInfo.bgColor} ${levelInfo.color}`}>
                    {levelInfo.icon} {levelInfo.label}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {skill.experienceCount} ค่าย
                  </span>
                  <span className="font-black text-2xl min-w-[60px] text-right">
                    {skill.percentage}%
                  </span>
                </div>
              </div>
              <div className="h-8 bg-gray-200 border-2 border-black rounded overflow-hidden">
                <div
                  className="h-full border-r-2 border-black transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${skill.percentage}%`,
                    backgroundColor: COLORS[index % COLORS.length]
                  }}
                >
                  {skill.percentage >= 15 && (
                    <span className="text-white font-bold text-sm drop-shadow-md">
                      {skill.percentage}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-4 border-black">
          <thead className="bg-yellow-400 border-b-4 border-black">
            <tr>
              <th className="px-4 py-3 text-left font-black border-r-2 border-black">ทักษะ</th>
              <th className="px-4 py-3 text-center font-black border-r-2 border-black">ประสบการณ์</th>
              <th className="px-4 py-3 text-center font-black border-r-2 border-black">สัดส่วน</th>
              <th className="px-4 py-3 text-center font-black">ระดับ</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {skills.map((skill, index) => {
              const levelInfo = getSkillLevelInfo(skill.level);
              return (
                <tr 
                  key={index} 
                  className="border-b-2 border-black last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-bold border-r-2 border-black">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-black"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      {skill.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-r-2 border-black">
                    {skill.experienceCount} ค่าย
                  </td>
                  <td className="px-4 py-3 text-center font-black text-lg border-r-2 border-black">
                    {skill.percentage}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded border-2 ${levelInfo.borderColor} ${levelInfo.bgColor} ${levelInfo.color} font-bold text-sm`}>
                      {levelInfo.icon} {levelInfo.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div className="p-4 bg-blue-50 border-2 border-blue-400 rounded">
        <p className="text-sm text-blue-800">
          <span className="font-bold">💡 หมายเหตุ:</span> เปอร์เซ็นต์แสดงสัดส่วนประสบการณ์จากค่ายทั้งหมดที่เข้าร่วม 
          ไม่ใช่การวัดระดับความเก่งจริง
        </p>
      </div>
    </div>
  );
}
