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
    userName?: string;
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
    ({ result, userName }, ref) => {
        const sorted = calcSorted(result.riasecScores);
        const top2 = sorted.slice(0, 2);
        const topCareers = (result.recommendedCareerDetails ?? []).slice(0, 2);
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
                {/* ══════════════ YELLOW HERO HEADER ══════════════ */}
                <div style={{
                    background: '#F2B33D',
                    padding: '64px 80px 72px',
                    flexShrink: 0,
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Solid decorative pattern top-right */}
                    <div style={{
                        position: 'absolute', top: '-60px', right: '-60px',
                        width: '500px', height: '500px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        pointerEvents: 'none',
                    }} />
                    {/* Dark bottom bar */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '6px',
                        background: '#2C2C2C',
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
                            background: 'rgba(255,255,255,0.35)',
                            border: '2px solid rgba(0,0,0,0.12)',
                            borderRadius: '20px',
                            padding: '16px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                        }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/skillscoutLogo-dark.png"
                                alt="SkillScout"
                                style={{ height: '72px', width: 'auto', objectFit: 'contain', display: 'block' }}
                            />
                        </div>
                        {/* Holland Code */}
                        <div style={{
                            background: '#2C2C2C',
                            color: '#F2B33D',
                            borderRadius: '24px',
                            padding: '18px 44px',
                            fontSize: '56px',
                            fontWeight: 900,
                            letterSpacing: '0.2em',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                            lineHeight: 1,
                        }}>
                            {codeLabel}
                        </div>
                    </div>

                    {/* Label chip — personality */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center',
                        background: 'rgba(0,0,0,0.12)',
                        border: '1.5px solid rgba(0,0,0,0.20)',
                        borderRadius: '99px',
                        padding: '10px 32px',
                        marginBottom: '24px',
                    }}>
                        <span style={{
                            fontSize: '26px', color: '#2C2C2C',
                            fontWeight: 700, letterSpacing: '0.04em',
                        }}>
                            {top2
                                .map((t) => RIASEC_TYPES[t.code as keyof typeof RIASEC_TYPES]?.thaiName ?? t.code)
                                .join(' × ')}
                        </span>
                    </div>

                    {/* Big title — username */}
                    <div style={{ margin: 0 }}>
                        <p style={{
                            fontSize: '44px',
                            fontWeight: 700,
                            color: 'rgba(44,44,44,0.65)',
                            margin: '0 0 4px',
                            lineHeight: 1.2,
                        }}>
                            บุคลิกภาพเด่นของ
                        </p>
                        <p style={{
                            fontSize: '100px',
                            fontWeight: 900,
                            color: '#2C2C2C',
                            margin: 0,
                            lineHeight: 1.05,
                            letterSpacing: '-0.02em',
                        }}>
                            {userName ?? 'คุณ'}
                        </p>
                    </div>
                </div>

                {/* ══════════════ BODY ══════════════ */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '36px 80px 36px',
                    gap: 0,
                }}>

                    {/* ── RIASEC Cards (stacked) ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                        {top2.map(({ code, pct }, idx) => {
                            const info = RIASEC_TYPES[code as keyof typeof RIASEC_TYPES];
                            const isFirst = idx === 0;

                            return (
                                <div key={code} style={{
                                    background: '#ffffff',
                                    borderRadius: '24px',
                                    border: `3px solid ${isFirst ? '#F2B33D' : '#EBEBEB'}`,
                                    padding: '24px 40px',
                                    boxShadow: isFirst
                                        ? '0 8px 36px rgba(242,179,61,0.20)'
                                        : '0 4px 16px rgba(0,0,0,0.05)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}>
                                    {/* Icon + Name (inline) */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                                        {/* Icon */}
                                        <div style={{
                                            width: '72px', height: '72px',
                                            borderRadius: '18px',
                                            background: isFirst ? '#F2B33D' : '#C0C0C0',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: isFirst ? '#2C2C2C' : '#ffffff',
                                            fontSize: '34px',
                                            flexShrink: 0,
                                        }}>
                                            {RIASEC_ICON[code]}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                fontSize: '22px', color: '#AAAAAA',
                                                fontWeight: 600, margin: '0 0 2px',
                                                textTransform: 'uppercase', letterSpacing: '0.1em',
                                            }}>
                                                {info?.name ?? code}
                                            </p>
                                            <p style={{
                                                fontSize: '48px', fontWeight: 900,
                                                color: '#2C2C2C', margin: 0, lineHeight: 1.1,
                                            }}>
                                                {info?.thaiName ?? code}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p style={{
                                        fontSize: '26px', color: '#666666',
                                        lineHeight: 1.6, margin: '0 0 20px',
                                    }}>
                                        {info?.description}
                                    </p>

                                    {/* Progress bar + percentage */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{
                                            flex: 1, height: '12px',
                                            borderRadius: '99px',
                                            background: '#F0F0F0',
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                height: '100%', width: `${pct}%`,
                                                background: isFirst ? '#F2B33D' : '#C0C0C0',
                                                borderRadius: '99px',
                                            }} />
                                        </div>
                                        <span style={{
                                            fontSize: '40px', fontWeight: 900,
                                            color: isFirst ? '#F2B33D' : '#C0C0C0',
                                            minWidth: '100px', textAlign: 'right',
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
                            gap: '20px', marginBottom: '20px',
                        }}>
                            <div style={{
                                width: '56px', height: '56px',
                                borderRadius: '16px',
                                background: '#2C2C2C',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#F2B33D', fontSize: '28px',
                            }}>
                                <FaRocket />
                            </div>
                            <span style={{
                                fontSize: '32px', fontWeight: 800,
                                color: '#2C2C2C',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                            }}>
                                อาชีพที่แนะนำ
                            </span>
                        </div>

                        {/* Career list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                                            background: idx === 0 ? '#F2B33D' : '#2C2C2C',
                                            color: idx === 0 ? '#2C2C2C' : '#F2B33D',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '28px', fontWeight: 900,
                                            flexShrink: 0,
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p style={{
                                                fontWeight: 800, fontSize: '38px',
                                                color: '#2C2C2C', margin: '0 0 6px', lineHeight: 1.15,
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

                    {/* ── QR + Invite Footer ── */}
                    <div style={{
                        marginTop: 'auto',
                        paddingTop: '24px',
                        borderTop: '2px solid #EBEBEB',
                    }}>
                        {/* QR invite block */}
                        <div style={{
                            background: '#2C2C2C',
                            borderRadius: '28px',
                            padding: '28px 40px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '40px',
                        }}>
                            {/* QR Code */}
                            <div style={{
                                background: '#ffffff',
                                borderRadius: '20px',
                                padding: '16px',
                                flexShrink: 0,
                                boxShadow: '0 0 0 4px #F2B33D',
                            }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/skillscout-qr.png"
                                    alt="QR SkillScout"
                                    style={{ width: '160px', height: '160px', display: 'block', objectFit: 'contain' }}
                                />
                            </div>

                            {/* Invite text */}
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    fontSize: '22px',
                                    color: '#F2B33D',
                                    fontWeight: 700,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    margin: '0 0 8px',
                                }}>
                                    ค้นพบบุคลิกภาพของคุณ
                                </p>
                                <p style={{
                                    fontSize: '46px',
                                    fontWeight: 900,
                                    color: '#ffffff',
                                    margin: '0 0 6px',
                                    lineHeight: 1.2,
                                }}>
                                    สแกนเพื่อทำแบบทดสอบ!
                                </p>
                                <p style={{
                                    fontSize: '28px',
                                    color: '#AAAAAA',
                                    margin: '0 0 12px',
                                    lineHeight: 1.5,
                                }}>
                                    ค้นหาอาชีพ IT ที่ใช่ · ร่วมค่ายที่เหมาะกับคุณ
                                </p>
                                <div style={{
                                    display: 'inline-block',
                                    background: '#F2B33D',
                                    color: '#2C2C2C',
                                    borderRadius: '12px',
                                    padding: '10px 28px',
                                    fontSize: '30px',
                                    fontWeight: 900,
                                    letterSpacing: '0.05em',
                                }}>
                                    skillscout.site
                                </div>
                            </div>
                        </div>

                        {/* Bottom badges */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '20px',
                        }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{
                                    background: '#2C2C2C',
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
                                    color: '#2C2C2C',
                                    borderRadius: '12px',
                                    padding: '10px 24px',
                                    fontSize: '22px',
                                    fontWeight: 700,
                                    letterSpacing: '0.06em',
                                }}>
                                    Skill Scout
                                </div>
                            </div>
                            <p style={{ fontSize: '26px', fontWeight: 800, color: '#AAAAAA', margin: 0 }}>
                                #ค้นหาตัวเอง · #ITCareer
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
);

ShareResultCard.displayName = 'ShareResultCard';
export default ShareResultCard;
