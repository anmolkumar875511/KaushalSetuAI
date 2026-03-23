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
    Trophy,
    Medal,
    Mic,
    MapPin,
    TrendingUp,
    TrendingDown,
    Minus,
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
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
} from 'recharts';
import { toast } from 'sonner';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const toMonth = (n) => MONTHS[(n - 1) % 12] || String(n);
const SCORE_LABELS = { 0: '0–20', 21: '21–40', 41: '41–60', 61: '61–80', 81: '81–100' };

const TREND_ICON = {
    rising: <TrendingUp size={11} />,
    stable: <Minus size={11} />,
    declining: <TrendingDown size={11} />,
};
const TREND_COLOR = (t, c) =>
    t === 'rising' ? c.success : t === 'declining' ? c.danger : c.textSub;

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
        ratingInsights: null,
        mockInterviewInsights: null,
        resumeImprovementInsights: null,
        skillDemandMap: null,
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
            const [
                growth,
                topS,
                misS,
                skillD,
                learn,
                opps,
                assess,
                ratings,
                mockIv,
                resumeImp,
                skillMap,
            ] = await Promise.all([
                axiosInstance.get('/admin/analytics/user-growth'),
                axiosInstance.get('/admin/analytics/top-skills'),
                axiosInstance.get('/admin/analytics/missing-skills'),
                axiosInstance.get('/admin/analytics/skill-demand'),
                axiosInstance.get('/admin/analytics/learning'),
                axiosInstance.get('/admin/analytics/opportunities'),
                axiosInstance.get('/admin/analytics/assessments'),
                axiosInstance.get('/admin/analytics/ratings'),
                axiosInstance.get('/admin/analytics/mock-interviews'),
                axiosInstance.get('/admin/analytics/resume-improvement'),
                axiosInstance.get('/admin/analytics/skill-demand-map'),
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
                ratingInsights: ratings?.data?.data ?? null,
                mockInterviewInsights: mockIv?.data?.data ?? null,
                resumeImprovementInsights: resumeImp?.data?.data ?? null,
                skillDemandMap: skillMap?.data?.data ?? null,
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
            setTimeout(fetchDashboard, 3000);
        } catch {
            toast.error('Enrichment trigger failed');
        } finally {
            setEnriching(false);
        }
    };

    /* ── Shared style atoms ── */
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

    /* ── Auth guards ── */
    if (!user || user.role !== 'admin')
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

    if (loading)
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

    /* ── Derived data ── */
    const ai = analytics.assessmentInsights;
    const li = analytics.learningInsights;
    const oi = analytics.opportunityInsights;
    const ri = analytics.ratingInsights;
    const mvi = analytics.mockInterviewInsights;
    const rri = analytics.resumeImprovementInsights;
    const sdm = analytics.skillDemandMap;

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
    const tierDistribData = (ri?.tierDistribution ?? []).map((d) => ({
        name: d.tier,
        value: d.count,
        color: d.color,
    }));
    const ratingByMonthData = (ri?.ratingByMonth ?? []).map((d) => ({
        month: d.month,
        avg: d.avgRating,
    }));

    // Mock interview derived
    const mvScoreDist = mvi?.scoreDistribution ?? [];
    const mvByExp = (mvi?.byExperienceLevel ?? []).map((d) => ({
        level: d.level,
        count: d.count,
        avgScore: d.avgScore,
    }));
    const mvTopRoles = mvi?.topRoles ?? [];
    const mvByMonth = mvi?.byMonth ?? [];
    const mvByStatus = (mvi?.byStatus ?? []).map((d) => ({ name: d.status, value: d.count }));

    // Resume improvement derived
    const completeness = rri?.completeness ?? {};
    const skillLevelDist = rri?.skillLevelDistribution ?? [];
    const topMissing = rri?.topMissingSkills ?? [];
    const reUploadRate = rri?.reUploadRate ?? [];
    const avgSkillsTime = rri?.avgSkillsOverTime ?? [];

    // Regional skill demand map derived
    const regionData = sdm?.byRegion ?? [];
    const topGlobal = sdm?.topSkillsGlobal ?? [];
    const growthSummary = sdm?.growthTrendSummary ?? [];
    const demandOverTime = sdm?.demandOverTime ?? [];

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
            title: 'Mock Interviews',
            value: mvi?.total ?? 0,
            sub: `${mvi?.completed ?? 0} completed · avg ${mvi?.avgScore ?? 0}/100`,
            icon: <Mic size={15} />,
            accent: '#8B5CF6',
        },
        {
            title: 'Resumes Parsed',
            value: stats?.resumes ?? 0,
            sub: `avg ${rri?.avgSkillsPerResume ?? 0} skills each`,
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
            <GlobalStyles colors={colors} />

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
                        {analytics.userGrowth.length ? (
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
                                    <Tooltip contentStyle={ttStyle} />
                                    <Line
                                        dataKey="count"
                                        name="Users"
                                        stroke={colors.primary}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Top Skills on Resumes"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {analytics.topSkills.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                    data={analytics.topSkills}
                                    layout="vertical"
                                    margin={{ top: 4, right: 8, left: 4, bottom: 0 }}
                                >
                                    <XAxis
                                        type="number"
                                        tick={axTick}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        dataKey="skill"
                                        type="category"
                                        tick={{ ...axTick, fontSize: 9 }}
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
                                        name="Resumes"
                                        fill={colors.primary}
                                        radius={[0, 4, 4, 0]}
                                        barSize={10}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Most Missing Skills (Skill Gap)"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {analytics.missingSkills.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                    data={analytics.missingSkills}
                                    layout="vertical"
                                    margin={{ top: 4, right: 8, left: 4, bottom: 0 }}
                                >
                                    <XAxis
                                        type="number"
                                        tick={axTick}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        dataKey="skill"
                                        type="category"
                                        tick={{ ...axTick, fontSize: 9 }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={80}
                                    />
                                    <Tooltip
                                        contentStyle={ttStyle}
                                        cursor={{ fill: `${colors.danger}10` }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        name="Reports"
                                        fill={colors.danger}
                                        radius={[0, 4, 4, 0]}
                                        barSize={10}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Score Distribution (Assessments)"
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
                                        barSize={32}
                                    >
                                        {scoreDistrib.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={
                                                    [
                                                        colors.danger,
                                                        colors.warning,
                                                        colors.primary,
                                                        colors.success,
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
                        title="Roadmap Progress Buckets"
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

                {/* ── SKILL RATINGS ── */}
                <p style={{ ...L, marginBottom: '0.875rem' }}>Skill Ratings</p>
                {ri && (
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
                            { l: 'Rated Users', v: ri.totalRated ?? 0 },
                            { l: 'Avg Rating', v: ri.avgRating ?? 0 },
                            { l: 'Peak Rating', v: ri.maxRating ?? 0 },
                            { l: 'Total Assessments', v: ri.totalAssessments ?? 0 },
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
                        title="Avg Rating by Month"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {ratingByMonthData.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart
                                    data={ratingByMonthData}
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
                                        domain={['auto', 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={ttStyle}
                                        cursor={{ stroke: colors.border }}
                                    />
                                    <Line
                                        dataKey="avg"
                                        name="Avg Rating"
                                        stroke={colors.primary}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Tier Distribution"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {tierDistribData.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={tierDistribData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={72}
                                        paddingAngle={2}
                                    >
                                        {tierDistribData.map((d, i) => (
                                            <Cell key={i} fill={d.color} />
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

                    <ChartCard
                        title="Top Rated Students"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {ri?.topUsers?.length ? (
                            <div
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                            >
                                {ri.topUsers.map((u, i) => {
                                    const tc =
                                        u.currentRating >= 2200
                                            ? '#EF4444'
                                            : u.currentRating >= 2000
                                              ? '#F97316'
                                              : u.currentRating >= 1800
                                                ? '#8B5CF6'
                                                : u.currentRating >= 1600
                                                  ? '#06B6D4'
                                                  : u.currentRating >= 1400
                                                    ? '#3B82F6'
                                                    : u.currentRating >= 1200
                                                      ? '#7FB069'
                                                      : '#9E9E9E';
                                    return (
                                        <div
                                            key={u._id ?? i}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.625rem',
                                                padding: '0.4rem 0',
                                                borderBottom:
                                                    i < ri.topUsers.length - 1
                                                        ? `1px solid ${colors.border}`
                                                        : 'none',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '0.6rem',
                                                    fontFamily: font.mono,
                                                    color: colors.textSub,
                                                    width: 16,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        color: colors.textMain,
                                                        margin: 0,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {u.user?.name ?? 'Unknown'}
                                                </p>
                                                <p
                                                    style={{
                                                        fontSize: '0.65rem',
                                                        color: colors.textSub,
                                                        margin: 0,
                                                        fontFamily: font.mono,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {u.user?.email ?? ''}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <p
                                                    style={{
                                                        fontSize: '0.875rem',
                                                        fontWeight: 700,
                                                        color: tc,
                                                        margin: 0,
                                                        fontFamily: font.mono,
                                                    }}
                                                >
                                                    {u.currentRating}
                                                </p>
                                                <p
                                                    style={{
                                                        fontSize: '0.6rem',
                                                        color: colors.textSub,
                                                        margin: 0,
                                                        fontFamily: font.mono,
                                                    }}
                                                >
                                                    {u.totalAssessments} tests
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>
                </div>

                {/* ════════════════════════════════════════════
                    MOCK INTERVIEW ANALYTICS
                ════════════════════════════════════════════ */}
                <p style={{ ...L, marginBottom: '0.875rem' }}>Mock Interview Analytics</p>

                {/* KPI strip */}
                {mvi && (
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
                            { l: 'Total Interviews', v: mvi.total ?? 0 },
                            { l: 'Completed', v: mvi.completed ?? 0 },
                            { l: 'Completion Rate', v: `${mvi.completionRate ?? 0}%` },
                            { l: 'Avg Score', v: `${mvi.avgScore ?? 0}/100` },
                            {
                                l: 'Avg Duration',
                                v: mvi.avgDurationSeconds
                                    ? `${Math.floor(mvi.avgDurationSeconds / 60)}m ${mvi.avgDurationSeconds % 60}s`
                                    : '—',
                            },
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
                    {/* Score distribution */}
                    <ChartCard
                        title="Interview Score Distribution"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {mvScoreDist.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                    data={mvScoreDist}
                                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                                >
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
                                        name="Interviews"
                                        radius={[4, 4, 0, 0]}
                                        barSize={32}
                                    >
                                        {mvScoreDist.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={
                                                    [
                                                        colors.danger,
                                                        colors.warning,
                                                        colors.primary,
                                                        colors.success,
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

                    {/* Completions by month */}
                    <ChartCard
                        title="Interviews Completed by Month"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {mvByMonth.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart
                                    data={mvByMonth}
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
                                    <Tooltip contentStyle={ttStyle} />
                                    <Line
                                        dataKey="count"
                                        name="Completed"
                                        stroke={'#8B5CF6'}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Line
                                        dataKey="avgScore"
                                        name="Avg Score"
                                        stroke={colors.success}
                                        strokeWidth={2}
                                        dot={false}
                                        strokeDasharray="4 2"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>

                    {/* By experience level */}
                    <ChartCard
                        title="Score by Experience Level"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {mvByExp.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                    data={mvByExp}
                                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                                >
                                    <XAxis
                                        dataKey="level"
                                        tick={axTick}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis tick={axTick} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={ttStyle}
                                        cursor={{ fill: `${colors.primary}10` }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        name="Interviews"
                                        fill={colors.primary}
                                        radius={[4, 4, 0, 0]}
                                        barSize={28}
                                    />
                                    <Bar
                                        dataKey="avgScore"
                                        name="Avg Score"
                                        fill={'#8B5CF6'}
                                        radius={[4, 4, 0, 0]}
                                        barSize={28}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>

                    {/* Status pie */}
                    <ChartCard
                        title="Interview Status Breakdown"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {mvByStatus.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={mvByStatus}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={72}
                                        paddingAngle={2}
                                    >
                                        {mvByStatus.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={
                                                    [
                                                        colors.success,
                                                        colors.warning,
                                                        colors.primary,
                                                        colors.textMuted,
                                                    ][i] ?? PIE_COLS[i]
                                                }
                                            />
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

                    {/* Top job roles */}
                    <ChartCard
                        title="Most Practised Job Roles"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {mvTopRoles.length ? (
                            <div
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
                            >
                                {mvTopRoles.slice(0, 7).map((r, i) => (
                                    <div
                                        key={i}
                                        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                                    >
                                        <span
                                            style={{
                                                fontSize: '0.6rem',
                                                fontFamily: font.mono,
                                                color: colors.textMuted,
                                                width: 16,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 3,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: '0.78rem',
                                                        fontWeight: 600,
                                                        color: colors.textMain,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {r.role}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '0.65rem',
                                                        fontFamily: font.mono,
                                                        color: colors.textSub,
                                                        flexShrink: 0,
                                                        marginLeft: 8,
                                                    }}
                                                >
                                                    {r.count} · avg {r.avgScore}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    height: 3,
                                                    backgroundColor: colors.border,
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        height: '100%',
                                                        width: `${Math.min(100, (r.count / (mvTopRoles[0]?.count || 1)) * 100)}%`,
                                                        backgroundColor: '#8B5CF6',
                                                        borderRadius: 2,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>
                </div>

                {/* ════════════════════════════════════════════
                    RESUME QUALITY ANALYTICS
                ════════════════════════════════════════════ */}
                <p style={{ ...L, marginBottom: '0.875rem' }}>Resume Quality Analytics</p>

                {/* Completeness KPI strip */}
                {rri && (
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
                            { l: 'Total Resumes', v: rri.total ?? 0 },
                            { l: 'Avg Skills', v: rri.avgSkillsPerResume ?? 0 },
                            { l: 'Avg Experience Items', v: rri.avgExperienceEntries ?? 0 },
                            { l: 'Avg Projects', v: rri.avgProjectEntries ?? 0 },
                            { l: 'Have Summary', v: `${completeness.withSummary ?? 0}%` },
                            { l: 'Have Experience', v: `${completeness.withExperience ?? 0}%` },
                            { l: 'Have Projects', v: `${completeness.withProjects ?? 0}%` },
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
                    {/* Avg skills over time */}
                    <ChartCard
                        title="Avg Skills per Resume Over Time"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {avgSkillsTime.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart
                                    data={avgSkillsTime}
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
                                    <YAxis tick={axTick} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={ttStyle} />
                                    <Line
                                        dataKey="avgSkills"
                                        name="Avg Skills"
                                        stroke={colors.primary}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Line
                                        dataKey="uploads"
                                        name="Uploads"
                                        stroke={colors.secondary}
                                        strokeWidth={2}
                                        dot={false}
                                        strokeDasharray="4 2"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>

                    {/* Skill level distribution */}
                    <ChartCard
                        title="Skill Level Distribution"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {skillLevelDist.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={skillLevelDist.map((d) => ({
                                            name: d.level,
                                            value: d.count,
                                        }))}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={72}
                                        paddingAngle={2}
                                    >
                                        {skillLevelDist.map((_, i) => (
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

                    {/* Top missing skills (from gap reports — what resumes NEED) */}
                    <ChartCard
                        title="Skills Most Needed on Resumes"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {topMissing.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                    data={topMissing.map((d) => ({
                                        skill: d.skill,
                                        count: d.count,
                                    }))}
                                    layout="vertical"
                                    margin={{ top: 4, right: 8, left: 4, bottom: 0 }}
                                >
                                    <XAxis
                                        type="number"
                                        tick={axTick}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        dataKey="skill"
                                        type="category"
                                        tick={{ ...axTick, fontSize: 9 }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={80}
                                    />
                                    <Tooltip
                                        contentStyle={ttStyle}
                                        cursor={{ fill: `${colors.warning}10` }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        name="Gap Reports"
                                        fill={colors.warning}
                                        radius={[0, 4, 4, 0]}
                                        barSize={10}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>

                    {/* Re-upload rate */}
                    <ChartCard
                        title="Resume Re-upload Rate"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {reUploadRate.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                    data={reUploadRate}
                                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                                >
                                    <XAxis
                                        dataKey="version"
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
                                        dataKey="users"
                                        name="Users"
                                        fill={colors.primary}
                                        radius={[4, 4, 0, 0]}
                                        barSize={36}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>
                </div>

                {/* ════════════════════════════════════════════
                    REGIONAL SKILL DEMAND MAP
                ════════════════════════════════════════════ */}
                <p style={{ ...L, marginBottom: '0.875rem' }}>Regional Skill Demand Map</p>

                {/* Growth trend summary KPI */}
                {growthSummary.length > 0 && (
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
                        {growthSummary.map(({ trend, count, avgScore }) => (
                            <div
                                key={trend}
                                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                            >
                                <span style={{ color: TREND_COLOR(trend, colors) }}>
                                    {TREND_ICON[trend]}
                                </span>
                                <div>
                                    <p
                                        style={{
                                            ...L,
                                            marginBottom: 2,
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {trend}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: '1.1rem',
                                            fontWeight: 700,
                                            color: colors.textMain,
                                            margin: 0,
                                            fontFamily: font.mono,
                                        }}
                                    >
                                        {count}{' '}
                                        <span
                                            style={{ fontSize: '0.65rem', color: colors.textSub }}
                                        >
                                            skills · avg {avgScore}
                                        </span>
                                    </p>
                                </div>
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
                    {/* Demand over time */}
                    <ChartCard
                        title="Avg Demand Score Over Time"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {demandOverTime.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart
                                    data={demandOverTime}
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
                                        domain={[0, 100]}
                                    />
                                    <Tooltip contentStyle={ttStyle} />
                                    <Line
                                        dataKey="avgScore"
                                        name="Demand Score"
                                        stroke={colors.secondary}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>

                    {/* Top skills globally */}
                    <ChartCard
                        title="Top Skills by Global Demand"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {topGlobal.length ? (
                            <div
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
                            >
                                {topGlobal.slice(0, 8).map((s, i) => {
                                    const tColor = TREND_COLOR(s.dominantTrend, colors);
                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '0.6rem',
                                                    fontFamily: font.mono,
                                                    color: colors.textMuted,
                                                    width: 16,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: 3,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: '0.78rem',
                                                            fontWeight: 600,
                                                            color: colors.textMain,
                                                        }}
                                                    >
                                                        {s.skill}
                                                    </span>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 5,
                                                            flexShrink: 0,
                                                            marginLeft: 8,
                                                        }}
                                                    >
                                                        <span style={{ color: tColor }}>
                                                            {TREND_ICON[s.dominantTrend]}
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontSize: '0.65rem',
                                                                fontFamily: font.mono,
                                                                color: colors.textSub,
                                                            }}
                                                        >
                                                            {s.avgDemandScore}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        height: 3,
                                                        backgroundColor: colors.border,
                                                        borderRadius: 2,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            height: '100%',
                                                            width: `${Math.min(100, s.avgDemandScore)}%`,
                                                            backgroundColor: tColor,
                                                            borderRadius: 2,
                                                            transition: 'width 0.4s ease',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyChart colors={colors} font={font} />
                        )}
                    </ChartCard>

                    {/* Growth trend pie */}
                    <ChartCard
                        title="Growth Trend Breakdown"
                        colors={colors}
                        font={font}
                        radius={radius}
                        shadow={shadow}
                    >
                        {growthSummary.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={growthSummary.map((d) => ({
                                            name: d.trend,
                                            value: d.count,
                                        }))}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={72}
                                        paddingAngle={2}
                                    >
                                        {growthSummary.map((d, i) => (
                                            <Cell key={i} fill={TREND_COLOR(d.trend, colors)} />
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

                {/* Region cards — full-width table */}
                {regionData.length > 0 && (
                    <div
                        style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.lg,
                            backgroundColor: colors.bgCard,
                            overflow: 'hidden',
                            boxShadow: shadow.sm,
                            marginBottom: '2rem',
                        }}
                    >
                        <div
                            style={{
                                padding: '1rem 1.5rem',
                                borderBottom: `1px solid ${colors.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <MapPin size={14} style={{ color: colors.primary }} />
                            <p style={{ ...L }}>Skill Demand by Region</p>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            {regionData.map((region, ri2) => (
                                <div
                                    key={region.region}
                                    style={{
                                        padding: '1rem 1.5rem',
                                        borderBottom:
                                            ri2 < regionData.length - 1
                                                ? `1px solid ${colors.border}`
                                                : 'none',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: '0.625rem',
                                            flexWrap: 'wrap',
                                            gap: 8,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                            }}
                                        >
                                            <MapPin size={12} style={{ color: colors.textSub }} />
                                            <span
                                                style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 700,
                                                    color: colors.textMain,
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {region.region}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 16 }}>
                                            <span
                                                style={{
                                                    fontSize: '0.65rem',
                                                    fontFamily: font.mono,
                                                    color: colors.textSub,
                                                }}
                                            >
                                                avg demand:{' '}
                                                <span
                                                    style={{
                                                        color: colors.textMain,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {region.avgDemandScore}
                                                </span>
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: '0.65rem',
                                                    fontFamily: font.mono,
                                                    color: colors.textSub,
                                                }}
                                            >
                                                skills tracked:{' '}
                                                <span
                                                    style={{
                                                        color: colors.textMain,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {region.totalSkillsTracked}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
                                    >
                                        {region.topSkills.map((sk, si) => {
                                            const tColor = TREND_COLOR(sk.growthTrend, colors);
                                            const barW = Math.min(100, sk.demandScore);
                                            return (
                                                <div
                                                    key={si}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        padding: '0.3rem 0.65rem',
                                                        border: `1px solid ${colors.border}`,
                                                        borderRadius: radius.sm,
                                                        backgroundColor: colors.bgMuted,
                                                        minWidth: 140,
                                                    }}
                                                >
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: 3,
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontSize: '0.72rem',
                                                                    fontWeight: 600,
                                                                    color: colors.textMain,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {sk.skill}
                                                            </span>
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 3,
                                                                    flexShrink: 0,
                                                                    marginLeft: 4,
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        color: tColor,
                                                                        lineHeight: 1,
                                                                    }}
                                                                >
                                                                    {TREND_ICON[sk.growthTrend]}
                                                                </span>
                                                                <span
                                                                    style={{
                                                                        fontSize: '0.6rem',
                                                                        fontFamily: font.mono,
                                                                        color: tColor,
                                                                        fontWeight: 700,
                                                                    }}
                                                                >
                                                                    {sk.demandScore}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div
                                                            style={{
                                                                height: 2,
                                                                backgroundColor: colors.border,
                                                                borderRadius: 1,
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    height: '100%',
                                                                    width: `${barW}%`,
                                                                    backgroundColor: tColor,
                                                                    borderRadius: 1,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── RECENT ACTIVITY ── */}
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
