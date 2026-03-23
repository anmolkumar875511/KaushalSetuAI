import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext.jsx';
import { getThemeColors } from '../theme';
import {
    Loader2,
    Target,
    TrendingUp,
    AlertCircle,
    RotateCcw,
    ChevronLeft,
    Trophy,
} from 'lucide-react';

const InterviewResults = () => {
    const { interviewId } = useParams();
    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow } = getThemeColors(user?.theme || 'light');
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axiosInstance.get(`/mock-interview/${interviewId}`);
                setInterview(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [interviewId]);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: colors.bgPage,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <GlobalStyles colors={colors} />
                <Loader2
                    size={20}
                    style={{ color: colors.textSub, animation: 'spin 1s linear infinite' }}
                />
            </div>
        );
    }

    if (!interview) {
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
                <p style={{ color: colors.textSub }}>Interview not found.</p>
            </div>
        );
    }

    const score = interview.overallScore ?? 0;
    const scoreColor = score >= 70 ? colors.success : score >= 45 ? colors.warning : colors.danger;
    const durationStr = interview.duration
        ? `${Math.floor(interview.duration / 60)}m ${interview.duration % 60}s`
        : null;

    const ghostBtn = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '0.5rem 1rem',
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        backgroundColor: 'transparent',
        color: colors.textMain,
        fontSize: '0.8rem',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: font.body,
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} />
            <div
                style={{
                    maxWidth: 760,
                    margin: '0 auto',
                    padding: 'clamp(2rem, 5vw, 3rem) 1.25rem',
                }}
            >
                {/* Back */}
                <button
                    onClick={() => navigate('/past_interviews')}
                    style={{ ...ghostBtn, marginBottom: '1.5rem' }}
                >
                    <ChevronLeft size={13} /> Back
                </button>

                {/* Hero */}
                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: '2.5rem',
                        animation: 'fadeUp 0.3s ease',
                    }}
                >
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 90,
                            height: 90,
                            borderRadius: '50%',
                            border: `3px solid ${scoreColor}`,
                            marginBottom: 16,
                        }}
                    >
                        <span
                            style={{
                                fontSize: '1.75rem',
                                fontWeight: 900,
                                color: scoreColor,
                                fontFamily: font.mono,
                            }}
                        >
                            {score}
                        </span>
                    </div>
                    <h1
                        style={{
                            fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
                            fontWeight: 700,
                            color: colors.textOnBg,
                            fontFamily: font.display,
                            margin: '0 0 6px',
                        }}
                    >
                        Interview Report
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: colors.textSub, margin: '0 0 4px' }}>
                        {interview.jobRole} ·{' '}
                        <span style={{ textTransform: 'capitalize' }}>
                            {interview.experienceLevel}
                        </span>
                    </p>
                    {durationStr && (
                        <p
                            style={{
                                fontSize: '0.75rem',
                                color: colors.textMuted,
                                fontFamily: font.mono,
                                margin: 0,
                            }}
                        >
                            Completed in {durationStr} · {interview.totalQuestions} questions
                        </p>
                    )}
                </div>

                {/* Overall feedback */}
                {interview.overallFeedback && (
                    <div
                        style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.lg,
                            backgroundColor: colors.bgCard,
                            padding: '1.5rem',
                            marginBottom: '1.25rem',
                            animation: 'fadeUp 0.3s ease 0.05s both',
                            boxShadow: shadow.sm,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 10,
                            }}
                        >
                            <Target size={15} style={{ color: colors.primary }} />
                            <span
                                style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    color: colors.textMain,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                Overall Feedback
                            </span>
                        </div>
                        <p
                            style={{
                                fontSize: '0.9rem',
                                color: colors.textSub,
                                lineHeight: 1.7,
                                margin: 0,
                            }}
                        >
                            {interview.overallFeedback}
                        </p>
                    </div>
                )}

                {/* Strengths + Improvements */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1.25rem',
                        animation: 'fadeUp 0.3s ease 0.1s both',
                    }}
                >
                    {interview.strengths?.length > 0 && (
                        <div
                            style={{
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.lg,
                                backgroundColor: colors.bgCard,
                                padding: '1.25rem',
                                boxShadow: shadow.sm,
                            }}
                        >
                            <p
                                style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    color: colors.success,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    marginBottom: 12,
                                }}
                            >
                                Strengths
                            </p>
                            {interview.strengths.map((s, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 8,
                                        marginBottom: 8,
                                    }}
                                >
                                    <TrendingUp
                                        size={13}
                                        style={{
                                            color: colors.success,
                                            flexShrink: 0,
                                            marginTop: 2,
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontSize: '0.82rem',
                                            color: colors.textSub,
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {s}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    {interview.areasToImprove?.length > 0 && (
                        <div
                            style={{
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.lg,
                                backgroundColor: colors.bgCard,
                                padding: '1.25rem',
                                boxShadow: shadow.sm,
                            }}
                        >
                            <p
                                style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    color: colors.warning,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    marginBottom: 12,
                                }}
                            >
                                Areas to Improve
                            </p>
                            {interview.areasToImprove.map((s, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 8,
                                        marginBottom: 8,
                                    }}
                                >
                                    <AlertCircle
                                        size={13}
                                        style={{
                                            color: colors.warning,
                                            flexShrink: 0,
                                            marginTop: 2,
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontSize: '0.82rem',
                                            color: colors.textSub,
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {s}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Per-question breakdown */}
                {interview.answers?.length > 0 && (
                    <div style={{ animation: 'fadeUp 0.3s ease 0.15s both' }}>
                        <p
                            style={{
                                fontSize: 10,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                color: colors.textSub,
                                fontFamily: font.mono,
                                marginBottom: '1rem',
                            }}
                        >
                            Question Breakdown
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {interview.answers.map((a, i) => {
                                const ev = a.aiEvaluation;
                                const sc = ev?.score ?? 0;
                                const sColor =
                                    sc >= 8
                                        ? colors.success
                                        : sc >= 5
                                          ? colors.warning
                                          : colors.danger;
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: radius.lg,
                                            backgroundColor: colors.bgCard,
                                            overflow: 'hidden',
                                            boxShadow: shadow.sm,
                                        }}
                                    >
                                        <div
                                            style={{
                                                padding: '1rem 1.25rem',
                                                borderBottom: `1px solid ${colors.border}`,
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                justifyContent: 'space-between',
                                                gap: 12,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: 10,
                                                    flex: 1,
                                                    minWidth: 0,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: '0.7rem',
                                                        fontFamily: font.mono,
                                                        color: colors.textMuted,
                                                        flexShrink: 0,
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    Q{i + 1}
                                                </span>
                                                <p
                                                    style={{
                                                        fontSize: '0.875rem',
                                                        fontWeight: 600,
                                                        color: colors.textMain,
                                                        margin: 0,
                                                        lineHeight: 1.5,
                                                    }}
                                                >
                                                    {a.question}
                                                </p>
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 700,
                                                    color: sColor,
                                                    fontFamily: font.mono,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {sc}/10
                                            </span>
                                        </div>
                                        {a.userAnswer && (
                                            <div
                                                style={{
                                                    padding: '0.875rem 1.25rem',
                                                    borderBottom: `1px solid ${colors.border}`,
                                                    backgroundColor: colors.bgMuted,
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        fontSize: '0.68rem',
                                                        fontWeight: 700,
                                                        color: colors.textMuted,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.1em',
                                                        marginBottom: 5,
                                                    }}
                                                >
                                                    Your Answer
                                                </p>
                                                <p
                                                    style={{
                                                        fontSize: '0.82rem',
                                                        color: colors.textSub,
                                                        lineHeight: 1.6,
                                                        margin: 0,
                                                    }}
                                                >
                                                    {a.userAnswer}
                                                </p>
                                            </div>
                                        )}
                                        {ev?.feedback && (
                                            <div style={{ padding: '0.875rem 1.25rem' }}>
                                                <p
                                                    style={{
                                                        fontSize: '0.82rem',
                                                        color: colors.textSub,
                                                        lineHeight: 1.6,
                                                        marginBottom: ev?.idealAnswer ? 10 : 0,
                                                    }}
                                                >
                                                    {ev.feedback}
                                                </p>
                                                {ev.idealAnswer && (
                                                    <details>
                                                        <summary
                                                            style={{
                                                                fontSize: '0.72rem',
                                                                color: colors.textSub,
                                                                cursor: 'pointer',
                                                                fontWeight: 600,
                                                                userSelect: 'none',
                                                            }}
                                                        >
                                                            View ideal answer
                                                        </summary>
                                                        <p
                                                            style={{
                                                                fontSize: '0.8rem',
                                                                color: colors.textSub,
                                                                lineHeight: 1.65,
                                                                marginTop: 6,
                                                                paddingLeft: 10,
                                                                borderLeft: `2px solid ${colors.border}`,
                                                            }}
                                                        >
                                                            {ev.idealAnswer}
                                                        </p>
                                                    </details>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div
                    style={{
                        display: 'flex',
                        gap: '0.75rem',
                        marginTop: '2rem',
                        flexWrap: 'wrap',
                        animation: 'fadeUp 0.3s ease 0.2s both',
                    }}
                >
                    <button
                        onClick={() => navigate('/mock-interview')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '0.6rem 1.4rem',
                            border: 'none',
                            borderRadius: radius.md,
                            backgroundColor: colors.primary,
                            color: '#fff',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: font.body,
                        }}
                    >
                        <RotateCcw size={14} /> New Interview
                    </button>
                    <button onClick={() => navigate('/past_interviews')} style={{ ...ghostBtn }}>
                        <Trophy size={13} /> All Interviews
                    </button>
                </div>
            </div>
        </div>
    );
};

const GlobalStyles = ({ colors }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        details summary::-webkit-details-marker { display: none; }
        details summary::marker { display: none; }
    `}</style>
);

export default InterviewResults;
