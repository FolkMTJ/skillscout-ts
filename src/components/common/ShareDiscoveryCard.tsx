// src/components/common/ShareDiscoveryCard.tsx
'use client';

import { forwardRef } from 'react';
import {
    FaWrench, FaMicroscope, FaPaintBrush,
    FaHandshake, FaRocket, FaChartBar,
    FaBriefcase, FaMoneyBillWave, FaStar,
} from 'react-icons/fa';
import { RIASEC_TYPES } from '@/data/riasec';

export interface DiscoveryShareData {
    riasecProfile: {
        R: number; I: number; A: number;
        S: number; E: number; C: number;
    };
    recommendedCareers: {
        id: string;
        name: string;
        matchScore: number;
        description: string;
        salary: string;
        requiredSkills: string[];
        growthOutlook: string;
    }[];
}

interface ShareDiscoveryCardProps {
    data: DiscoveryShareData;
}

const RIASEC_ICON: Record<string, React.ReactElement> = {
    R: <FaWrench />, I: <FaMicroscope />, A: <FaPaintBrush />,
    S: <FaHandshake />, E: <FaRocket />, C: <FaChartBar />,
};

const RIASEC_ACCENT: Record<string, { light: string; color: string }> = {
    R: { light: '#FEF6E0', color: '#F2B33D' },
    I: { light: '#dbeafe', color: '#2563eb' },
    A: { light: '#ede9fe', color: '#7c3aed' },
    S: { light: '#dcfce7', color: '#16a34a' },
    E: { light: '#fef9c3', color: '#ca8a04' },
    C: { light: '#f1f5f9', color: '#475569' },
};

const RANK_COLORS = [
    { bg: '#F2B33D', text: '#111111' },
    { bg: '#111111', text: '#F2B33D' },
    { bg: '#E8E8E8', text: '#555555' },
];

function getTop2RIASEC(profile: DiscoveryShareData['riasecProfile']) {
    return Object.entries(profile)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([code]) => code);
}

const ShareDiscoveryCard = forwardRef<HTMLDivElement, ShareDiscoveryCardProps>(
    ({ data }, ref) => {
        const top2Codes = getTop2RIASEC(data.riasecProfile);
        const topCareers = data.recommendedCareers.slice(0, 3);

        return (
            <div
                ref={ref}
                style={{
                    width: '1080px',
                    height: '1920px',
                    fontFamily: "'Noto Sans Thai', 'Inter', sans-serif",
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#F7F7F5',
                }}
            >
                {/* ══ DARK HERO HEADER ══ */}
                <div style={{
                    background: 'linear-gradient(160deg, #111111 0%, #1e1e1e 60%, #2a2200 100%)',
                    padding: '64px 80px 72px',
                    flexShrink: 0,
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Glow */}
                    <div style={{
                        position: 'absolute', top: '-60px', right: '-60px',
                        width: '500px', height: '500px', borderRadius: '50%',
                        background: 'radial-gradient(circle, #F2B33D30 0%, transparent 65%)',
                        pointerEvents: 'none',
                    }} />
                    {/* Gold top bar */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '8px',
                        background: 'linear-gradient(90deg, #F2B33D 0%, #f8d76b 50%, #F2B33D 100%)',
                    }} />

                    {/* Logo + RIASEC top 2 row */}
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '44px',
                    }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.10)',
                            border: '1.5px solid rgba(255,255,255,0.15)',
                            borderRadius: '20px',
                            padding: '16px 24px',
                            display: 'flex', alignItems: 'center', gap: '16px',
                        }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/skillscoutLogo.png"
                                alt="SkillScout"
                                style={{ height: '72px', width: 'auto', objectFit: 'contain', display: 'block' }}
                            />
                        </div>
                        {/* RIASEC top 2 — secondary */}
                        <div style={{
                            background: 'rgba(242,179,61,0.15)',
                            border: '2px solid rgba(242,179,61,0.4)',
                            borderRadius: '18px',
                            padding: '14px 36px',
                            display: 'flex', alignItems: 'center', gap: '20px',
                        }}>
                            {top2Codes.map((code) => {
                                const acc = RIASEC_ACCENT[code] ?? RIASEC_ACCENT.C;
                                return (
                                    <div key={code} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '48px', height: '48px',
                                            borderRadius: '12px',
                                            background: acc.light,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: acc.color, fontSize: '22px',
                                        }}>
                                            {RIASEC_ICON[code]}
                                        </div>
                                        <span style={{ color: '#ffffff', fontSize: '28px', fontWeight: 700 }}>
                                            {RIASEC_TYPES[code as keyof typeof RIASEC_TYPES]?.thaiName ?? code}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Label chip */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center',
                        background: 'rgba(242,179,61,0.18)',
                        border: '1.5px solid rgba(242,179,61,0.45)',
                        borderRadius: '99px',
                        padding: '10px 32px',
                        marginBottom: '24px',
                    }}>
                        <span style={{
                            fontSize: '26px', color: '#F2B33D',
                            fontWeight: 700, letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                        }}>
                            Discovery Path
                        </span>
                    </div>

                    {/* Big title */}
                    <h1 style={{
                        fontSize: '88px',
                        fontWeight: 900,
                        color: '#ffffff',
                        margin: 0,
                        lineHeight: 1.12,
                        letterSpacing: '-0.01em',
                    }}>
                        อาชีพที่เหมาะกับคุณ
                    </h1>
                </div>

                {/* ══ BODY ══ */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '48px 80px 52px',
                    gap: 0,
                }}>

                    {/* Section header */}
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        gap: '20px', marginBottom: '36px',
                    }}>
                        <div style={{
                            width: '56px', height: '56px',
                            borderRadius: '16px',
                            background: '#111111',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#F2B33D', fontSize: '28px',
                        }}>
                            <FaBriefcase />
                        </div>
                        <span style={{
                            fontSize: '32px', fontWeight: 800,
                            color: '#111111',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                        }}>
                            อาชีพแนะนำสำหรับคุณ
                        </span>
                    </div>

                    {/* Career cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
                        {topCareers.length > 0
                            ? topCareers.map((career, idx) => {
                                const rank = RANK_COLORS[idx] ?? RANK_COLORS[2];
                                return (
                                    <div key={career.id} style={{
                                        background: '#ffffff',
                                        borderRadius: '28px',
                                        border: `3px solid ${idx === 0 ? '#F2B33D' : '#EBEBEB'}`,
                                        padding: '40px 48px',
                                        boxShadow: idx === 0
                                            ? '0 12px 48px rgba(242,179,61,0.20)'
                                            : '0 4px 20px rgba(0,0,0,0.06)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}>
                                        {/* Rank + Name */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '28px', marginBottom: '20px' }}>
                                            <div style={{
                                                width: '72px', height: '72px',
                                                borderRadius: '18px',
                                                background: rank.bg,
                                                color: rank.text,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '32px', fontWeight: 900,
                                                flexShrink: 0,
                                            }}>
                                                {idx + 1}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{
                                                    fontWeight: 900, fontSize: '48px',
                                                    color: '#111111', margin: '0 0 6px', lineHeight: 1.15,
                                                }}>
                                                    {career.name}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <FaStar style={{ color: '#F2B33D', fontSize: '22px' }} />
                                                    <span style={{ fontSize: '26px', color: '#F2B33D', fontWeight: 700 }}>
                                                        ความเหมาะสม {career.matchScore}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p style={{
                                            fontSize: '28px', color: '#555555',
                                            lineHeight: 1.65, margin: '0 0 24px',
                                        }}>
                                            {career.description}
                                        </p>

                                        {/* Salary */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center',
                                            gap: '16px',
                                            background: idx === 0 ? '#FEF6E0' : '#F7F7F5',
                                            border: `2px solid ${idx === 0 ? '#F2B33D' : '#E0E0E0'}`,
                                            borderRadius: '16px',
                                            padding: '20px 32px',
                                        }}>
                                            <FaMoneyBillWave style={{
                                                color: idx === 0 ? '#F2B33D' : '#888888',
                                                fontSize: '32px', flexShrink: 0,
                                            }} />
                                            <div>
                                                <p style={{
                                                    fontSize: '22px', color: '#888888',
                                                    fontWeight: 600, margin: '0 0 4px',
                                                    textTransform: 'uppercase', letterSpacing: '0.08em',
                                                }}>
                                                    เงินเดือนโดยประมาณ
                                                </p>
                                                <p style={{
                                                    fontSize: '38px', fontWeight: 900,
                                                    color: idx === 0 ? '#F2B33D' : '#333333',
                                                    margin: 0, lineHeight: 1,
                                                }}>
                                                    {career.salary}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                            : (
                                <p style={{ color: '#AAAAAA', fontSize: '32px' }}>
                                    ยังไม่มีข้อมูลอาชีพแนะนำ
                                </p>
                            )
                        }
                    </div>

                    {/* Footer */}
                    <div style={{
                        marginTop: '32px',
                        paddingTop: '36px',
                        borderTop: '2px solid #EBEBEB',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{
                                background: '#111111', color: '#F2B33D',
                                borderRadius: '12px', padding: '10px 24px',
                                fontSize: '22px', fontWeight: 700, letterSpacing: '0.06em',
                            }}>
                                Discovery Path
                            </div>
                            <div style={{
                                background: '#F2B33D', color: '#111111',
                                borderRadius: '12px', padding: '10px 24px',
                                fontSize: '22px', fontWeight: 700, letterSpacing: '0.06em',
                            }}>
                                Skill Scout
                            </div>
                        </div>
                        <p style={{ fontSize: '28px', fontWeight: 800, color: '#F2B33D', margin: 0 }}>
                            skillscout.site
                        </p>
                    </div>
                </div>
            </div>
        );
    }
);

ShareDiscoveryCard.displayName = 'ShareDiscoveryCard';
export default ShareDiscoveryCard;
