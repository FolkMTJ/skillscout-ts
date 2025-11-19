'use client';

interface Skill {
  name: string;
  level: number;
  experienceCount: number;
}

interface SkillRadarChartProps {
  skills: Skill[];
}

export default function SkillRadarChart({ skills }: SkillRadarChartProps) {
  const sortedSkills = [...skills].sort((a, b) => b.level - a.level);
  const topSkills = sortedSkills.slice(0, 5);
  const otherSkills = sortedSkills.slice(5);

  const getLevelLabel = (level: number) => {
    if (level >= 80) return { label: 'Expert', color: 'bg-purple-500' };
    if (level >= 60) return { label: 'Advanced', color: 'bg-blue-500' };
    if (level >= 40) return { label: 'Intermediate', color: 'bg-green-500' };
    if (level >= 20) return { label: 'Beginner', color: 'bg-yellow-500' };
    return { label: 'Novice', color: 'bg-gray-400' };
  };

  return (
    <div className="space-y-8">
      {/* Top Skills */}
      <div>
        <h3 className="text-xl font-black mb-4">
          ทักษะเด่นของคุณ (Top 5)
        </h3>
        <div className="space-y-4">
          {topSkills.map((skill, index) => {
            const levelInfo = getLevelLabel(skill.level);
            return (
              <div
                key={skill.name}
                className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-400 border-2 border-black flex items-center justify-center font-black">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{skill.name}</div>
                      <div className="text-sm opacity-70">
                        {skill.experienceCount} ค่าย
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`${levelInfo.color} text-white px-3 py-1 text-sm font-bold border-2 border-black`}>
                      {levelInfo.label}
                    </span>
                    <span className="text-2xl font-black">{skill.level}%</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-6 bg-gray-200 border-2 border-black">
                  <div
                    className={`h-full ${levelInfo.color} border-r-2 border-black transition-all duration-500`}
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Other Skills */}
      {otherSkills.length > 0 && (
        <div>
          <h3 className="text-xl font-black mb-4">
            ทักษะอื่นๆ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherSkills.map((skill) => {
              const levelInfo = getLevelLabel(skill.level);
              return (
                <div
                  key={skill.name}
                  className="bg-gray-50 border-2 border-black p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold">{skill.name}</div>
                    <div className="text-lg font-black">{skill.level}%</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-70">{skill.experienceCount} ค่าย</span>
                    <span className={`${levelInfo.color} text-white px-2 py-1 text-xs font-bold`}>
                      {levelInfo.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-100 border-2 border-black p-4 text-center">
          <div className="text-3xl font-black mb-1">{skills.length}</div>
          <div className="text-sm font-bold">ทักษะทั้งหมด</div>
        </div>
        <div className="bg-green-100 border-2 border-black p-4 text-center">
          <div className="text-3xl font-black mb-1">
            {skills.filter(s => s.level >= 60).length}
          </div>
          <div className="text-sm font-bold">ระดับ Advanced+</div>
        </div>
        <div className="bg-purple-100 border-2 border-black p-4 text-center">
          <div className="text-3xl font-black mb-1">
            {Math.round(skills.reduce((sum, s) => sum + s.level, 0) / skills.length)}%
          </div>
          <div className="text-sm font-bold">ค่าเฉลี่ย</div>
        </div>
      </div>
    </div>
  );
}
