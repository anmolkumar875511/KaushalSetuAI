import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext.jsx';
import { getThemeColors } from '../theme';
import { ClipboardList, Clock, ChevronRight, Loader2 } from 'lucide-react';

const PastAssessments = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                const res = await axiosInstance.get('/assessment');
                setAssessments(res.data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssessments();
    }, []);

    /* ── Shared ── */
    const labelStyle = {
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        margin: 0,
    };

    /* ── Skeleton ── */
    const SkeletonCard = ({ i }) => (
        <div
            style={{
                border: `1px solid ${colors.border}`,
                borderRadius: radius.lg,
                padding: '1.25rem',
                backgroundColor: colors.bgCard,
                animation: `pulse 1.5s ease ${i * 0.08}s infinite`,
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                    style={{
                        height: 15,
                        width: '60%',
                        borderRadius: 4,
                        backgroundColor: colors.border,
                    }}
                />
                <div
                    style={{
                        height: 10,
                        width: '30%',
                        borderRadius: 4,
                        backgroundColor: colors.border,
                    }}
                />
                <div
                    style={{
                        height: 10,
                        width: '45%',
                        borderRadius: 4,
                        backgroundColor: colors.border,
                    }}
                />
                <div
                    style={{
                        height: 10,
                        width: '45%',
                        borderRadius: 4,
                        backgroundColor: colors.border,
                    }}
                />
                <div
                    style={{
                        height: 34,
                        borderRadius: radius.md,
                        backgroundColor: colors.border,
                        marginTop: 8,
                    }}
                />
            </div>
        </div>
    );

    /* ── Loading ── */
    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: colors.bgPage,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: font.body,
                }}
            >
                <GlobalStyles colors={colors} />
                <Loader2
                    size={18}
                    style={{ color: colors.textSub, animation: 'spin 1s linear infinite' }}
                />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} font={font} />

            <div
                style={{
                    maxWidth: 1080,
                    margin: '0 auto',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem',
                }}
            >
                {/* ── HEADER ── */}
                <div style={{ marginBottom: '1.75rem', animation: 'fadeUp 0.3s ease' }}>
                    <p style={{ ...labelStyle, marginBottom: 4 }}>History</p>
                    <h1
                        style={{
                            fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                            fontWeight: 700,
                            color: colors.textOnBg,
                            fontFamily: font.display,
                            margin: 0,
                        }}
                    >
                        Past Assessments
                    </h1>
                </div>

                {/* ── EMPTY STATE ── */}
                {assessments.length === 0 ? (
                    <div
                        style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.lg,
                            backgroundColor: colors.bgCard,
                            padding: '3rem 1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.75rem',
                            textAlign: 'center',
                            animation: 'fadeUp 0.3s ease',
                        }}
                    >
                        <ClipboardList size={32} style={{ color: colors.textMuted }} />
                        <p style={{ fontSize: '0.875rem', color: colors.textSub, margin: 0 }}>
                            No assessments attempted yet
                        </p>
                    </div>
                ) : (
                    <>
                        <p style={{ ...labelStyle, marginBottom: '1rem' }}>
                            {assessments.length} assessment{assessments.length !== 1 ? 's' : ''}
                        </p>

                        {/* ── GRID ── */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                gap: '0.75rem',
                            }}
                        >
                            {assessments.map((a, i) => (
                                <AssessmentCard
                                    key={a._id}
                                    a={a}
                                    index={i}
                                    colors={colors}
                                    font={font}
                                    radius={radius}
                                    shadow={shadow}
                                    transition={transition}
                                    onView={() => navigate(`/assessment/${a._id}`)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   ASSESSMENT CARD
───────────────────────────────────────────── */
const AssessmentCard = ({ a, index, colors, font, radius, shadow, transition, onView }) => {
    const score = a.score ?? null;
    const scoreColor =
        score === null
            ? colors.textSub
            : score >= 70
              ? colors.success
              : score >= 40
                ? colors.warning
                : colors.danger;

    return (
        <div
            className="assess-card"
            style={{
                border: `1px solid ${colors.border}`,
                borderRadius: radius.lg,
                backgroundColor: colors.bgCard,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: shadow.sm,
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                animation: `fadeUp 0.28s ease ${index * 0.04}s both`,
            }}
        >
            {/* Top */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Topic */}
                <div>
                    <h2
                        style={{
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: colors.textMain,
                            margin: 0,
                            marginBottom: 3,
                            textTransform: 'capitalize',
                        }}
                    >
                        {a.topic}
                    </h2>
                    <p
                        style={{
                            fontSize: '0.65rem',
                            fontStyle: 'italic',
                            color: colors.primary,
                            margin: 0,
                            fontFamily: font.mono,
                        }}
                    >
                        Assessment
                    </p>
                </div>

                {/* Score */}
                <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3 }}>
                    <span
                        style={{
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            color: scoreColor,
                            lineHeight: 1,
                        }}
                    >
                        {score ?? '—'}
                    </span>
                    <span
                        style={{ fontSize: '0.7rem', color: colors.textSub, fontFamily: font.mono }}
                    >
                        /100
                    </span>
                </div>

                {/* Details */}
                <div
                    style={{
                        paddingTop: '0.625rem',
                        borderTop: `1px solid ${colors.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.3rem',
                    }}
                >
                    {a.timeStarted && (
                        <p
                            style={{
                                fontSize: '0.72rem',
                                color: colors.textSub,
                                margin: 0,
                                fontFamily: font.mono,
                            }}
                        >
                            Start · {new Date(a.timeStarted).toLocaleString()}
                        </p>
                    )}
                    {a.timeCompleted && (
                        <p
                            style={{
                                fontSize: '0.72rem',
                                color: colors.textSub,
                                margin: 0,
                                fontFamily: font.mono,
                            }}
                        >
                            End · {new Date(a.timeCompleted).toLocaleString()}
                        </p>
                    )}
                    {a.duration && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                fontSize: '0.72rem',
                                color: colors.textSub,
                                fontFamily: font.mono,
                            }}
                        >
                            <Clock size={11} /> {Math.round(a.duration)}s
                        </div>
                    )}
                </div>
            </div>

            {/* CTA */}
            <button
                onClick={onView}
                className="assess-cta"
                style={{
                    marginTop: '1rem',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    padding: '0.6rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.md,
                    backgroundColor: colors.bgMuted,
                    color: colors.textMain,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    transition: transition.fast,
                    fontFamily: font.body,
                }}
            >
                View Assessment <ChevronRight size={12} />
            </button>
        </div>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse  { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .assess-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
        .assess-cta:hover  { background-color: ${colors?.bgHover} !important; }
    `}</style>
);

export default PastAssessments;
