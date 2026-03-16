import React, { useState, useEffect, useContext } from 'react';
import { Download, AlertCircle, CheckCircle, History, Loader2 } from 'lucide-react';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

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

/* ─────────────────────────────────────────────
   LOGGER
───────────────────────────────────────────── */
const Logger = () => {
    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow } = getThemeColors(user?.theme || 'light');

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axiosInstance.get('/admin/logs?limit=20');
                setLogs(res.data.data.logs);
            } catch (err) {
                console.error('Failed to load logs', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const handleExportLogs = () => {
        window.open(
            'https://skillbridge-server-zeta.vercel.app/api/v1/admin/logs/export',
            '_blank'
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

    const thStyle = {
        padding: '0.75rem 1rem',
        fontSize: '0.6rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        color: colors.textSub,
        fontFamily: font.mono,
        textAlign: 'left',
        whiteSpace: 'nowrap',
    };

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
            <GlobalStyles colors={colors} />

            <div
                style={{
                    maxWidth: 1080,
                    margin: '0 auto',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem',
                    animation: 'fadeUp 0.3s ease',
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
                        marginBottom: '1.75rem',
                    }}
                >
                    <div>
                        <p style={{ ...labelStyle, marginBottom: 4 }}>Admin · Audit</p>
                        <h1
                            style={{
                                fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                                fontWeight: 700,
                                color: colors.textOnBg,
                                fontFamily: font.display,
                                margin: 0,
                            }}
                        >
                            System Activity
                        </h1>
                    </div>

                    <button
                        onClick={handleExportLogs}
                        className="export-btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                            padding: '0.6rem 1.125rem',
                            backgroundColor: colors.bgCard,
                            color: colors.textMain,
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.md,
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            fontFamily: font.body,
                            boxShadow: shadow.sm,
                        }}
                    >
                        <Download size={13} /> Export Logs
                    </button>
                </div>

                {/* ── TABLE ── */}
                <div
                    style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.lg,
                        backgroundColor: colors.bgCard,
                        overflow: 'hidden',
                        boxShadow: shadow.sm,
                    }}
                >
                    <div className="log-scroll" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                                    {[
                                        'Timestamp',
                                        'Severity',
                                        'Action',
                                        'Initiator',
                                        'Details',
                                    ].map((h) => (
                                        <th key={h} style={thStyle}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length > 0 ? (
                                    logs.map((log, i) => (
                                        <tr
                                            key={log._id}
                                            className="log-row"
                                            style={{
                                                borderTop: `1px solid ${colors.border}`,
                                                animation: `fadeUp 0.22s ease ${i * 0.025}s both`,
                                            }}
                                        >
                                            {/* Timestamp */}
                                            <td
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        fontSize: '0.775rem',
                                                        fontWeight: 600,
                                                        color: colors.textMain,
                                                        margin: 0,
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    {new Date(log.createdAt).toLocaleDateString()}
                                                </p>
                                                <p
                                                    style={{
                                                        fontSize: '0.65rem',
                                                        color: colors.textSub,
                                                        fontFamily: font.mono,
                                                        margin: 0,
                                                    }}
                                                >
                                                    {new Date(log.createdAt).toLocaleTimeString()}
                                                </p>
                                            </td>

                                            {/* Severity */}
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <LogLevelBadge level={log.level} font={font} />
                                            </td>

                                            {/* Action */}
                                            <td
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.08em',
                                                        color: colors.primary,
                                                        fontFamily: font.mono,
                                                    }}
                                                >
                                                    {log.meta?.action || 'SYSTEM_EVENT'}
                                                </span>
                                            </td>

                                            {/* Initiator */}
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 7,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: radius.sm,
                                                            backgroundColor: colors.bgMuted,
                                                            border: `1px solid ${colors.border}`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.6rem',
                                                            fontWeight: 700,
                                                            color: colors.textSub,
                                                            fontFamily: font.mono,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {log.user?.email
                                                            ? log.user.email[0].toUpperCase()
                                                            : 'S'}
                                                    </div>
                                                    <span
                                                        style={{
                                                            fontSize: '0.775rem',
                                                            color: colors.textMain,
                                                            fontWeight: 500,
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {log.user?.email || 'System'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Details */}
                                            <td style={{ padding: '0.75rem 1rem', maxWidth: 280 }}>
                                                <p
                                                    className="log-detail"
                                                    style={{
                                                        fontSize: '0.775rem',
                                                        color: colors.textSub,
                                                        margin: 0,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {log.message}
                                                </p>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            style={{ padding: '3rem', textAlign: 'center' }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                }}
                                            >
                                                <History
                                                    size={28}
                                                    style={{ color: colors.textMuted }}
                                                />
                                                <p
                                                    style={{
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.16em',
                                                        color: colors.textMuted,
                                                        fontFamily: font.mono,
                                                    }}
                                                >
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

                {/* Row count */}
                {logs.length > 0 && (
                    <p
                        style={{
                            marginTop: '0.75rem',
                            fontSize: '0.7rem',
                            color: colors.textSub,
                            fontFamily: font.mono,
                            letterSpacing: '0.06em',
                        }}
                    >
                        Showing {logs.length} log{logs.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>
        </div>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .log-row:hover { background-color: ${colors.bgHover} !important; }
        .log-row:hover .log-detail { white-space: normal !important; overflow: visible !important; text-overflow: unset !important; }
        .export-btn:hover { background-color: ${colors.bgMuted} !important; }
        .log-scroll::-webkit-scrollbar { height: 3px; }
        .log-scroll::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 10px; }
    `}</style>
);

export default Logger;
