// src/components/common/ShareResultCard.tsx
'use client';

import { forwardRef } from 'react';
import {
    FaWrench, FaMicroscope, FaPaintBrush,
    FaHandshake, FaRocket, FaChartBar,
} from 'react-icons/fa';
import { RIASEC_TYPES } from '@/data/riasec';
import { PathFinderResultWithDetails } from '@/types';

interface ShareResultCardProps {
    result: PathFinderResultWithDetails;
}

const RIASEC_ICON: Record<string, React.ReactElement> = {
    R: <FaWrench />, I: <FaMicroscope />, A: <FaPaintBrush />,
    S: <FaHandshake />, E: <FaRocket />, C: <FaChartBar />,
};

const RIASEC_ACCENT: Record<string, { light: string; color: string }> = {
    R: { light: '#FEF6E0', color: '#F2B33D' },   // gold (แก้จากแดง)
    I: { light: '#dbeafe', color: '#2563eb' },
    A: { light: '#ede9fe', color: '#7c3aed' },
    S: { light: '#dcfce7', color: '#16a34a' },
    E: { light: '#fef9c3', color: '#ca8a04' },
    C: { light: '#f1f5f9', color: '#475569' },
};

function calcSorted(scores: PathFinderResultWithDetails['riasecScores']) {
    const total = Object.values(scores).reduce((s, v) => s + v, 0);
    return Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .map(([code, score]) => ({
            code, score,
            pct: total > 0 ? Math.round((score / total) * 100) : 0,
        }));
}

const ShareResultCard = forwardRef<HTMLDivElement, ShareResultCardProps>(
    ({ result }, ref) => {
        const sorted = calcSorted(result.riasecScores);
        const top2 = sorted.slice(0, 2);
        const topCareers = (result.recommendedCareerDetails ?? []).slice(0, 3);
        const codeLabel = result.topRIASECCodes?.join('')
            ?? top2.map((t) => t.code).join('');

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
                {/* ══════════════ DARK HERO HEADER ══════════════ */}
                <div style={{
                    background: 'linear-gradient(160deg, #111111 0%, #1e1e1e 60%, #2a2200 100%)',
                    padding: '64px 80px 72px',
                    flexShrink: 0,
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Subtle gold glow top-right */}
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

                    {/* Logo + Holland code row */}
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '52px',
                        position: 'relative',
                    }}>
                        {/* Logo */}
                        <div style={{
                            background: 'rgba(255,255,255,0.10)',
                            border: '1.5px solid rgba(255,255,255,0.15)',
                            borderRadius: '20px',
                            padding: '16px 24px',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                        }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/skillscoutLogo.png"
                                alt="SkillScout"
                                style={{ height: '72px', width: 'auto', objectFit: 'contain', display: 'block' }}
                            />
                        </div>
                        {/* Holland Code */}
                        <div style={{
                            background: '#F2B33D',
                            color: '#111111',
                            borderRadius: '24px',
                            padding: '18px 44px',
                            fontSize: '56px',
                            fontWeight: 900,
                            letterSpacing: '0.2em',
                            boxShadow: '0 12px 40px rgba(242,179,61,0.55)',
                            lineHeight: 1,
                        }}>
                            {codeLabel}
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
                            บุคลิกภาพเด่นของฉัน
                        </span>
                    </div>

                    {/* Big personality title */}
                    <h1 style={{
                        fontSize: '96px',
                        fontWeight: 900,
                        color: '#ffffff',
                        margin: 0,
                        lineHeight: 1.12,
                        letterSpacing: '-0.01em',
                    }}>
                        {top2
                            .map((t) => RIASEC_TYPES[t.code as keyof typeof RIASEC_TYPES]?.thaiName ?? t.code)
                            .join(' × ')}
                    </h1>
                </div>

                {/* ══════════════ BODY ══════════════ */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '48px 80px 52px',
                    gap: 0,
                }}>

                    {/* ── RIASEC Cards (stacked) ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '56px' }}>
                        {top2.map(({ code, pct }, idx) => {
                            const info = RIASEC_TYPES[code as keyof typeof RIASEC_TYPES];
                            const acc = RIASEC_ACCENT[code] ?? RIASEC_ACCENT.C;
                            const isFirst = idx === 0;

                            return (
                                <div key={code} style={{
                                    background: '#ffffff',
                                    borderRadius: '28px',
                                    border: `3px solid ${isFirst ? '#F2B33D' : '#EBEBEB'}`,
                                    padding: '44px 48px',
                                    boxShadow: isFirst
                                        ? '0 12px 48px rgba(242,179,61,0.20)'
                                        : '0 4px 20px rgba(0,0,0,0.06)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}>
                                    {/* Icon + Name (inline) — ไม่มี rank badge แล้ว */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                                        {/* Icon */}
                                        <div style={{
                                            width: '88px', height: '88px',
                                            borderRadius: '22px',
                                            background: acc.light,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: acc.color, fontSize: '42px',
                                            flexShrink: 0,
                                        }}>
                                            {RIASEC_ICON[code]}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                fontSize: '24px', color: '#AAAAAA',
                                                fontWeight: 600, margin: '0 0 4px',
                                                textTransform: 'uppercase', letterSpacing: '0.1em',
                                            }}>
                                                {info?.name ?? code}
                                            </p>
                                            <p style={{
                                                fontSize: '58px', fontWeight: 900,
                                                color: '#111111', margin: 0, lineHeight: 1.1,
                                            }}>
                                                {info?.thaiName ?? code}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p style={{
                                        fontSize: '30px', color: '#666666',
                                        lineHeight: 1.65, margin: '0 0 28px',
                                    }}>
                                        {info?.description}
                                    </p>

                                    {/* Progress bar + percentage */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        <div style={{
                                            flex: 1, height: '14px',
                                            borderRadius: '99px',
                                            background: '#F0F0F0',
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                height: '100%', width: `${pct}%`,
                                                background: isFirst
                                                    ? 'linear-gradient(90deg, #F2B33D, #f8d76b)'
                                                    : acc.color,
                                                borderRadius: '99px',
                                            }} />
                                        </div>
                                        <span style={{
                                            fontSize: '48px', fontWeight: 900,
                                            color: isFirst ? '#F2B33D' : acc.color,
                                            minWidth: '120px', textAlign: 'right',
                                        }}>
                                            {pct}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Careers ── */}
                    <div>
                        {/* Section header */}
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            gap: '20px', marginBottom: '28px',
                        }}>
                            <div style={{
                                width: '56px', height: '56px',
                                borderRadius: '16px',
                                background: '#111111',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#F2B33D', fontSize: '28px',
                            }}>
                                <FaRocket />
                            </div>
                            <span style={{
                                fontSize: '32px', fontWeight: 800,
                                color: '#111111',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                            }}>
                                อาชีพที่แนะนำ
                            </span>
                        </div>

                        {/* Career list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {topCareers.length > 0
                                ? topCareers.map((career, idx) => (
                                    <div key={career.id} style={{
                                        display: 'flex', alignItems: 'center',
                                        gap: '28px',
                                        background: '#ffffff',
                                        border: '2px solid #EBEBEB',
                                        borderRadius: '20px',
                                        padding: '24px 36px',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                                    }}>
                                        <div style={{
                                            width: '68px', height: '68px',
                                            borderRadius: '18px',
                                            background: idx === 0
                                                ? '#F2B33D'
                                                : idx === 1 ? '#111111' : '#F0F0F0',
                                            color: idx === 0 ? '#111' : idx === 1 ? '#F2B33D' : '#777',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '28px', fontWeight: 900,
                                            flexShrink: 0,
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p style={{
                                                fontWeight: 800, fontSize: '38px',
                                                color: '#111111', margin: '0 0 6px', lineHeight: 1.15,
                                            }}>
                                                {career.nameTh}
                                            </p>
                                            <p style={{
                                                fontSize: '26px', color: '#AAAAAA', margin: 0,
                                            }}>
                                                {career.name}
                                            </p>
                                        </div>
                                    </div>
                                ))
                                : (
                                    <p style={{ color: '#AAAAAA', fontSize: '32px' }}>
                                        ยังไม่มีข้อมูลอาชีพแนะนำ
                                    </p>
                                )
                            }
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div style={{
                        marginTop: 'auto',
                        paddingTop: '36px',
                        borderTop: '2px solid #EBEBEB',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        {/* Keywords badges */}
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{
                                background: '#111111',
                                color: '#F2B33D',
                                borderRadius: '12px',
                                padding: '10px 24px',
                                fontSize: '22px',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                            }}>
                                Path Finder
                            </div>
                            <div style={{
                                background: '#F2B33D',
                                color: '#111111',
                                borderRadius: '12px',
                                padding: '10px 24px',
                                fontSize: '22px',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                            }}>
                                Skill Scout
                            </div>
                        </div>
                        {/* URL */}
                        <p style={{ fontSize: '28px', fontWeight: 800, color: '#F2B33D', margin: 0 }}>
                            skillscout.site
                        </p>
                    </div>

                </div>
            </div>
        );
    }
);

ShareResultCard.displayName = 'ShareResultCard';
export default ShareResultCard;
