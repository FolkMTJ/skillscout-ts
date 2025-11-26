'use client';

import { Card, CardBody, Chip, Progress } from '@heroui/react';
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

  // แปลงสีจาก Tailwind class เป็น HeroUI color
  const getHeroUIColor = (code: string): "primary" | "success" | "warning" | "secondary" | "danger" | "default" => {
    const colorMap: Record<string, "primary" | "success" | "warning" | "secondary" | "danger" | "default"> = {
      'R': 'primary',
      'I': 'secondary', 
      'A': 'warning',
      'S': 'success',
      'E': 'danger',
      'C': 'default'
    };
    return colorMap[code] || 'default';
  };

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
                  <Chip
                    color={getHeroUIColor(code)}
                    variant="solid"
                    size="lg"
                    className="w-12 h-12 flex items-center justify-center font-bold text-lg"
                  >
                    {code}
                  </Chip>
                  <div>
                    <div className="font-bold text-lg">
                      {info.thaiName}
                      {isTop3 && <span className="ml-2 text-warning-600">★</span>}
                    </div>
                    <div className="text-sm text-gray-600">{info.name}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold">{score}%</div>
              </div>
              
              {/* Progress Bar */}
              <Progress
                value={score}
                color={getHeroUIColor(code)}
                size="lg"
                className="w-full"
                classNames={{
                  indicator: "font-bold"
                }}
                showValueLabel={true}
              />
            </div>
          );
        })}
      </div>

      {/* Top Personality Description */}
      {showDetails && (
        <Card className="bg-warning-50">
          <CardBody className="p-6">
            <h3 className="text-xl font-bold mb-3">
              บุคลิกภาพเด่นของคุณ: {RIASEC_TYPES[topCode].thaiName}
            </h3>
            <p className="text-base mb-4 text-gray-700">{RIASEC_TYPES[topCode].description}</p>
            
            <div className="space-y-3">
              <div className="font-semibold">อาชีพ IT ที่เหมาะสม:</div>
              <div className="flex flex-wrap gap-2">
                {RIASEC_TYPES[topCode].careers.map((career) => (
                  <Chip
                    key={career}
                    variant="flat"
                    color={getHeroUIColor(topCode)}
                  >
                    {career}
                  </Chip>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Top 3 Summary */}
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-bold mb-4">3 อันดับบุคลิกภาพของคุณ:</h3>
          <div className="space-y-3">
            {sortedScores.map(([code, score], index) => {
              const info = RIASEC_TYPES[code as keyof typeof RIASEC_TYPES];
              return (
                <div key={code} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Chip
                    color="warning"
                    variant="solid"
                    size="sm"
                    className="font-bold min-w-[40px]"
                  >
                    #{index + 1}
                  </Chip>
                  <Chip
                    color={getHeroUIColor(code)}
                    variant="solid"
                    size="md"
                    className="font-bold min-w-[48px]"
                  >
                    {code}
                  </Chip>
                  <div className="flex-1">
                    <span className="font-semibold">{info.thaiName}</span>
                    <span className="text-sm text-gray-600 ml-2">({info.name})</span>
                  </div>
                  <div className="font-bold text-lg">{score}%</div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
