import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, ArrowRight, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const CompletedRoadmap = () => {
    const [completed, setCompleted] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosInstance.get('/roadmap/completed');
                setCompleted(res.data.data || []);
            } catch (err) {
                console.error('Error fetching completed roadmaps:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    /* ── SHARED ── */
    const labelStyle = {
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        margin: 0,
    };

    /* ── LOADING ── */
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

    /* ════════════════════════════════
       MAIN
    ════════════════════════════════ */
    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} />

            <div
                style={{
                    maxWidth: 1080,
                    margin: '0 auto',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem',
                }}
            >
                {/* ── HEADER ── */}
                <div style={{ marginBottom: '2rem', animation: 'fadeUp 0.3s ease' }}>
                    <p style={{ ...labelStyle, marginBottom: 4 }}>Achievements</p>
                    <h1
                        style={{
                            fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                            fontWeight: 700,
                            color: colors.textOnBg,
                            fontFamily: font.display,
                            margin: 0,
                        }}
                    >
                        Mission Accomplished
                    </h1>
                </div>

                {/* ── EMPTY STATE ── */}
                {completed.length === 0 ? (
                    <div
                        style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.lg,
                            backgroundColor: colors.bgCard,
                            padding: '3rem 1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.75rem',
                            textAlign: 'center',
                            animation: 'fadeUp 0.3s ease',
                        }}
                    >
                        <Trophy size={32} style={{ color: colors.textMuted }} />
                        <p style={{ fontSize: '0.875rem', color: colors.textSub, margin: 0 }}>
                            No roadmaps completed yet. Keep pushing!
                        </p>
                        <button
                            onClick={() => navigate('/Dashboard')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                marginTop: '0.5rem',
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
                            <ArrowLeft size={12} /> Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <>
                        <p style={{ ...labelStyle, marginBottom: '1rem' }}>
                            {completed.length} completed path{completed.length !== 1 ? 's' : ''}
                        </p>

                        {/* ── GRID ── */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '0.75rem',
                            }}
                        >
                            {completed.map((item, i) => (
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
const RoadmapCard = ({ item, index, colors, font, radius, shadow, transition, navigate }) => (
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
            gap: '1rem',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            animation: `fadeUp 0.3s ease ${index * 0.04}s both`,
        }}
    >
        {/* Finished badge */}
        <span
            style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '0.25rem 0.5rem',
                borderRadius: radius.full,
                backgroundColor: colors.successBg,
                color: colors.success,
                fontSize: '0.6rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: font.mono,
            }}
        >
            <CheckCircle size={9} /> Done
        </span>

        {/* Icon */}
        <div
            style={{
                width: 34,
                height: 34,
                borderRadius: radius.sm,
                backgroundColor: `${colors.primary}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.primary,
                flexShrink: 0,
            }}
        >
            <Trophy size={15} />
        </div>

        {/* Title + company */}
        <div style={{ flex: 1 }}>
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
                {item.opportunity?.title || 'Career Roadmap'}
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
                {item.opportunity?.company?.name || 'Target Goal'}
            </p>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    color: colors.success,
                    fontSize: '0.75rem',
                }}
            >
                <CheckCircle size={12} />
                <span>Validated</span>
            </div>
        </div>

        {/* Full progress bar */}
        <div
            style={{
                height: 2,
                backgroundColor: colors.border,
                borderRadius: 2,
                overflow: 'hidden',
            }}
        >
            <div style={{ height: '100%', width: '100%', backgroundColor: colors.success }} />
        </div>

        {/* CTA */}
        <button
            className="card-cta"
            onClick={() => navigate(`/roadmap/${item._id}`, { state: { from: 'completed' } })}
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
            Review Roadmap <ArrowRight size={13} />
        </button>
    </div>
);

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .roadmap-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
        .card-cta:hover { background-color: ${colors.bgHover} !important; }
    `}</style>
);

export default CompletedRoadmap;
