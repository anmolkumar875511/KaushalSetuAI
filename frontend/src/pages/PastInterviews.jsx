import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { getThemeColors } from '../theme.js';
import { Mic, Clock, ChevronRight, Loader2, Trophy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLOR = (status, colors) => ({
    completed: colors.success,
    in_progress: colors.warning,
    evaluating: colors.warning,
    pending: colors.textMuted,
}[status] || colors.textMuted);

const STATUS_LABEL = {
    completed: 'Completed',
    in_progress: 'In Progress',
    evaluating: 'Evaluating',
    pending: 'Pending',
};

const PastInterviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axiosInstance.get('/mock-interview');
                setInterviews(res.data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this interview?')) return;
        setDeletingId(id);
        try {
            await axiosInstance.delete(`/mock-interview/${id}`);
            setInterviews((prev) => prev.filter((i) => i._id !== id));
            toast.success('Interview deleted');
        } catch (err) {
            toast.error('Failed to delete');
        } finally {
            setDeletingId(null);
        }
    };

    const labelStyle = {
        fontSize: 10, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: colors.textSub,
        fontFamily: font.mono, margin: 0,
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GlobalStyles colors={colors} />
                <Loader2 size={18} style={{ color: colors.textSub, animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} />
            <div style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem' }}>

                {/* Header */}
                <div style={{ marginBottom: '1.75rem', animation: 'fadeUp 0.3s ease', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <p style={{ ...labelStyle, marginBottom: 4 }}>History</p>
                        <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700, color: colors.textOnBg, fontFamily: font.display, margin: 0 }}>
                            Past Interviews
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate('/mock-interview')}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '0.5rem 1rem', border: 'none',
                            borderRadius: radius.md, backgroundColor: colors.primary,
                            color: '#fff', fontSize: '0.8rem', fontWeight: 700,
                            cursor: 'pointer', fontFamily: font.body,
                        }}
                    >
                        <Mic size={13} /> New Interview
                    </button>
                </div>

                {/* Empty state */}
                {interviews.length === 0 ? (
                    <div style={{ border: `1px solid ${colors.border}`, borderRadius: radius.lg, backgroundColor: colors.bgCard, padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center', animation: 'fadeUp 0.3s ease' }}>
                        <Mic size={32} style={{ color: colors.textMuted }} />
                        <p style={{ fontSize: '0.875rem', color: colors.textSub, margin: 0 }}>No interviews yet</p>
                        <button onClick={() => navigate('/mock-interview')} style={{ marginTop: 8, padding: '0.5rem 1.25rem', border: `1px solid ${colors.border}`, borderRadius: radius.md, backgroundColor: 'transparent', color: colors.textMain, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: font.body }}>
                            Start your first interview
                        </button>
                    </div>
                ) : (
                    <>
                        <p style={{ ...labelStyle, marginBottom: '1rem' }}>
                            {interviews.length} interview{interviews.length !== 1 ? 's' : ''}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                            {interviews.map((iv, i) => (
                                <InterviewCard
                                    key={iv._id}
                                    iv={iv}
                                    index={i}
                                    colors={colors}
                                    font={font}
                                    radius={radius}
                                    shadow={shadow}
                                    transition={transition}
                                    deleting={deletingId === iv._id}
                                    onView={() => navigate(`/mock-interview/${iv._id}/results`)}
                                    onDelete={(e) => handleDelete(iv._id, e)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   INTERVIEW CARD
───────────────────────────────────────────── */
const InterviewCard = ({ iv, index, colors, font, radius, shadow, transition, deleting, onView, onDelete }) => {
    const score = iv.overallScore ?? null;
    const scoreColor =
        score === null ? colors.textSub :
        score >= 70 ? colors.success :
        score >= 45 ? colors.warning :
        colors.danger;

    const statusColor = STATUS_COLOR(iv.status, colors);
    const durationStr = iv.duration
        ? `${Math.floor(iv.duration / 60)}m ${iv.duration % 60}s`
        : null;

    return (
        <div
            className="iv-card"
            style={{
                border: `1px solid ${colors.border}`,
                borderRadius: radius.lg, backgroundColor: colors.bgCard,
                padding: '1.25rem', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', boxShadow: shadow.sm,
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                animation: `fadeUp 0.28s ease ${index * 0.04}s both`,
                opacity: deleting ? 0.5 : 1,
            }}
        >
            {/* Top */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Role + status */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.textMain, margin: '0 0 3px', textTransform: 'capitalize' }}>
                            {iv.jobRole}
                        </h2>
                        <p style={{ fontSize: '0.65rem', fontStyle: 'italic', color: colors.primary, margin: 0, fontFamily: font.mono, textTransform: 'capitalize' }}>
                            {iv.experienceLevel}
                        </p>
                    </div>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: font.mono, flexShrink: 0 }}>
                        {STATUS_LABEL[iv.status]}
                    </span>
                </div>

                {/* Score */}
                {score !== null && (
                    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3 }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{score}</span>
                        <span style={{ fontSize: '0.7rem', color: colors.textSub, fontFamily: font.mono }}>/100</span>
                    </div>
                )}

                {/* Details */}
                <div style={{ paddingTop: '0.625rem', borderTop: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <p style={{ fontSize: '0.72rem', color: colors.textSub, margin: 0, fontFamily: font.mono }}>
                        {iv.totalQuestions} questions
                    </p>
                    {iv.focusAreas?.length > 0 && (
                        <p style={{ fontSize: '0.72rem', color: colors.textSub, margin: 0, fontFamily: font.mono }}>
                            {iv.focusAreas.slice(0, 3).join(', ')}{iv.focusAreas.length > 3 ? '…' : ''}
                        </p>
                    )}
                    {durationStr && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: colors.textSub, fontFamily: font.mono }}>
                            <Clock size={11} /> {durationStr}
                        </div>
                    )}
                    {iv.createdAt && (
                        <p style={{ fontSize: '0.68rem', color: colors.textMuted, margin: 0, fontFamily: font.mono }}>
                            {new Date(iv.createdAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
                <button
                    onClick={onView}
                    className="iv-cta"
                    style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        padding: '0.6rem', border: `1px solid ${colors.border}`, borderRadius: radius.md,
                        backgroundColor: colors.bgMuted, color: colors.textMain,
                        fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                        letterSpacing: '0.04em', textTransform: 'uppercase', transition: transition.fast, fontFamily: font.body,
                    }}
                >
                    {iv.status === 'completed' ? 'View Results' : 'Continue'} <ChevronRight size={12} />
                </button>
                <button
                    onClick={onDelete}
                    disabled={deleting}
                    style={{
                        width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${colors.border}`, borderRadius: radius.md,
                        backgroundColor: 'transparent', color: colors.danger,
                        cursor: deleting ? 'not-allowed' : 'pointer',
                        transition: transition.fast,
                    }}
                >
                    {deleting ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                </button>
            </div>
        </div>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .iv-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
        .iv-cta:hover  { background-color: ${colors?.bgHover} !important; }
    `}</style>
);

export default PastInterviews;