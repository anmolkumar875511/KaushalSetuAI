import React, { useState, useEffect, useContext } from 'react';
import { Download, AlertCircle, CheckCircle, ScrollText, History } from 'lucide-react';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const LogLevelBadge = ({ level }) => {
    const {user} = useContext(AuthContext)
    const { colors } = getThemeColors(user?.theme || 'light');
    const config = {
        info: { color: '#3b82f6', icon: <CheckCircle className="w-3 h-3" /> },
        warn: { color: '#f59e0b', icon: <AlertCircle className="w-3 h-3" /> },
        error: { color: '#ef4444', icon: <AlertCircle className="w-3 h-3" /> },
    };

    const current = config[level] || config.info;

    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border"
            style={{
                backgroundColor: `${current.color}10`,
                color: current.color,
                borderColor: `${current.color}20`,
            }}
        >
            {current.icon} {level}
        </span>
    );
};

const Logger = () => {
    const {user} = useContext(AuthContext)
    const { colors } = getThemeColors(user?.theme || 'light');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/admin/logs?limit=20');
            setLogs(res.data.data.logs);
        } catch (error) {
            console.error('Failed to load logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleExportLogs = () => {
        window.open('https://skillbridge-server-zeta.vercel.app/api/v1/admin/logs/export', '_blank');
    };

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div
                    className="w-10 h-10 border-2 rounded-full animate-spin"
                    style={{
                        borderColor: colors.primary,
                        borderTopColor: 'transparent',
                    }}
                ></div>
                <p
                    className="text-xs font-bold uppercase tracking-widest opacity-50"
                    style={{ color: colors.textMuted }}
                >
                    Retrieving Logs...
                </p>
            </div>
        );

    return (
        /* The max-w-5xl and mx-auto keeps the UI in the center of the screen */
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 animate-fade-in">
            {/* Header Section - Decent & Branded */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div
                    className="relative pl-5 border-l-4"
                    style={{ borderColor: colors.secondary }}
                >
                    <h1
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: colors.textMain }}
                    >
                        System <span style={{ color: colors.primary }}>Activity</span>
                    </h1>
                    <p
                        className="mt-1 text-sm font-medium"
                        style={{ color: colors.textMuted }}
                    >
                        Audit trail of platform events and security logs.
                    </p>
                </div>

                <button
                    onClick={handleExportLogs}
                    className="flex items-center gap-2 px-6 py-3 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-md transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: colors.textMain }}
                >
                    <Download size={14} />
                    Export Audit Log
                </button>
            </div>

            {/* Table Section - Clean & Decent */}
            <div
                className=" rounded-3xl border shadow-sm overflow-hidden"
                style={{ borderColor: colors.border }}
            >
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr
                                className=" border-b"
                                style={{ borderColor: colors.border }}
                            >
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Timestamp
                                </th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Severity
                                </th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Action
                                </th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Initiator
                                </th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: colors.border }}>
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr
                                        key={log._id}
                                        className="transition-colors group"
                                    >
                                        <td className="px-8 py-4 whitespace-nowrap">
                                            <p
                                                className="text-xs font-bold"
                                                style={{ color: colors.textMain }}
                                            >
                                                {new Date(log.createdAt).toLocaleDateString()}
                                            </p>
                                            <p
                                                className="text-[10px] font-medium opacity-50"
                                                style={{ color: colors.textMuted }}
                                            >
                                                {new Date(log.createdAt).toLocaleTimeString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <LogLevelBadge level={log.level} />
                                        </td>
                                        <td
                                            className="px-6 py-4 text-[11px] font-bold uppercase tracking-wide"
                                            style={{ color: colors.primary }}
                                        >
                                            {log.meta?.action || 'SYSTEM_EVENT'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border"
                                                    style={{
                                                        backgroundColor: colors.bgLight,
                                                        color: colors.textMuted,
                                                        borderColor: colors.border,
                                                    }}
                                                >
                                                    {log.user?.email
                                                        ? log.user.email[0].toUpperCase()
                                                        : 'S'}
                                                </div>
                                                <span
                                                    className="text-xs font-semibold"
                                                    style={{ color: colors.textMain }}
                                                >
                                                    {log.user?.email || 'System'}
                                                </span>
                                            </div>
                                        </td>
                                        <td
                                            className="px-8 py-4 text-xs font-medium max-w-xs xl:max-w-md truncate group-hover:whitespace-normal"
                                            style={{ color: colors.textMuted }}
                                        >
                                            {log.message}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div
                                            className="flex flex-col items-center opacity-20"
                                            style={{ color: colors.textMuted }}
                                        >
                                            <History size={48} className="mb-3" />
                                            <p className="text-xs font-bold uppercase tracking-[0.2em]">
                                                No Activity Logged
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .custom-scrollbar::-webkit-scrollbar { height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 10px; }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `,
                }}
            />
        </div>
    );
};

export default Logger;
