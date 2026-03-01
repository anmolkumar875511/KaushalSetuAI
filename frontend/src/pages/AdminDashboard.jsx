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

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ingesting, setIngesting] = useState(false);

    const { user } = useContext(AuthContext);
    const { colors } = getThemeColors(user?.theme || 'light');
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const res = await axiosInstance.get('/admin/dashboard');
            setStats(res.data.message);
        } catch (error) {
            console.error('Dashboard fetch failed:', error.response?.data);
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

    if (!user || user.role !== 'admin') {
        return (
            <div className="h-screen flex items-center justify-center text-red-500 font-bold">
                Unauthorized Access
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-gray-500">
                Loading Dashboard...
            </div>
        );
    }

    return (
        <div
            className="min-h-screen py-12 px-4 md:px-8"
            style={{ backgroundColor: colors.bgLight }}
        >
            <main className="max-w-7xl mx-auto space-y-10">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div
                        className="relative pl-5 border-l-4"
                        style={{ borderColor: colors.secondary }}
                    >
                        <h1
                            className="text-3xl md:text-4xl font-bold tracking-tight"
                            style={{ color: colors.textMain }}
                        >
                            System <span style={{ color: colors.primary }}>Overview</span>
                        </h1>
                        <p
                            className="mt-1 text-sm font-medium"
                            style={{ color: colors.textMuted }}
                        >
                            Admin platform metrics & controls
                        </p>
                    </div>

                    <button
                        onClick={handleIngest}
                        disabled={ingesting}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                        style={{
                            backgroundColor: colors.primary,
                            opacity: ingesting ? 0.7 : 1,
                        }}
                    >
                        <RefreshCw className={`w-4 h-4 ${ingesting ? 'animate-spin' : ''}`} />
                        {ingesting ? 'Syncing...' : 'Sync Opportunities'}
                    </button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Users"
                        value={stats?.users?.total || 0}
                        icon={<Users className="w-5 h-5" />}
                        color={colors.primary}
                    />
                    <StatCard
                        title="Active Jobs"
                        value={stats?.opportunities?.active || 0}
                        subtext={`of ${stats?.opportunities?.total || 0}`}
                        icon={<Briefcase className="w-5 h-5" />}
                        color={colors.secondary}
                    />
                    <StatCard
                        title="Roadmaps Created"
                        value={stats?.roadmaps || 0}
                        icon={<Activity className="w-5 h-5" />}
                        color={colors.textMain}
                    />
                    <StatCard
                        title="Resumes Parsed"
                        value={stats?.resumes || 0}
                        icon={<Activity className="w-5 h-5" />}
                        color={colors.primary}
                    />
                </div>

                {/* LOGS */}
                <div
                    className="rounded-3xl overflow-hidden shadow-sm"
                    style={{
                        backgroundColor: colors.bgCard,
                        border: `1px solid ${colors.border}`,
                    }}
                >
                    <div
                        className="px-8 py-6 border-b flex justify-between items-center"
                        style={{ borderColor: colors.border }}
                    >
                        <div className="flex items-center gap-2">
                            <History size={18} style={{ color: colors.primary }} />
                            <h3
                                className="font-bold text-lg"
                                style={{ color: colors.textMain }}
                            >
                                System Activity
                            </h3>
                        </div>
                        <button
                            onClick={() => navigate('/logger')}
                            className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:underline"
                            style={{ color: colors.primary }}
                        >
                            View Logs <ChevronRight size={14} />
                        </button>
                    </div>

                    {stats?.recentLogs?.length ? (
                        stats.recentLogs.map((log) => (
                            <div
                                key={log._id}
                                className="px-8 py-4 border-t flex flex-col md:flex-row md:items-center justify-between gap-4"
                                style={{ borderColor: colors.border }}
                            >
                                <div className="flex items-center gap-4">
                                    <LogLevelBadge level={log.level} />
                                    <div>
                                        <p
                                            className="text-sm font-bold"
                                            style={{ color: colors.textMain }}
                                        >
                                            {log.meta?.action || 'System Event'}
                                        </p>
                                        <p
                                            className="text-xs"
                                            style={{ color: colors.textMuted }}
                                        >
                                            {log.message}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                                    style={{ color: colors.textMuted, opacity: 0.6 }}
                                >
                                    {new Date(log.createdAt).toLocaleString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div
                            className="p-6 text-sm"
                            style={{ color: colors.textMuted }}
                        >
                            No recent logs
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};


const StatCard = ({ title, value, subtext, icon, color }) => {
    const { user } = useContext(AuthContext);
    const { colors } = getThemeColors(user?.theme || 'light');

    return (
        <div
            className="p-6 rounded-3xl flex justify-between items-start transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            style={{
                backgroundColor: colors.bgCard,
                border: `1px solid ${colors.border}`,
            }}
        >
            <div className="space-y-1">
                <p
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: colors.textMuted }}
                >
                    {title}
                </p>
                <h3
                    className="text-3xl font-bold"
                    style={{ color: colors.textMain }}
                >
                    {value}
                </h3>
                {subtext && (
                    <p
                        className="text-xs font-medium"
                        style={{ color: colors.textMuted }}
                    >
                        {subtext}
                    </p>
                )}
            </div>
            <div
                className="p-3 rounded-xl text-white shadow-sm"
                style={{ backgroundColor: color }}
            >
                {icon}
            </div>
        </div>
    );
};

const LogLevelBadge = ({ level }) => {
    const map = {
        info: { color: '#3b82f6', icon: <CheckCircle size={12} /> },
        warn: { color: '#f59e0b', icon: <AlertCircle size={12} /> },
        error: { color: '#ef4444', icon: <AlertCircle size={12} /> },
    };

    const current = map[level] || map.info;

    return (
        <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider"
            style={{
                backgroundColor: `${current.color}20`,
                color: current.color,
            }}
        >
            {current.icon} {level}
        </span>
    );
};

export default AdminDashboard;