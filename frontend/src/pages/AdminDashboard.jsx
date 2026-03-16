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
} from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

/* ─────────────────────────────────────────────
   ADMIN DASHBOARD
───────────────────────────────────────────── */
const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ingesting, setIngesting] = useState(false);

    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const res = await axiosInstance.get('/admin/dashboard');
            setStats(res.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load dashboard');
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') return;
        setLoading(true);
        fetchDashboardData().finally(() => setLoading(false));
    }, [user]);

    const handleIngest = async () => {
        setIngesting(true);
        try {
            await axiosInstance.get('/admin/fetch');
            toast.success('Opportunities synced successfully');
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Sync failed');
        } finally {
            setIngesting(false);
        }
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
                        fontWeight: 600,
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
                <p
                    style={{
                        color: colors.textSub,
                        fontSize: '0.8rem',
                        fontFamily: font.mono,
                        letterSpacing: '0.1em',
                    }}
                >
                    Loading…
                </p>
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
            subtext: `of ${stats?.opportunities?.total || 0} total`,
        },
        {
            title: 'Roadmaps Created',
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
            <GlobalStyles colors={colors} />

            <main
                style={{
                    maxWidth: 1160,
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
                        <p
                            style={{
                                fontSize: 10,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                color: colors.textSub,
                                fontFamily: font.mono,
                                marginBottom: 4,
                            }}
                        >
                            Admin
                        </p>
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
                        className="admin-sync-btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                            padding: '0.6rem 1.125rem',
                            backgroundColor: colors.primary,
                            color: '#ffffff',
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
                        marginBottom: '1.5rem',
                    }}
                >
                    {statCards.map((s) => (
                        <StatCard
                            key={s.title}
                            {...s}
                            colors={colors}
                            font={font}
                            radius={radius}
                            shadow={shadow}
                        />
                    ))}
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
                    {/* Panel header */}
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
                                fontFamily: font.body,
                                padding: 0,
                            }}
                        >
                            View Logs <ChevronRight size={12} />
                        </button>
                    </div>

                    {/* Log rows */}
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
   STAT CARD
───────────────────────────────────────────── */
const StatCard = ({ title, value, subtext, icon, accent, colors, font, radius, shadow }) => (
    <div
        className="stat-card"
        style={{
            padding: '1.125rem 1.25rem',
            borderRadius: radius.lg,
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            boxShadow: shadow.sm,
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        }}
    >
        <div>
            <p
                style={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                    color: colors.textSub,
                    fontFamily: font.mono,
                    marginBottom: 6,
                }}
            >
                {title}
            </p>
            <h3
                style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: colors.textMain,
                    lineHeight: 1,
                    marginBottom: subtext ? 4 : 0,
                }}
            >
                {value}
            </h3>
            {subtext && (
                <p style={{ fontSize: '0.7rem', color: colors.textSub, margin: 0 }}>{subtext}</p>
            )}
        </div>
        <div
            style={{
                width: 32,
                height: 32,
                borderRadius: radius.sm,
                backgroundColor: `${accent}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: accent,
            }}
        >
            {icon}
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   LOG LEVEL BADGE
───────────────────────────────────────────── */
const LogLevelBadge = ({ level, font }) => {
    const map = {
        info: { color: '#3B82F6', icon: <CheckCircle size={10} /> },
        warn: { color: '#F59E0B', icon: <AlertCircle size={10} /> },
        error: { color: '#EF4444', icon: <AlertCircle size={10} /> },
    };
    const { color, icon } = map[level] || map.info;

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '0.25rem 0.5rem',
                borderRadius: 5,
                backgroundColor: `${color}18`,
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

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const GlobalStyles = ({ colors }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .stat-card:hover   { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
        .admin-sync-btn:hover:not(:disabled) { opacity: 0.88 !important; }
        .logs-link:hover   { opacity: 0.7; }
    `}</style>
);

export default AdminDashboard;
