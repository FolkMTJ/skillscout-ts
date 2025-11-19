'use client';

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

export default function RIASECProfile({ scores, showDetails = true }: RIASECProfileProps) {
  const sortedScores = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const topCode = sortedScores[0][0] as keyof typeof RIASEC_TYPES;

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="space-y-4">
        {Object.entries(RIASEC_TYPES).map(([code, info]) => {
          const score = scores[code as keyof typeof scores];
          const isTop3 = sortedScores.some(([c]) => c === code);
          
          return (
            <div key={code} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${info.color} border-4 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                    {code}
                  </div>
                  <div>
                    <div className="font-bold text-lg">
                      {info.thaiName}
                      {isTop3 && <span className="ml-2 text-yellow-600">★</span>}
                    </div>
                    <div className="text-sm opacity-70">{info.name}</div>
                  </div>
                </div>
                <div className="text-2xl font-black">{score}%</div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-8 bg-gray-200 border-4 border-black">
                <div
                  className={`h-full ${info.color} border-r-4 border-black transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${score}%` }}
                >
                  {score > 15 && (
                    <span className="text-white font-black text-sm drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      {score}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Personality Description */}
      {showDetails && (
        <div className="bg-yellow-50 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-black mb-3">
            บุคลิกภาพเด่นของคุณ: {RIASEC_TYPES[topCode].thaiName}
          </h3>
          <p className="text-lg mb-4">{RIASEC_TYPES[topCode].description}</p>
          
          <div className="space-y-3">
            <div className="font-bold">อาชีพ IT ที่เหมาะสม:</div>
            <div className="flex flex-wrap gap-2">
              {RIASEC_TYPES[topCode].careers.map((career) => (
                <span
                  key={career}
                  className="bg-white border-2 border-black px-4 py-2 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  {career}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Summary */}
      <div className="bg-white border-4 border-black p-6">
        <h3 className="text-lg font-black mb-3">3 อันดับบุคลิกภาพของคุณ:</h3>
        <div className="space-y-2">
          {sortedScores.map(([code, score], index) => {
            const info = RIASEC_TYPES[code as keyof typeof RIASEC_TYPES];
            return (
              <div key={code} className="flex items-center gap-3">
                <div className="font-black text-lg w-6">#{index + 1}</div>
                <div className={`w-10 h-10 ${info.color} border-2 border-black flex items-center justify-center font-black`}>
                  {code}
                </div>
                <div className="flex-1">
                  <span className="font-bold">{info.thaiName}</span>
                  <span className="text-sm opacity-70 ml-2">({info.name})</span>
                </div>
                <div className="font-black text-lg">{score}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
