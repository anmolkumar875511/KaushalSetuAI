import React, { useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import SkillGapChart from '../components/SkillGapChart';
import ProgressBar from '../components/ProgressBar';
import { ResumeContext } from '../context/ResumeContext';
import {
    FileSearch,
    Sparkles,
    ArrowRight,
    RotateCcw,
    LayoutDashboard,
    Loader2,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const Report = () => {
    const { user } = useContext(AuthContext);
    const { resume } = useContext(ResumeContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    const { opportunityId } = useParams();
    const navigate = useNavigate();

    const [matchedSkills, setMatchedSkills] = useState([]);
    const [unmatchedSkills, setUnmatchedSkills] = useState([]);
    const [matchedPercentage, setMatchedPercentage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const isResumeEmpty = !resume || (Array.isArray(resume) && resume.length === 0);

    useEffect(() => {
        if (isResumeEmpty) {
            setIsLoading(false);
            return;
        }
        const fetchSkillGap = async () => {
            try {
                setIsLoading(true);
                const res = await axiosInstance.get(`/skillgap/analyze/${opportunityId}`);
                const data = res.data.data;
                setMatchedSkills(data.matchedSkills || []);
                setUnmatchedSkills(data.missingSkills || []);
                setMatchedPercentage(data.matchPercentage || 0);
            } catch (err) {
                console.error(err.response?.data?.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSkillGap();
    }, [opportunityId, isResumeEmpty]);

    const createRoadmap = async () => {
        try {
            setGenerating(true);
            await axiosInstance.post(`/roadmap/generate/${opportunityId}`);
            navigate('/Dashboard');
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    /* ── Shared ── */
    const labelStyle = {
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        margin: 0,
    };

    const cardStyle = {
        border: `1px solid ${colors.border}`,
        borderRadius: radius.lg,
        backgroundColor: colors.bgCard,
        boxShadow: shadow.sm,
    };

    /* ════════════════════════════
       RESUME MISSING
    ════════════════════════════ */
    if (isResumeEmpty) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: colors.bgPage,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    fontFamily: font.body,
                }}
            >
                <GlobalStyles colors={colors} />
                <div
                    style={{
                        ...cardStyle,
                        maxWidth: 380,
                        width: '100%',
                        padding: 'clamp(1.5rem, 5vw, 2rem)',
                        textAlign: 'center',
                        animation: 'fadeUp 0.3s ease',
                    }}
                >
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: radius.md,
                            backgroundColor: `${colors.primary}15`,
                            color: colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                        }}
                    >
                        <FileSearch size={20} />
                    </div>
                    <h2
                        style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: colors.textOnBg,
                            fontFamily: font.display,
                            margin: 0,
                            marginBottom: 8,
                        }}
                    >
                        Resume Missing
                    </h2>
                    <p
                        style={{
                            fontSize: '0.825rem',
                            color: colors.textSub,
                            lineHeight: 1.7,
                            margin: 0,
                            marginBottom: '1.5rem',
                        }}
                    >
                        To analyze your skill gap and generate a custom roadmap, we first need to
                        process your professional experience.
                    </p>
                    <button
                        onClick={() => navigate('/Resume')}
                        className="primary-btn"
                        style={{
                            width: '100%',
                            padding: '0.7rem',
                            backgroundColor: colors.primary,
                            color: '#fff',
                            border: 'none',
                            borderRadius: radius.md,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            cursor: 'pointer',
                            fontFamily: font.body,
                            transition: transition.fast,
                        }}
                    >
                        Upload Resume
                    </button>
                </div>
            </div>
        );
    }

    /* ════════════════════════════
       LOADING
    ════════════════════════════ */
    if (isLoading) {
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
                <div style={{ textAlign: 'center' }}>
                    <Loader2
                        size={20}
                        style={{
                            color: colors.primary,
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 8px',
                        }}
                    />
                    <p style={{ ...labelStyle, opacity: 0.7 }}>Analyzing Skills…</p>
                </div>
            </div>
        );
    }

    /* ════════════════════════════
       PERFECT MATCH
    ════════════════════════════ */
    if (matchedSkills.length === 0 && unmatchedSkills.length === 0) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: colors.bgPage,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    fontFamily: font.body,
                }}
            >
                <GlobalStyles colors={colors} />
                <div
                    style={{
                        ...cardStyle,
                        maxWidth: 380,
                        width: '100%',
                        padding: 'clamp(1.5rem, 5vw, 2rem)',
                        textAlign: 'center',
                        animation: 'fadeUp 0.3s ease',
                    }}
                >
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: radius.md,
                            backgroundColor: `${colors.secondary}15`,
                            color: colors.secondary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                        }}
                    >
                        <Sparkles size={20} />
                    </div>
                    <h2
                        style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: colors.textOnBg,
                            fontFamily: font.display,
                            margin: 0,
                            marginBottom: 8,
                        }}
                    >
                        Perfect Match!
                    </h2>
                    <p
                        style={{
                            fontSize: '0.825rem',
                            color: colors.textSub,
                            lineHeight: 1.7,
                            margin: 0,
                            marginBottom: '1.5rem',
                        }}
                    >
                        Your profile fully aligns with this opportunity. No additional roadmap is
                        required.
                    </p>
                    <button
                        onClick={() => navigate('/opportunities')}
                        className="ghost-btn"
                        style={{
                            width: '100%',
                            padding: '0.7rem',
                            backgroundColor: colors.bgMuted,
                            color: colors.textMain,
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.md,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            cursor: 'pointer',
                            fontFamily: font.body,
                            transition: transition.fast,
                        }}
                    >
                        Back to Opportunities
                    </button>
                </div>
            </div>
        );
    }

    /* ════════════════════════════
       MAIN REPORT
    ════════════════════════════ */
    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} />

            <div
                style={{
                    maxWidth: 860,
                    margin: '0 auto',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                }}
            >
                {/* ── HEADER CARD ── */}
                <div style={{ ...cardStyle, padding: '1.25rem 1.5rem' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.875rem',
                            gap: '1rem',
                        }}
                    >
                        <div>
                            <p style={{ ...labelStyle, marginBottom: 3 }}>Analysis Report</p>
                            <h1
                                style={{
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    color: colors.textOnBg,
                                    fontFamily: font.display,
                                    margin: 0,
                                }}
                            >
                                Job Compatibility
                            </h1>
                        </div>
                        <span
                            style={{
                                fontSize: '2rem',
                                fontWeight: 700,
                                color: colors.primary,
                                lineHeight: 1,
                                flexShrink: 0,
                                fontFamily: font.mono,
                            }}
                        >
                            {matchedPercentage}%
                        </span>
                    </div>
                    <ProgressBar value={matchedPercentage} />
                </div>

                {/* ── CHART + ACTION ── */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '0.75rem',
                    }}
                >
                    {/* Chart */}
                    <SkillGapChart
                        matchedCount={matchedSkills.length}
                        unmatchedCount={unmatchedSkills.length}
                    />

                    {/* Bridge the gap */}
                    <div
                        style={{
                            ...cardStyle,
                            padding: '1.25rem 1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: '0.875rem',
                        }}
                    >
                        <div>
                            <p style={{ ...labelStyle, marginBottom: 5 }}>Skill Gap</p>
                            <h3
                                style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    color: colors.textMain,
                                    margin: 0,
                                    marginBottom: 6,
                                }}
                            >
                                Bridge the Gap
                            </h3>
                            <p
                                style={{
                                    fontSize: '0.825rem',
                                    color: colors.textSub,
                                    lineHeight: 1.65,
                                    margin: 0,
                                }}
                            >
                                We've identified{' '}
                                <span style={{ fontWeight: 700, color: colors.textMain }}>
                                    {unmatchedSkills.length} missing skills
                                </span>
                                . Generate an AI roadmap to reach 100% eligibility.
                            </p>
                        </div>

                        <button
                            onClick={createRoadmap}
                            disabled={generating}
                            className="primary-btn"
                            style={{
                                width: '100%',
                                padding: '0.7rem',
                                backgroundColor: generating ? colors.border : colors.primary,
                                color: '#fff',
                                border: 'none',
                                borderRadius: radius.md,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 7,
                                cursor: generating ? 'not-allowed' : 'pointer',
                                opacity: generating ? 0.7 : 1,
                                transition: transition.fast,
                                fontFamily: font.body,
                            }}
                        >
                            {generating ? (
                                <>
                                    <Loader2
                                        size={13}
                                        style={{ animation: 'spin 1s linear infinite' }}
                                    />{' '}
                                    Generating…
                                </>
                            ) : (
                                <>
                                    Generate AI Roadmap <ArrowRight size={13} />
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => navigate('/opportunities')}
                            className="inline-link"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 5,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: colors.textSub,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: font.mono,
                                transition: transition.fast,
                            }}
                        >
                            <RotateCcw size={11} /> Re-evaluate Selection
                        </button>
                    </div>
                </div>

                {/* ── DASHBOARD LINK ── */}
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.5rem' }}>
                    <button
                        onClick={() => navigate('/Dashboard')}
                        className="inline-link"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: colors.textSub,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: font.mono,
                            transition: transition.fast,
                        }}
                    >
                        <LayoutDashboard size={12} /> Go to My Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .primary-btn:hover:not(:disabled) { opacity: 0.88 !important; }
        .ghost-btn:hover   { background-color: ${colors.bgHover} !important; }
        .inline-link:hover { color: ${colors.textMain} !important; }
    `}</style>
);

export default Report;
