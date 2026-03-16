import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { Plus, BookOpen, Calendar, ArrowRight, CheckCircle, X, Loader2 } from 'lucide-react';
import { getThemeColors } from '../theme';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const [toastMessage, setToastMessage] = useState(location.state?.message || null);

    const activeRoadmaps = roadmaps.filter((item) => (item.progress || 0) < 100);

    /* ── Toast auto-dismiss ── */
    useEffect(() => {
        if (!toastMessage) return;
        const t = setTimeout(() => {
            setToastMessage(null);
            window.history.replaceState({}, document.title);
        }, 4000);
        return () => clearTimeout(t);
    }, [toastMessage]);

    /* ── Fetch ── */
    useEffect(() => {
        const fetchAllRoadmaps = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get('/roadmap/');
                setRoadmaps(res.data.data || []);
            } catch (err) {
                console.error('Error fetching roadmaps:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllRoadmaps();
    }, []);

    /* ── Shared styles ── */
    const labelStyle = {
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        margin: 0,
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
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: colors.bgPage,
                fontFamily: font.body,
                position: 'relative',
            }}
        >
            <GlobalStyles colors={colors} font={font} />

            {/* ── TOAST ── */}
            {toastMessage && (
                <div
                    style={{
                        position: 'fixed',
                        top: '1.5rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 50,
                        width: '100%',
                        maxWidth: 360,
                        padding: '0 1rem',
                        animation: 'fadeUp 0.3s ease',
                    }}
                >
                    <div
                        style={{
                            backgroundColor: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.lg,
                            padding: '0.875rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            boxShadow: shadow.lg,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: radius.sm,
                                    backgroundColor: colors.successBg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <CheckCircle size={14} style={{ color: colors.success }} />
                            </div>
                            <span
                                style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: colors.textMain,
                                    letterSpacing: '0.02em',
                                }}
                            >
                                {toastMessage}
                            </span>
                        </div>
                        <button
                            onClick={() => setToastMessage(null)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: colors.textSub,
                                padding: 2,
                                display: 'flex',
                                alignItems: 'center',
                                transition: transition.fast,
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            <div
                style={{
                    maxWidth: 1080,
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
                        animation: 'fadeUp 0.3s ease',
                    }}
                >
                    <div>
                        <p style={{ ...labelStyle, marginBottom: 4 }}>Dashboard</p>
                        <h1
                            style={{
                                fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                                fontWeight: 700,
                                color: colors.textOnBg,
                                fontFamily: font.display,
                                margin: 0,
                            }}
                        >
                            Hello,{' '}
                            <span style={{ color: colors.primary }}>
                                {user?.name || 'Explorer'}
                            </span>
                        </h1>
                    </div>

                    <button
                        onClick={() => navigate('/set-target')}
                        className="new-goal-btn"
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
                            cursor: 'pointer',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            transition: transition.fast,
                            fontFamily: font.body,
                        }}
                    >
                        <Plus size={14} /> New Goal
                    </button>
                </div>

                {/* ── EMPTY STATE ── */}
                {activeRoadmaps.length === 0 ? (
                    <div
                        style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.lg,
                            backgroundColor: colors.bgCard,
                            padding: '3rem 1.5rem',
                            textAlign: 'center',
                            animation: 'fadeUp 0.3s ease 0.05s both',
                        }}
                    >
                        <BookOpen
                            size={32}
                            style={{ color: colors.textMuted, margin: '0 auto 0.75rem' }}
                        />
                        <p style={{ fontSize: '0.875rem', color: colors.textSub, margin: 0 }}>
                            No roadmaps generated yet.
                        </p>
                        <button
                            onClick={() => navigate('/set-target')}
                            style={{
                                marginTop: '1rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: colors.primary,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: font.mono,
                            }}
                        >
                            Create your first goal <ArrowRight size={12} />
                        </button>
                    </div>
                ) : (
                    <>
                        <p style={{ ...labelStyle, marginBottom: '1rem' }}>
                            {activeRoadmaps.length} active roadmap
                            {activeRoadmaps.length !== 1 ? 's' : ''}
                        </p>

                        {/* ── GRID ── */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '0.75rem',
                            }}
                        >
                            {activeRoadmaps.map((item, i) => (
                                <RoadmapCard
                                    key={item._id}
                                    item={item}
                                    index={i}
                                    colors={colors}
                                    font={font}
                                    radius={radius}
                                    shadow={shadow}
                                    transition={transition}
                                    navigate={navigate}
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
   ROADMAP CARD
───────────────────────────────────────────── */
const RoadmapCard = ({ item, index, colors, font, radius, shadow, transition, navigate }) => {
    const progress = item.progress || 0;

    return (
        <div
            className="roadmap-card"
            style={{
                border: `1px solid ${colors.border}`,
                borderRadius: radius.lg,
                backgroundColor: colors.bgCard,
                padding: '1.25rem',
                boxShadow: shadow.sm,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                animation: `fadeUp 0.3s ease ${index * 0.04}s both`,
            }}
        >
            {/* Progress badge */}
            <span
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: radius.full,
                    backgroundColor: `${colors.primary}15`,
                    color: colors.primary,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    fontFamily: font.mono,
                }}
            >
                {progress}%
            </span>

            {/* Icon */}
            <div
                style={{
                    width: 34,
                    height: 34,
                    borderRadius: radius.sm,
                    backgroundColor: `${colors.primary}18`,
                    color: colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <BookOpen size={15} />
            </div>

            {/* Title + company */}
            <div style={{ flex: 1, paddingRight: '2.5rem' }}>
                <h2
                    style={{
                        fontSize: '0.925rem',
                        fontWeight: 700,
                        color: colors.textMain,
                        lineHeight: 1.45,
                        margin: 0,
                        marginBottom: 4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {item.opportunity?.title || item.targetSkill?.targetRole || 'Career Roadmap'}
                </h2>
                <p
                    style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        color: colors.textSub,
                        fontFamily: font.mono,
                        margin: 0,
                    }}
                >
                    {item.opportunity?.company?.name || 'Personal Target'}
                </p>
            </div>

            {/* Meta */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    color: colors.textSub,
                    fontSize: '0.75rem',
                }}
            >
                <Calendar size={12} />
                <span>{item.roadmap?.length || 0} weeks</span>
            </div>

            {/* Progress bar */}
            <div
                style={{
                    height: 2,
                    backgroundColor: colors.border,
                    borderRadius: 2,
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${progress}%`,
                        backgroundColor: progress >= 70 ? colors.success : colors.primary,
                        borderRadius: 2,
                        transition: 'width 0.7s ease',
                    }}
                />
            </div>

            {/* CTA */}
            <button
                className="card-cta"
                onClick={() => navigate(`/roadmap/${item._id}`)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '0.6rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.md,
                    backgroundColor: colors.bgMuted,
                    color: colors.textMain,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    transition: transition.fast,
                    fontFamily: font.body,
                }}
            >
                Continue <ArrowRight size={13} />
            </button>
        </div>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors, font }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .roadmap-card:hover  { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
        .card-cta:hover      { background-color: ${colors.bgHover} !important; }
        .new-goal-btn:hover  { opacity: 0.88 !important; }
    `}</style>
);

export default Dashboard;
