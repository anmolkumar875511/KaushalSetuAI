import React, { useState, useEffect, useContext } from 'react';
import {
    Briefcase,
    Users,
    Activity,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    ChevronRight,
    History,
    Loader2,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState({
        userGrowth: [],
        topSkills: [],
        missingSkills: [],
        skillDemand: [],
    });
    const [loading, setLoading] = useState(true);
    const [ingesting, setIngesting] = useState(false);

    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');
    const navigate = useNavigate();

    /* ── Fetch ── */
    const fetchDashboardData = async () => {
        try {
            const res = await axiosInstance.get('/admin/dashboard');
            if (res?.data?.success) setStats(res.data.data);
            else toast.error(res?.data?.message || 'Failed to load dashboard');
        } catch {
            toast.error('Failed to load dashboard');
        }
    };

    const fetchAnalytics = async () => {
        try {
            const [growth, topSkills, missingSkills, skillDemand] = await Promise.all([
                axiosInstance.get('/admin/analytics/user-growth'),
                axiosInstance.get('/admin/analytics/top-skills'),
                axiosInstance.get('/admin/analytics/missing-skills'),
                axiosInstance.get('/admin/analytics/skill-demand'),
            ]);
            setAnalytics({
                userGrowth: growth?.data?.data ?? [],
                topSkills: topSkills?.data?.data ?? [],
                missingSkills: missingSkills?.data?.data ?? [],
                skillDemand: skillDemand?.data?.data ?? [],
            });
        } catch {
            toast.error('Analytics failed to load');
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') return;
        setLoading(true);
        Promise.all([fetchDashboardData(), fetchAnalytics()]).finally(() => setLoading(false));
    }, [user]);

    const handleIngest = async () => {
        setIngesting(true);
        try {
            await axiosInstance.get('/admin/fetch');
            toast.success('Opportunities synced');
            fetchDashboardData();
            fetchAnalytics();
        } catch {
            toast.error('Sync failed');
        } finally {
            setIngesting(false);
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

    const chartTooltipStyle = {
        backgroundColor: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.sm,
        fontSize: '0.72rem',
        fontFamily: font.mono,
        color: colors.textMain,
    };

    /* ── Guards ── */
    if (!user || user.role !== 'admin') {
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
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: colors.danger,
                        fontSize: '0.875rem',
                    }}
                >
                    <AlertCircle size={16} /> Unauthorized Access
                </div>
            </div>
        );
    }

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

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.users?.total || 0,
            icon: <Users size={15} />,
            accent: colors.primary,
        },
        {
            title: 'Active Jobs',
            value: stats?.opportunities?.active || 0,
            icon: <Briefcase size={15} />,
            accent: colors.secondary,
        },
        {
            title: 'Roadmaps',
            value: stats?.roadmaps || 0,
            icon: <Activity size={15} />,
            accent: colors.primary,
        },
        {
            title: 'Resumes Parsed',
            value: stats?.resumes || 0,
            icon: <Activity size={15} />,
            accent: colors.secondary,
        },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} font={font} />

            <main
                style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem',
                }}
            >
                {/* ── HEADER ── */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        marginBottom: '2rem',
                    }}
                >
                    <div>
                        <p style={{ ...labelStyle, marginBottom: 4 }}>Admin</p>
                        <h1
                            style={{
                                fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                                fontWeight: 700,
                                color: colors.textOnBg,
                                fontFamily: font.display,
                                margin: 0,
                            }}
                        >
                            System Overview
                        </h1>
                    </div>
                    <button
                        onClick={handleIngest}
                        disabled={ingesting}
                        className="sync-btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                            padding: '0.6rem 1.125rem',
                            backgroundColor: colors.primary,
                            color: '#fff',
                            border: 'none',
                            borderRadius: radius.md,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: ingesting ? 'not-allowed' : 'pointer',
                            opacity: ingesting ? 0.7 : 1,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            transition: transition.fast,
                            fontFamily: font.body,
                        }}
                    >
                        <RefreshCw
                            size={13}
                            style={{ animation: ingesting ? 'spin 1s linear infinite' : 'none' }}
                        />
                        {ingesting ? 'Syncing…' : 'Sync Opportunities'}
                    </button>
                </div>

                {/* ── STAT CARDS ── */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.75rem',
                        marginBottom: '2rem',
                    }}
                >
                    {statCards.map((s) => (
                        <div
                            key={s.title}
                            className="stat-card"
                            style={{
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.lg,
                                backgroundColor: colors.bgCard,
                                padding: '1.125rem 1.25rem',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                boxShadow: shadow.sm,
                                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                            }}
                        >
                            <div>
                                <p style={{ ...labelStyle, marginBottom: 6 }}>{s.title}</p>
                                <h3
                                    style={{
                                        fontSize: '1.75rem',
                                        fontWeight: 700,
                                        color: colors.textMain,
                                        lineHeight: 1,
                                        margin: 0,
                                    }}
                                >
                                    {s.value}
                                </h3>
                            </div>
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: radius.sm,
                                    backgroundColor: `${s.accent}18`,
                                    color: s.accent,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                {s.icon}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── ANALYTICS ── */}
                <div style={{ marginBottom: '1rem' }}>
                    <p style={{ ...labelStyle, marginBottom: 4 }}>Analytics</p>
                    <h2
                        style={{
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: colors.textMain,
                            margin: 0,
                        }}
                    >
                        Workforce Insights
                    </h2>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '0.75rem',
                        marginBottom: '2rem',
                    }}
                >
                    <ChartCard
                        title="User Growth"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart
                                data={analytics.userGrowth}
                                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke={colors.border}
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{
                                        fill: colors.textSub,
                                        fontSize: 10,
                                        fontFamily: font.mono,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{
                                        fill: colors.textSub,
                                        fontSize: 10,
                                        fontFamily: font.mono,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={chartTooltipStyle}
                                    cursor={{ stroke: colors.border }}
                                />
                                <Line
                                    dataKey="count"
                                    stroke={colors.primary}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Top Skills"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                                data={analytics.topSkills}
                                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke={colors.border}
                                />
                                <XAxis
                                    dataKey="skill"
                                    tick={{
                                        fill: colors.textSub,
                                        fontSize: 10,
                                        fontFamily: font.mono,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{
                                        fill: colors.textSub,
                                        fontSize: 10,
                                        fontFamily: font.mono,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={chartTooltipStyle}
                                    cursor={{ fill: `${colors.primary}10` }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill={colors.primary}
                                    radius={[4, 4, 0, 0]}
                                    barSize={28}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Missing Skills"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                                data={analytics.missingSkills}
                                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke={colors.border}
                                />
                                <XAxis
                                    dataKey="skill"
                                    tick={{
                                        fill: colors.textSub,
                                        fontSize: 10,
                                        fontFamily: font.mono,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{
                                        fill: colors.textSub,
                                        fontSize: 10,
                                        fontFamily: font.mono,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={chartTooltipStyle}
                                    cursor={{ fill: `${colors.danger}10` }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill={colors.danger}
                                    radius={[4, 4, 0, 0]}
                                    barSize={28}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Market Skill Demand"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                                data={analytics.skillDemand}
                                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke={colors.border}
                                />
                                <XAxis
                                    dataKey="skill"
                                    tick={{
                                        fill: colors.textSub,
                                        fontSize: 10,
                                        fontFamily: font.mono,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{
                                        fill: colors.textSub,
                                        fontSize: 10,
                                        fontFamily: font.mono,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={chartTooltipStyle}
                                    cursor={{ fill: `${colors.secondary}10` }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill={colors.secondary}
                                    radius={[4, 4, 0, 0]}
                                    barSize={28}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* ── LOGS PANEL ── */}
                <div
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
                            padding: '1rem 1.5rem',
                            borderBottom: `1px solid ${colors.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <History size={15} style={{ color: colors.primary }} />
                            <h3
                                style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    color: colors.textMain,
                                    margin: 0,
                                }}
                            >
                                System Activity
                            </h3>
                        </div>
                        <button
                            onClick={() => navigate('/logger')}
                            className="logs-link"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: colors.primary,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: font.mono,
                                padding: 0,
                            }}
                        >
                            View Logs <ChevronRight size={12} />
                        </button>
                    </div>

                    {stats?.recentLogs?.length ? (
                        stats.recentLogs.map((log, i) => (
                            <div
                                key={log._id}
                                style={{
                                    padding: '0.875rem 1.5rem',
                                    borderTop: i === 0 ? 'none' : `1px solid ${colors.border}`,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.75rem',
                                    animation: `fadeUp 0.25s ease ${i * 0.03}s both`,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                    }}
                                >
                                    <LogLevelBadge level={log.level} font={font} />
                                    <div>
                                        <p
                                            style={{
                                                fontSize: '0.825rem',
                                                fontWeight: 600,
                                                color: colors.textMain,
                                                margin: 0,
                                                marginBottom: 2,
                                            }}
                                        >
                                            {log.meta?.action || 'System Event'}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: '0.75rem',
                                                color: colors.textSub,
                                                margin: 0,
                                            }}
                                        >
                                            {log.message}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    style={{
                                        fontSize: '0.65rem',
                                        fontFamily: font.mono,
                                        color: colors.textMuted,
                                        letterSpacing: '0.04em',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {new Date(log.createdAt).toLocaleString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div
                            style={{
                                padding: '1.5rem',
                                fontSize: '0.8rem',
                                color: colors.textSub,
                                textAlign: 'center',
                            }}
                        >
                            No recent logs
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

/* ─────────────────────────────────────────────
   CHART CARD
───────────────────────────────────────────── */
const ChartCard = ({ title, children, colors, font, radius, shadow }) => (
    <div
        style={{
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            backgroundColor: colors.bgCard,
            padding: '1.125rem 1.25rem',
            boxShadow: shadow.sm,
        }}
    >
        <p
            style={{
                fontSize: 10,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: colors.textSub,
                fontFamily: font.mono,
                margin: 0,
                marginBottom: '0.875rem',
            }}
        >
            {title}
        </p>
        {children}
    </div>
);

/* ─────────────────────────────────────────────
   LOG LEVEL BADGE
───────────────────────────────────────────── */
const LOG_CONFIG = {
    info: { color: '#3B82F6', icon: <CheckCircle size={10} /> },
    warn: { color: '#F59E0B', icon: <AlertCircle size={10} /> },
    error: { color: '#EF4444', icon: <AlertCircle size={10} /> },
};

const LogLevelBadge = ({ level, font }) => {
    const { color, icon } = LOG_CONFIG[level] || LOG_CONFIG.info;
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '0.25rem 0.5rem',
                borderRadius: 5,
                backgroundColor: `${color}18`,
                border: `1px solid ${color}28`,
                color,
                fontSize: '0.6rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: font.mono,
                whiteSpace: 'nowrap',
            }}
        >
            {icon} {level}
        </span>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors, font }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .stat-card:hover  { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
        .sync-btn:hover:not(:disabled) { opacity: 0.88 !important; }
        .logs-link:hover  { opacity: 0.7; }
    `}</style>
);

export default AdminDashboard;
