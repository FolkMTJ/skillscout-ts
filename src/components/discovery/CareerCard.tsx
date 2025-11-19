'use client';

import { FiTrendingUp, FiDollarSign, FiCheckCircle } from 'react-icons/fi';

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
  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-gray-500';
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
    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* Header with Rank and Match Score */}
      <div className={`${matchColor} border-b-4 border-black p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-black text-white flex items-center justify-center text-3xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]">
              #{rank}
            </div>
            <div>
              <h3 className="text-2xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                {career.name}
              </h3>
              <p className="text-white font-bold opacity-90">{matchLabel}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
              {career.matchScore}%
            </div>
            <div className="text-white font-bold text-sm">MATCH</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <p className="text-lg leading-relaxed">{career.description}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Salary */}
          <div className="bg-green-50 border-2 border-black p-4">
            <div className="flex items-center gap-2 mb-2">
              <FiDollarSign className="text-xl" />
              <span className="font-bold">ช่วงเงินเดือน</span>
            </div>
            <div className="text-2xl font-black">{career.salary}</div>
          </div>

          {/* Growth Outlook */}
          <div className="bg-blue-50 border-2 border-black p-4">
            <div className="flex items-center gap-2 mb-2">
              <FiTrendingUp className="text-xl" />
              <span className="font-bold">แนวโน้มตลาดงาน</span>
            </div>
            <div className="text-xl font-black">{career.growthOutlook}</div>
          </div>
        </div>

        {/* Required Skills */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FiCheckCircle className="text-xl" />
            <span className="font-bold text-lg">ทักษะที่ต้องใช้:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {career.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="bg-yellow-400 border-2 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4 border-t-2 border-black">
          <button className="w-full bg-black text-white py-4 text-lg font-bold border-4 border-black hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            ดูรายละเอียดเส้นทางอาชีพนี้
          </button>
        </div>
      </div>
    </div>
  );
}
