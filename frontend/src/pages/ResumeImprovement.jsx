import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';
import {
    Sparkles,
    ChevronLeft,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    Info,
    Tag,
    Target,
    FileText,
    Zap,
    TrendingUp,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const DIMENSION_META = {
    summary: { label: 'Summary', icon: FileText },
    skills: { label: 'Skills', icon: Zap },
    experience: { label: 'Experience', icon: TrendingUp },
    projects: { label: 'Projects', icon: Target },
    overall: { label: 'ATS / Overall', icon: Tag },
};

const SEVERITY_CONFIG = (colors) => ({
    critical: {
        color: colors.danger,
        bg: colors.danger + '12',
        icon: AlertTriangle,
        label: 'Critical',
    },
    warning: {
        color: colors.warning,
        bg: colors.warning + '12',
        icon: AlertTriangle,
        label: 'Warning',
    },
    good: { color: colors.success, bg: colors.success + '12', icon: CheckCircle2, label: 'Good' },
});

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const ResumeImprovement = () => {
    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);
    const [activeDim, setActiveDim] = useState('summary');

    const severityConfig = SEVERITY_CONFIG(colors);

    /* ── Fetch report ── */
    const handleAnalyse = async () => {
        setLoading(true);
        setError(null);
        setReport(null);
        try {
            const res = await axiosInstance.post('/resume/improve');
            setReport(res.data.data);
            setActiveDim('summary');
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    'Failed to analyse resume. Please ensure your resume is uploaded.'
            );
        } finally {
            setLoading(false);
        }
    };

    /* ── Score ring ── */
    const ScoreRing = ({ score, size = 80, stroke = 6 }) => {
        const r = (size - stroke) / 2;
        const circ = 2 * Math.PI * r;
        const filled = (score / 100) * circ;
        const color = score >= 70 ? colors.success : score >= 45 ? colors.warning : colors.danger;

        return (
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={colors.border}
                    strokeWidth={stroke}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={`${filled} ${circ - filled}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                        transform: 'rotate(90deg)',
                        transformOrigin: '50% 50%',
                        fill: color,
                        fontSize: size * 0.22,
                        fontWeight: 700,
                        fontFamily: font.mono,
                    }}
                >
                    {score}
                </text>
            </svg>
        );
    };

    /* ── Mini score bar ── */
    const ScoreBar = ({ score }) => {
        const color = score >= 7 ? colors.success : score >= 5 ? colors.warning : colors.danger;
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                    style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: colors.border,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            width: `${score * 10}%`,
                            height: '100%',
                            backgroundColor: color,
                            borderRadius: 2,
                            transition: 'width 0.6s ease',
                        }}
                    />
                </div>
                <span
                    style={{
                        fontSize: '0.7rem',
                        fontFamily: font.mono,
                        color,
                        fontWeight: 700,
                        minWidth: 28,
                    }}
                >
                    {score}/10
                </span>
            </div>
        );
    };

    const labelStyle = {
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        margin: 0,
    };

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
        transition: transition.fast,
    };

    /* ─────────────────────────────
       IDLE STATE
    ───────────────────────────── */
    if (!report && !loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: colors.bgPage,
                    fontFamily: font.body,
                }}
            >
                <GlobalStyles colors={colors} />
                <div
                    style={{
                        maxWidth: 680,
                        margin: '0 auto',
                        padding: 'clamp(2rem, 5vw, 3rem) 1.25rem',
                    }}
                >
                    {/* Back */}
                    <button
                        onClick={() => navigate('/resume')}
                        style={{ ...ghostBtn, marginBottom: '1.5rem' }}
                    >
                        <ChevronLeft size={13} /> Resume
                    </button>

                    {/* Hero card */}
                    <div
                        style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.lg,
                            backgroundColor: colors.bgCard,
                            boxShadow: shadow.sm,
                            overflow: 'hidden',
                            animation: 'fadeUp 0.3s ease',
                        }}
                    >
                        {/* Top band */}
                        <div
                            style={{
                                background: `linear-gradient(135deg, ${colors.primary}18 0%, ${colors.primary}06 100%)`,
                                borderBottom: `1px solid ${colors.border}`,
                                padding: '2rem 2rem 1.75rem',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    marginBottom: 12,
                                }}
                            >
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: radius.md,
                                        backgroundColor: colors.primary + '20',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Sparkles size={20} style={{ color: colors.primary }} />
                                </div>
                                <div>
                                    <p style={{ ...labelStyle, marginBottom: 2 }}>AI Analysis</p>
                                    <h1
                                        style={{
                                            fontSize: '1.3rem',
                                            fontWeight: 700,
                                            color: colors.textOnBg,
                                            fontFamily: font.display,
                                            margin: 0,
                                        }}
                                    >
                                        Resume Improvement
                                    </h1>
                                </div>
                            </div>
                            <p
                                style={{
                                    fontSize: '0.875rem',
                                    color: colors.textSub,
                                    lineHeight: 1.7,
                                    margin: 0,
                                }}
                            >
                                AI analyses your resume across 5 dimensions — summary, skills,
                                experience, projects, and ATS compatibility — and gives you
                                specific, actionable tips to improve it.
                            </p>
                        </div>

                        {/* What you'll get */}
                        <div
                            style={{
                                padding: '1.5rem 2rem',
                                borderBottom: `1px solid ${colors.border}`,
                            }}
                        >
                            <p style={{ ...labelStyle, marginBottom: '0.875rem' }}>
                                What you'll get
                            </p>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '0.65rem',
                                }}
                            >
                                {[
                                    'Overall resume score (0–100)',
                                    'Per-section analysis with severity',
                                    'Specific actionable tips per section',
                                    'Top 3 priority changes',
                                    'Missing ATS keywords',
                                    'Ideal answer guidance per weakness',
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 8,
                                        }}
                                    >
                                        <CheckCircle2
                                            size={13}
                                            style={{
                                                color: colors.success,
                                                flexShrink: 0,
                                                marginTop: 1,
                                            }}
                                        />
                                        <span
                                            style={{
                                                fontSize: '0.8rem',
                                                color: colors.textSub,
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div
                            style={{
                                padding: '1.5rem 2rem',
                                backgroundColor: colors.bgMuted,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 12,
                            }}
                        >
                            <p style={{ fontSize: '0.78rem', color: colors.textMuted, margin: 0 }}>
                                Uses your most recently uploaded resume
                            </p>
                            <button
                                onClick={handleAnalyse}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '0.65rem 1.5rem',
                                    border: 'none',
                                    borderRadius: radius.md,
                                    backgroundColor: colors.primary,
                                    color: '#fff',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontFamily: font.body,
                                    letterSpacing: '0.02em',
                                }}
                            >
                                <Sparkles size={14} /> Analyse My Resume
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            style={{
                                marginTop: '1rem',
                                border: `1px solid ${colors.danger}40`,
                                borderRadius: radius.md,
                                backgroundColor: colors.danger + '10',
                                padding: '0.875rem 1rem',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10,
                            }}
                        >
                            <Info
                                size={14}
                                style={{ color: colors.danger, flexShrink: 0, marginTop: 1 }}
                            />
                            <p
                                style={{
                                    fontSize: '0.82rem',
                                    color: colors.danger,
                                    margin: 0,
                                    lineHeight: 1.5,
                                }}
                            >
                                {error}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ─────────────────────────────
       LOADING STATE
    ───────────────────────────── */
    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: colors.bgPage,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: font.body,
                    gap: 16,
                }}
            >
                <GlobalStyles colors={colors} />
                <div
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: radius.md,
                        backgroundColor: colors.primary + '15',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Sparkles size={22} style={{ color: colors.primary }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p
                        style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: colors.textMain,
                            margin: '0 0 4px',
                        }}
                    >
                        Analysing your resume…
                    </p>
                    <p style={{ fontSize: '0.8rem', color: colors.textSub, margin: 0 }}>
                        This takes about 10–15 seconds
                    </p>
                </div>
                <Loader2
                    size={18}
                    style={{ color: colors.textSub, animation: 'spin 1s linear infinite' }}
                />
            </div>
        );
    }

    /* ─────────────────────────────
       REPORT STATE
    ───────────────────────────── */
    const activeDimData = report.dimensions?.[activeDim];
    const activeSev = severityConfig[activeDimData?.severity] || severityConfig.warning;
    const ActiveSevIcon = activeSev.icon;
    const ActiveDimIcon = DIMENSION_META[activeDim]?.icon || FileText;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} />
            <div
                style={{
                    maxWidth: 960,
                    margin: '0 auto',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem',
                }}
            >
                {/* Header row */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12,
                        marginBottom: '1.75rem',
                        animation: 'fadeUp 0.3s ease',
                    }}
                >
                    <div>
                        <button
                            onClick={() => navigate('/resume')}
                            style={{ ...ghostBtn, marginBottom: 10 }}
                        >
                            <ChevronLeft size={13} /> Resume
                        </button>
                        <p style={{ ...labelStyle, marginBottom: 4 }}>AI Analysis</p>
                        <h1
                            style={{
                                fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
                                fontWeight: 700,
                                color: colors.textOnBg,
                                fontFamily: font.display,
                                margin: 0,
                            }}
                        >
                            Resume Improvement Report
                        </h1>
                        {report.name && (
                            <p
                                style={{
                                    fontSize: '0.8rem',
                                    color: colors.textSub,
                                    margin: '4px 0 0',
                                }}
                            >
                                {report.name}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            setReport(null);
                            setError(null);
                        }}
                        style={ghostBtn}
                    >
                        <Sparkles size={13} /> Re-analyse
                    </button>
                </div>

                {/* ── TOP SECTION: Score ring + priorities + ATS ── */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: '1rem',
                        marginBottom: '1rem',
                        animation: 'fadeUp 0.3s ease 0.05s both',
                    }}
                >
                    {/* Score ring card */}
                    <div
                        style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.lg,
                            backgroundColor: colors.bgCard,
                            padding: '1.5rem',
                            boxShadow: shadow.sm,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 10,
                            minWidth: 160,
                        }}
                    >
                        <p style={{ ...labelStyle, marginBottom: 0 }}>Score</p>
                        <ScoreRing score={report.overallScore} size={100} stroke={7} />
                        <p
                            style={{
                                fontSize: '0.7rem',
                                color: colors.textMuted,
                                textAlign: 'center',
                                margin: 0,
                                lineHeight: 1.4,
                            }}
                        >
                            {report.overallScore >= 70
                                ? 'Strong resume'
                                : report.overallScore >= 45
                                  ? 'Needs work'
                                  : 'Needs major improvement'}
                        </p>
                    </div>

                    {/* Right column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Top priorities */}
                        {report.topPriorities?.length > 0 && (
                            <div
                                style={{
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.lg,
                                    backgroundColor: colors.bgCard,
                                    padding: '1.25rem',
                                    boxShadow: shadow.sm,
                                    flex: 1,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 7,
                                        marginBottom: '0.875rem',
                                    }}
                                >
                                    <Target size={13} style={{ color: colors.primary }} />
                                    <p style={{ ...labelStyle }}>Top Priorities</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {report.topPriorities.map((p, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 10,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    flexShrink: 0,
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: '50%',
                                                    backgroundColor: colors.primary + '20',
                                                    color: colors.primary,
                                                    fontSize: '0.65rem',
                                                    fontWeight: 800,
                                                    fontFamily: font.mono,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {i + 1}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: '0.83rem',
                                                    color: colors.textSub,
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {p}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ATS keywords */}
                        {report.atsKeywords?.length > 0 && (
                            <div
                                style={{
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.lg,
                                    backgroundColor: colors.bgCard,
                                    padding: '1.25rem',
                                    boxShadow: shadow.sm,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 7,
                                        marginBottom: '0.875rem',
                                    }}
                                >
                                    <Tag size={13} style={{ color: colors.warning }} />
                                    <p style={{ ...labelStyle }}>Missing ATS Keywords</p>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {report.atsKeywords.map((kw, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: radius.sm,
                                                border: `1px solid ${colors.warning}50`,
                                                backgroundColor: colors.warning + '10',
                                                color: colors.warning,
                                                fontSize: '0.72rem',
                                                fontWeight: 600,
                                                fontFamily: font.mono,
                                            }}
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                                <p
                                    style={{
                                        fontSize: '0.68rem',
                                        color: colors.textMuted,
                                        marginTop: 8,
                                        margin: '8px 0 0',
                                    }}
                                >
                                    Add these to your resume to improve ATS match rate
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── DIMENSION TABS + DETAIL ── */}
                <div
                    style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.lg,
                        backgroundColor: colors.bgCard,
                        boxShadow: shadow.sm,
                        overflow: 'hidden',
                        animation: 'fadeUp 0.3s ease 0.1s both',
                    }}
                >
                    {/* Tabs */}
                    <div
                        style={{
                            display: 'flex',
                            borderBottom: `1px solid ${colors.border}`,
                            overflowX: 'auto',
                        }}
                    >
                        {Object.entries(DIMENSION_META).map(([key, { label, icon: Icon }]) => {
                            const dim = report.dimensions?.[key];
                            const sev = severityConfig[dim?.severity] || severityConfig.warning;
                            const active = activeDim === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveDim(key)}
                                    className="dim-tab"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 4,
                                        padding: '0.875rem 1rem',
                                        flexShrink: 0,
                                        border: 'none',
                                        borderBottom: `2px solid ${active ? colors.primary : 'transparent'}`,
                                        backgroundColor: active
                                            ? colors.primary + '08'
                                            : 'transparent',
                                        color: active ? colors.primary : colors.textSub,
                                        cursor: 'pointer',
                                        fontFamily: font.body,
                                        transition: transition.fast,
                                        minWidth: 90,
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <Icon size={13} />
                                        <span
                                            style={{
                                                fontSize: '0.72rem',
                                                fontWeight: 700,
                                                letterSpacing: '0.04em',
                                            }}
                                        >
                                            {label}
                                        </span>
                                    </div>
                                    {dim && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: '50%',
                                                    backgroundColor: sev.color,
                                                }}
                                            />
                                            <span
                                                style={{
                                                    fontSize: '0.6rem',
                                                    fontFamily: font.mono,
                                                    color: sev.color,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {dim.score}/10
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Dimension detail */}
                    {activeDimData && (
                        <div
                            style={{ padding: '1.5rem', animation: 'fadeUp 0.2s ease' }}
                            key={activeDim}
                        >
                            {/* Dim header */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '1.25rem',
                                    flexWrap: 'wrap',
                                    gap: 10,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: radius.md,
                                            backgroundColor: activeSev.bg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <ActiveDimIcon
                                            size={16}
                                            style={{ color: activeSev.color }}
                                        />
                                    </div>
                                    <div>
                                        <h2
                                            style={{
                                                fontSize: '1rem',
                                                fontWeight: 700,
                                                color: colors.textMain,
                                                margin: 0,
                                            }}
                                        >
                                            {DIMENSION_META[activeDim].label}
                                        </h2>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                marginTop: 3,
                                            }}
                                        >
                                            <ActiveSevIcon
                                                size={11}
                                                style={{ color: activeSev.color }}
                                            />
                                            <span
                                                style={{
                                                    fontSize: '0.68rem',
                                                    fontWeight: 700,
                                                    color: activeSev.color,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.1em',
                                                }}
                                            >
                                                {activeSev.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ minWidth: 160 }}>
                                    <ScoreBar score={activeDimData.score} />
                                </div>
                            </div>

                            {/* Tips */}
                            {activeDimData.tips?.length > 0 && (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem',
                                    }}
                                >
                                    {activeDimData.tips.map((tip, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 12,
                                                padding: '1rem',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: radius.md,
                                                backgroundColor: colors.bgMuted,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    flexShrink: 0,
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: '50%',
                                                    backgroundColor: activeSev.color + '20',
                                                    color: activeSev.color,
                                                    fontSize: '0.6rem',
                                                    fontWeight: 800,
                                                    fontFamily: font.mono,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginTop: 1,
                                                }}
                                            >
                                                {i + 1}
                                            </span>
                                            <p
                                                style={{
                                                    fontSize: '0.875rem',
                                                    color: colors.textSub,
                                                    lineHeight: 1.65,
                                                    margin: 0,
                                                    flex: 1,
                                                }}
                                            >
                                                {tip}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── ALL DIMENSIONS SUMMARY ── */}
                <div style={{ marginTop: '1rem', animation: 'fadeUp 0.3s ease 0.15s both' }}>
                    <p style={{ ...labelStyle, marginBottom: '0.875rem' }}>All Dimensions</p>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '0.75rem',
                        }}
                    >
                        {Object.entries(DIMENSION_META).map(([key, { label, icon: Icon }]) => {
                            const dim = report.dimensions?.[key];
                            if (!dim) return null;
                            const sev = severityConfig[dim.severity] || severityConfig.warning;
                            const active = activeDim === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setActiveDim(key);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="dim-summary-card"
                                    style={{
                                        border: `1px solid ${active ? colors.primary : colors.border}`,
                                        borderRadius: radius.md,
                                        padding: '0.875rem',
                                        backgroundColor: active
                                            ? colors.primary + '08'
                                            : colors.bgCard,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontFamily: font.body,
                                        transition: transition.fast,
                                        boxShadow: shadow.sm,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: 8,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                            }}
                                        >
                                            <Icon
                                                size={13}
                                                style={{
                                                    color: active ? colors.primary : colors.textSub,
                                                }}
                                            />
                                            <span
                                                style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    color: active
                                                        ? colors.primary
                                                        : colors.textMain,
                                                }}
                                            >
                                                {label}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                backgroundColor: sev.color,
                                            }}
                                        />
                                    </div>
                                    <ScoreBar score={dim.score} />
                                    <p
                                        style={{
                                            fontSize: '0.65rem',
                                            color: sev.color,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            marginTop: 6,
                                            margin: '6px 0 0',
                                        }}
                                    >
                                        {sev.label}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom actions */}
                <div
                    style={{
                        display: 'flex',
                        gap: '0.75rem',
                        marginTop: '1.5rem',
                        animation: 'fadeUp 0.3s ease 0.2s both',
                        flexWrap: 'wrap',
                    }}
                >
                    <button onClick={() => navigate('/resume')} style={ghostBtn}>
                        <ChevronLeft size={13} /> Back to Resume
                    </button>
                    <button
                        onClick={() => {
                            setReport(null);
                            setError(null);
                        }}
                        style={ghostBtn}
                    >
                        <Sparkles size={13} /> Re-analyse
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .dim-tab:hover { background-color: ${colors?.bgMuted} !important; }
        .dim-summary-card:hover { border-color: ${colors?.primary} !important; transform: translateY(-1px); }
    `}</style>
);

export default ResumeImprovement;
