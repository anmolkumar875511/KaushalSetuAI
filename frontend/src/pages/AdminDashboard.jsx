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
    BookOpen,
    Target,
    ShieldAlert,
    FileText,
    Sparkles,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from 'recharts';
import { toast } from 'sonner';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const toMonth = (n) => MONTHS[(n - 1) % 12] || String(n);
const SCORE_LABELS = { 0: '0–20', 21: '21–40', 41: '41–60', 61: '61–80', 81: '81–100' };

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState({
        userGrowth: [],
        topSkills: [],
        missingSkills: [],
        skillDemand: [],
        learningInsights: null,
        opportunityInsights: null,
        assessmentInsights: null,
    });
    const [loading, setLoading] = useState(true);
    const [ingesting, setIngesting] = useState(false);
    const [enriching, setEnriching] = useState(false);

    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');
    const navigate = useNavigate();

    const fetchDashboard = async () => {
        try {
            const res = await axiosInstance.get('/admin/dashboard');
            if (res?.data?.success) setStats(res.data.data);
            else toast.error(res?.data?.message || 'Dashboard load failed');
        } catch {
            toast.error('Failed to load dashboard');
        }
    };

    const fetchAnalytics = async () => {
        try {
            const [growth, topS, misS, skillD, learn, opps, assess] = await Promise.all([
                axiosInstance.get('/admin/analytics/user-growth'),
                axiosInstance.get('/admin/analytics/top-skills'),
                axiosInstance.get('/admin/analytics/missing-skills'),
                axiosInstance.get('/admin/analytics/skill-demand'),
                axiosInstance.get('/admin/analytics/learning'),
                axiosInstance.get('/admin/analytics/opportunities'),
                axiosInstance.get('/admin/analytics/assessments'),
            ]);
            setAnalytics({
                userGrowth: (growth?.data?.data ?? []).map((d) => ({
                    month: toMonth(d._id),
                    count: d.count ?? d.users ?? 0,
                })),
                topSkills: (topS?.data?.data ?? []).map((d) => ({
                    skill: d._id,
                    count: d.count ?? 0,
                })),
                missingSkills: (misS?.data?.data ?? []).map((d) => ({
                    skill: d._id,
                    count: d.count ?? 0,
                })),
                skillDemand: (skillD?.data?.data ?? []).map((d) => ({
                    skill: d.skill,
                    count: d.demandScore ?? 0,
                    growth: d.growthTrend ?? 0,
                })),
                learningInsights: learn?.data?.data ?? null,
                opportunityInsights: opps?.data?.data ?? null,
                assessmentInsights: assess?.data?.data ?? null,
            });
        } catch {
            toast.error('Analytics failed to load');
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') return;
        setLoading(true);
        Promise.all([fetchDashboard(), fetchAnalytics()]).finally(() => setLoading(false));
    }, [user]);

    const handleIngest = async () => {
        setIngesting(true);
        try {
            await axiosInstance.get('/admin/fetch');
            toast.success('Sync started in background');
            fetchDashboard();
        } catch {
            toast.error('Sync failed');
        } finally {
            setIngesting(false);
        }
    };

    const handleEnrich = async () => {
        setEnriching(true);
        try {
            const res = await axiosInstance.post('/admin/enrich');
            const pending = res.data.data?.pending ?? 0;
            toast.success(`AI enrichment started — ${pending} jobs queued`);
            // Refresh stats after a short delay so pending count updates
            setTimeout(fetchDashboard, 3000);
        } catch {
            toast.error('Enrichment trigger failed');
        } finally {
            setEnriching(false);
        }
    };

    /* ── Shared ── */
    const L = {
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        margin: 0,
    };
    const axTick = { fill: colors.textSub, fontSize: 10, fontFamily: font.mono };
    const ttStyle = {
        backgroundColor: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.sm,
        fontSize: '0.72rem',
        fontFamily: font.mono,
        color: colors.textMain,
    };
    const PIE_COLS = [
        colors.primary,
        colors.secondary,
        colors.success,
        colors.warning,
        colors.danger,
        '#8B5CF6',
        '#06B6D4',
        '#EC4899',
    ];

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

    /* ── Derived ── */
    const ai = analytics.assessmentInsights;
    const li = analytics.learningInsights;
    const oi = analytics.opportunityInsights;

    const scoreDistrib = (ai?.scoreDistribution ?? []).map((b) => ({
        range: SCORE_LABELS[b._id] ?? String(b._id),
        count: b.count,
    }));
    const progressBuckets = (li?.progressBuckets ?? []).map((b, i) => ({
        range: ['0–25', '26–50', '51–75', '76–100'][i] ?? String(b._id),
        count: b.count,
    }));
    const oppByCategory = (oi?.byCategory ?? []).map((d) => ({
        name: d._id ?? 'unknown',
        value: d.count,
    }));

    const pendingEnrichment = stats?.opportunities?.pendingEnrichment ?? 0;

    const topStats = [
        {
            title: 'Total Users',
            value: stats?.users?.total ?? 0,
            sub: `${stats?.users?.verified ?? 0} verified`,
            icon: <Users size={15} />,
            accent: colors.primary,
        },
        {
            title: 'Active Jobs',
            value: stats?.opportunities?.active ?? 0,
            sub: `of ${stats?.opportunities?.total ?? 0} total`,
            icon: <Briefcase size={15} />,
            accent: colors.secondary,
        },
        {
            title: 'Pending Enrichment',
            value: pendingEnrichment,
            sub: pendingEnrichment > 0 ? 'awaiting AI enrichment' : 'all jobs enriched',
            icon: <Sparkles size={15} />,
            accent: pendingEnrichment > 0 ? colors.warning : colors.success,
        },
        {
            title: 'Roadmaps',
            value: stats?.roadmaps?.total ?? 0,
            sub: `${stats?.roadmaps?.completed ?? 0} completed · avg ${stats?.roadmaps?.avgProgress ?? 0}%`,
            icon: <BookOpen size={15} />,
            accent: colors.primary,
        },
        {
            title: 'Assessments',
            value: stats?.assessments?.total ?? 0,
            sub: `avg score ${stats?.assessments?.avgScore ?? 0}%`,
            icon: <Target size={15} />,
            accent: colors.secondary,
        },
        {
            title: 'Resumes Parsed',
            value: stats?.resumes ?? 0,
            icon: <FileText size={15} />,
            accent: colors.primary,
        },
        {
            title: 'Blacklisted',
            value: stats?.users?.blacklisted ?? 0,
            icon: <ShieldAlert size={15} />,
            accent: colors.danger,
        },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} font={font} />

            <main
                style={{
                    maxWidth: 1240,
                    margin: '0 auto',
                    padding: 'clamp(1.5rem,4vw,2.5rem) 1.25rem',
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
                        <p style={{ ...L, marginBottom: 4 }}>Admin</p>
                        <h1
                            style={{
                                fontSize: 'clamp(1.3rem,3vw,1.75rem)',
                                fontWeight: 700,
                                color: colors.textOnBg,
                                fontFamily: font.display,
                                margin: 0,
                            }}
                        >
                            System Overview
                        </h1>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/users')}
                            className="ghost-btn"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '0.6rem 1rem',
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.md,
                                backgroundColor: colors.bgCard,
                                color: colors.textMain,
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: transition.fast,
                                fontFamily: font.mono,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                            }}
                        >
                            <Users size={12} /> Manage Users
                        </button>

                        {/* Enrich button — shows pending count badge when > 0 */}
                        <button
                            onClick={handleEnrich}
                            disabled={enriching || pendingEnrichment === 0}
                            className="enrich-btn"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 7,
                                padding: '0.6rem 1.125rem',
                                backgroundColor:
                                    pendingEnrichment > 0 ? colors.warning : colors.bgMuted,
                                color: pendingEnrichment > 0 ? '#fff' : colors.textSub,
                                border: 'none',
                                borderRadius: radius.md,
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor:
                                    enriching || pendingEnrichment === 0
                                        ? 'not-allowed'
                                        : 'pointer',
                                opacity: enriching ? 0.7 : 1,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                transition: transition.fast,
                                fontFamily: font.mono,
                            }}
                        >
                            <Sparkles
                                size={12}
                                style={{
                                    animation: enriching ? 'spin 1s linear infinite' : 'none',
                                }}
                            />
                            {enriching
                                ? 'Enriching…'
                                : `Enrich${pendingEnrichment > 0 ? ` (${pendingEnrichment})` : ''}`}
                        </button>

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
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: ingesting ? 'not-allowed' : 'pointer',
                                opacity: ingesting ? 0.7 : 1,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                transition: transition.fast,
                                fontFamily: font.mono,
                            }}
                        >
                            <RefreshCw
                                size={12}
                                style={{
                                    animation: ingesting ? 'spin 1s linear infinite' : 'none',
                                }}
                            />
                            {ingesting ? 'Syncing…' : 'Sync Jobs'}
                        </button>
                    </div>
                </div>

                {/* ── STAT CARDS ── */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                        gap: '0.75rem',
                        marginBottom: '2rem',
                    }}
                >
                    {topStats.map((s) => (
                        <div
                            key={s.title}
                            className="stat-card"
                            style={{
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.lg,
                                backgroundColor: colors.bgCard,
                                padding: '1rem 1.125rem',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                boxShadow: shadow.sm,
                                transition: 'transform 0.18s ease,box-shadow 0.18s ease',
                            }}
                        >
                            <div>
                                <p style={{ ...L, marginBottom: 5 }}>{s.title}</p>
                                <h3
                                    style={{
                                        fontSize: '1.6rem',
                                        fontWeight: 700,
                                        color: colors.textMain,
                                        lineHeight: 1,
                                        margin: 0,
                                        marginBottom: s.sub ? 3 : 0,
                                    }}
                                >
                                    {s.value}
                                </h3>
                                {s.sub && (
                                    <p
                                        style={{
                                            fontSize: '0.65rem',
                                            color: colors.textSub,
                                            margin: 0,
                                        }}
                                    >
                                        {s.sub}
                                    </p>
                                )}
                            </div>
                            <div
                                style={{
                                    width: 30,
                                    height: 30,
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

                {/* ── USER & SKILL ANALYTICS ── */}
                <p style={{ ...L, marginBottom: '0.875rem' }}>User & Skill Analytics</p>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
                        gap: '0.75rem',
                        marginBottom: '2rem',
                    }}
                >
                    <ChartCard
                        title="User Growth (by Month)"
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
                                    dataKey="month"
                                    tick={axTick}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={axTick}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={ttStyle}
                                    cursor={{ stroke: colors.border }}
                                />
                                <Line
                                    dataKey="count"
                                    name="New Users"
                                    stroke={colors.primary}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Top Resume Skills"
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
                                    tick={axTick}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    angle={-30}
                                    dy={8}
                                    height={40}
                                />
                                <YAxis
                                    tick={axTick}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={ttStyle}
                                    cursor={{ fill: `${colors.primary}10` }}
                                />
                                <Bar
                                    dataKey="count"
                                    name="Count"
                                    fill={colors.primary}
                                    radius={[4, 4, 0, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Most Missing Skills"
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
                                    tick={axTick}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    angle={-30}
                                    dy={8}
                                    height={40}
                                />
                                <YAxis
                                    tick={axTick}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={ttStyle}
                                    cursor={{ fill: `${colors.danger}10` }}
                                />
                                <Bar
                                    dataKey="count"
                                    name="Count"
                                    fill={colors.danger}
                                    radius={[4, 4, 0, 0]}
                                    barSize={20}
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
                                    tick={axTick}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    angle={-30}
                                    dy={8}
                                    height={40}
                                />
                                <YAxis
                                    tick={axTick}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={ttStyle}
                                    cursor={{ fill: `${colors.secondary}10` }}
                                    formatter={(v, _, p) => [
                                        `Score:${v} · Growth:+${p.payload.growth}%`,
                                        p.payload.skill,
                                    ]}
                                />
                                <Bar
                                    dataKey="count"
                                    name="Demand"
                                    fill={colors.secondary}
                                    radius={[4, 4, 0, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* ── ASSESSMENTS & LEARNING ── */}
                <p style={{ ...L, marginBottom: '0.875rem' }}>Assessments & Learning</p>

                {ai && (
                    <div
                        style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.lg,
                            backgroundColor: colors.bgCard,
                            padding: '1rem 1.5rem',
                            marginBottom: '0.75rem',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '2rem',
                            boxShadow: shadow.sm,
                        }}
                    >
                        {[
                            { l: 'Total Assessments', v: ai.total ?? 0 },
                            { l: 'Completed', v: ai.completed ?? 0 },
                            { l: 'Avg Score', v: `${ai.avgScore ?? 0}%` },
                            {
                                l: 'Completion Rate',
                                v: `${ai.total ? Math.round((ai.completed / ai.total) * 100) : 0}%`,
                            },
                            { l: 'Avg Roadmap Progress', v: `${li?.avgProgress ?? 0}%` },
                            { l: 'Roadmap Completion', v: `${li?.completionRate ?? 0}%` },
                        ].map(({ l, v }) => (
                            <div key={l}>
                                <p style={{ ...L, marginBottom: 3 }}>{l}</p>
                                <p
                                    style={{
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                        color: colors.textMain,
                                        margin: 0,
                                        fontFamily: font.mono,
                                    }}
                                >
                                    {v}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
                        gap: '0.75rem',
                        marginBottom: '2rem',
                    }}
                >
                    <ChartCard
                        title="Assessment Score Distribution"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {scoreDistrib.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                    data={scoreDistrib}
                                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke={colors.border}
                                    />
                                    <XAxis
                                        dataKey="range"
                                        tick={axTick}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={axTick}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={ttStyle}
                                        cursor={{ fill: `${colors.primary}10` }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        name="Assessments"
                                        radius={[4, 4, 0, 0]}
                                        barSize={36}
                                    >
                                        {scoreDistrib.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={
                                                    i < 2
                                                        ? colors.danger
                                                        : i < 3
                                                          ? colors.warning
                                                          : colors.success
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Top Assessment Topics"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {ai?.topTopics?.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                    data={ai.topTopics.map((d) => ({
                                        topic: d._id,
                                        count: d.count,
                                    }))}
                                    layout="vertical"
                                    margin={{ top: 4, right: 8, left: 40, bottom: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                        stroke={colors.border}
                                    />
                                    <XAxis
                                        type="number"
                                        tick={axTick}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="topic"
                                        tick={axTick}
                                        axisLine={false}
                                        tickLine={false}
                                        width={80}
                                    />
                                    <Tooltip
                                        contentStyle={ttStyle}
                                        cursor={{ fill: `${colors.primary}10` }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        name="Attempts"
                                        fill={colors.primary}
                                        radius={[0, 4, 4, 0]}
                                        barSize={14}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Roadmap Progress Distribution"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {progressBuckets.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                    data={progressBuckets}
                                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke={colors.border}
                                    />
                                    <XAxis
                                        dataKey="range"
                                        tick={axTick}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={axTick}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={ttStyle}
                                        cursor={{ fill: `${colors.primary}10` }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        name="Roadmaps"
                                        radius={[4, 4, 0, 0]}
                                        barSize={36}
                                    >
                                        {progressBuckets.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={
                                                    [
                                                        colors.danger,
                                                        colors.warning,
                                                        colors.primary,
                                                        colors.success,
                                                    ][i] ?? colors.primary
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Opportunities by Category"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {oppByCategory.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={oppByCategory}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={72}
                                        paddingAngle={2}
                                    >
                                        {oppByCategory.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLS[i % PIE_COLS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={ttStyle} />
                                    <Legend
                                        iconSize={8}
                                        iconType="circle"
                                        wrapperStyle={{
                                            fontSize: '0.65rem',
                                            fontFamily: font.mono,
                                            color: colors.textSub,
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>
                </div>

                {/* ── LOGS ── */}
                <p style={{ ...L, marginBottom: '0.875rem' }}>Recent Activity</p>
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
                                System Logs
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
                            View All <ChevronRight size={12} />
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
                                    animation: `fadeUp 0.22s ease ${i * 0.03}s both`,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                    }}
                                >
                                    <LogBadge level={log.level} font={font} />
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

/* ── Sub-components ── */
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

const EmptyChart = ({ colors, font }) => (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '0.72rem', color: colors.textMuted, fontFamily: font.mono }}>
            No data yet
        </p>
    </div>
);

const LOG_CFG = {
    info: { color: '#3B82F6', icon: <CheckCircle size={10} /> },
    warn: { color: '#F59E0B', icon: <AlertCircle size={10} /> },
    error: { color: '#EF4444', icon: <AlertCircle size={10} /> },
};
const LogBadge = ({ level, font }) => {
    const { color, icon } = LOG_CFG[level] || LOG_CFG.info;
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

const GlobalStyles = ({ colors }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        .stat-card:hover  { transform:translateY(-2px) !important; box-shadow:0 6px 20px rgba(0,0,0,0.08) !important; }
        .sync-btn:hover:not(:disabled)   { opacity:0.88 !important; }
        .enrich-btn:hover:not(:disabled) { opacity:0.88 !important; }
        .ghost-btn:hover  { background-color:${colors?.bgHover} !important; }
        .logs-link:hover  { opacity:0.7; }
    `}</style>
);

export default AdminDashboard;
