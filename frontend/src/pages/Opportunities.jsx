import React, { useContext, useEffect, useState, useMemo } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, ChevronRight, X, Search } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const Opportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [selectedOp, setSelectedOp] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    useEffect(() => {
        const getOpportunity = async () => {
            try {
                const res = await axiosInstance.get('/opportunity/');
                setOpportunities(res.data.data?.opportunities ?? res.data.data ?? []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        getOpportunity();
    }, []);

    /* ── Filter ── */
    const filtered = useMemo(() => {
        if (!searchTerm.trim()) return opportunities;
        const q = searchTerm.toLowerCase();
        return opportunities.filter(
            (o) =>
                o.title?.toLowerCase().includes(q) ||
                o.company?.name?.toLowerCase().includes(q) ||
                o.category?.toLowerCase().includes(q) ||
                o.location?.toLowerCase().includes(q) ||
                o.requiredSkills?.some((s) => s.toLowerCase().includes(q))
        );
    }, [opportunities, searchTerm]);

    /* ── Shared ── */
    const labelStyle = {
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        margin: 0,
    };

    /* ── Skeleton ── */
    const SkeletonCard = ({ i }) => (
        <div
            style={{
                border: `1px solid ${colors.border}`,
                borderRadius: radius.lg,
                padding: '1.25rem',
                backgroundColor: colors.bgCard,
                animation: `pulse 1.5s ease ${i * 0.08}s infinite`,
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                    style={{
                        height: 10,
                        width: '40%',
                        borderRadius: 4,
                        backgroundColor: colors.border,
                    }}
                />
                <div
                    style={{
                        height: 16,
                        width: '70%',
                        borderRadius: 4,
                        backgroundColor: colors.border,
                    }}
                />
                <div
                    style={{
                        height: 10,
                        width: '30%',
                        borderRadius: 4,
                        backgroundColor: colors.border,
                    }}
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    {[48, 56, 44].map((w, j) => (
                        <div
                            key={j}
                            style={{
                                height: 20,
                                width: w,
                                borderRadius: 4,
                                backgroundColor: colors.border,
                            }}
                        />
                    ))}
                </div>
                <div style={{ height: 1, backgroundColor: colors.border, margin: '4px 0' }} />
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div
                        style={{
                            height: 10,
                            width: 60,
                            borderRadius: 4,
                            backgroundColor: colors.border,
                        }}
                    />
                    <div
                        style={{
                            height: 10,
                            width: 60,
                            borderRadius: 4,
                            backgroundColor: colors.border,
                        }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    <div
                        style={{
                            height: 34,
                            borderRadius: radius.md,
                            backgroundColor: colors.border,
                        }}
                    />
                    <div
                        style={{
                            height: 34,
                            borderRadius: radius.md,
                            backgroundColor: colors.border,
                        }}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} font={font} />

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
                        marginBottom: '1.75rem',
                        animation: 'fadeUp 0.3s ease',
                    }}
                >
                    <div>
                        <p style={{ ...labelStyle, marginBottom: 4 }}>Opportunities</p>
                        <h1
                            style={{
                                fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                                fontWeight: 700,
                                color: colors.textOnBg,
                                fontFamily: font.display,
                                margin: 0,
                            }}
                        >
                            Career Opportunities
                        </h1>
                    </div>

                    {/* ── SEARCH ── */}
                    <div style={{ position: 'relative', width: 'min(100%, 280px)' }}>
                        <Search
                            size={13}
                            style={{
                                position: 'absolute',
                                left: '0.875rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: colors.textSub,
                                pointerEvents: 'none',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search title, company, skill…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.6rem 0.875rem 0.6rem 2.25rem',
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.md,
                                backgroundColor: colors.bgMuted,
                                color: colors.textMain,
                                fontSize: '0.8rem',
                                outline: 'none',
                                fontFamily: font.body,
                                boxSizing: 'border-box',
                                transition: transition.fast,
                            }}
                        />
                    </div>
                </div>

                {/* ── COUNT ── */}
                {!isLoading && (
                    <p style={{ ...labelStyle, marginBottom: '1rem' }}>
                        {filtered.length} opportunit{filtered.length !== 1 ? 'ies' : 'y'}
                        {searchTerm && ` matching "${searchTerm}"`}
                    </p>
                )}

                {/* ── GRID ── */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '0.75rem',
                    }}
                >
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} i={i} />)
                    ) : filtered.length ? (
                        filtered.map((item, index) => (
                            <OpportunityCard
                                key={item._id}
                                item={item}
                                index={index}
                                colors={colors}
                                font={font}
                                radius={radius}
                                shadow={shadow}
                                transition={transition}
                                onView={() => setSelectedOp(item)}
                                onAnalyze={() => navigate(`/analyze/${item._id}`)}
                            />
                        ))
                    ) : (
                        <div
                            style={{
                                gridColumn: '1/-1',
                                padding: '3rem 1.5rem',
                                textAlign: 'center',
                            }}
                        >
                            <p
                                style={{
                                    fontSize: '0.8rem',
                                    color: colors.textSub,
                                    fontFamily: font.mono,
                                }}
                            >
                                No opportunities found{searchTerm ? ` for "${searchTerm}"` : ''}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── MODAL ── */}
            {selectedOp && (
                <OpportunityModal
                    item={selectedOp}
                    colors={colors}
                    font={font}
                    radius={radius}
                    shadow={shadow}
                    transition={transition}
                    onClose={() => setSelectedOp(null)}
                    onAnalyze={() => navigate(`/analyze/${selectedOp._id}`)}
                />
            )}
        </div>
    );
};

/* ── OPPORTUNITY CARD ── */
const OpportunityCard = ({
    item,
    index,
    colors,
    font,
    radius,
    shadow,
    transition,
    onView,
    onAnalyze,
}) => (
    <div
        className="op-card"
        style={{
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            backgroundColor: colors.bgCard,
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: shadow.sm,
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            animation: `fadeUp 0.28s ease ${index * 0.035}s both`,
        }}
    >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
                <p
                    style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.14em',
                        color: colors.textSub,
                        fontFamily: font.mono,
                        margin: 0,
                        marginBottom: 4,
                    }}
                >
                    {item.company.name}
                </p>
                <h3
                    style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: colors.textMain,
                        margin: 0,
                        marginBottom: 3,
                        lineHeight: 1.4,
                    }}
                >
                    {item.title}
                </h3>
                <p
                    style={{
                        fontSize: '0.72rem',
                        fontStyle: 'italic',
                        color: colors.primary,
                        margin: 0,
                    }}
                >
                    {item.category}
                </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {item.requiredSkills.slice(0, 3).map((skill, i) => (
                    <span
                        key={i}
                        style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: radius.sm,
                            border: `1px solid ${colors.primary}28`,
                            backgroundColor: `${colors.primary}10`,
                            color: colors.primary,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            fontFamily: font.mono,
                        }}
                    >
                        {skill}
                    </span>
                ))}
            </div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    paddingTop: '0.625rem',
                    borderTop: `1px solid ${colors.border}`,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem' }}>
                    <Briefcase size={12} style={{ color: colors.primary, flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: colors.textMain }}>
                        {item.experienceLevel}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem' }}>
                    <MapPin size={12} style={{ color: colors.primary, flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: colors.textMain }}>{item.location}</span>
                </div>
            </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <button
                onClick={onView}
                className="view-btn"
                style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.md,
                    backgroundColor: colors.bgMuted,
                    color: colors.textMain,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    transition: transition.fast,
                    fontFamily: font.body,
                }}
            >
                View Details
            </button>
            <button
                onClick={onAnalyze}
                className="analyze-btn"
                style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: 'none',
                    borderRadius: radius.md,
                    backgroundColor: colors.primary,
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    transition: transition.fast,
                    fontFamily: font.body,
                }}
            >
                Generate Skill Gap <ChevronRight size={12} />
            </button>
        </div>
    </div>
);

/* ── MODAL ── */
const OpportunityModal = ({ item, colors, font, radius, shadow, onClose, onAnalyze }) => (
    <div
        style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
        }}
    >
        <div
            onClick={onClose}
            style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: colors.overlay,
                backdropFilter: 'blur(4px)',
            }}
        />
        <div
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: 580,
                borderRadius: radius.xl,
                backgroundColor: colors.bgCard,
                border: `1px solid ${colors.border}`,
                boxShadow: shadow.lg,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '85vh',
                overflow: 'hidden',
                animation: 'fadeUp 0.25s ease',
                fontFamily: font.body,
            }}
        >
            <div
                style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem',
                }}
            >
                <div>
                    <h2
                        style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: colors.textMain,
                            margin: 0,
                            marginBottom: 3,
                        }}
                    >
                        {item.title}
                    </h2>
                    <p
                        style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: colors.secondary,
                            fontFamily: font.mono,
                            margin: 0,
                        }}
                    >
                        {item.company.name}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="modal-close"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: colors.textSub,
                        display: 'flex',
                        alignItems: 'center',
                        padding: 4,
                        borderRadius: radius.sm,
                        flexShrink: 0,
                    }}
                >
                    <X size={16} />
                </button>
            </div>
            <div
                className="custom-scrollbar"
                style={{
                    padding: '1.25rem 1.5rem',
                    overflowY: 'auto',
                    flex: 1,
                    fontSize: '0.85rem',
                    color: colors.textSub,
                    lineHeight: 1.75,
                }}
                dangerouslySetInnerHTML={{ __html: item.description }}
            />
            <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${colors.border}` }}>
                <button
                    onClick={onAnalyze}
                    className="analyze-btn"
                    style={{
                        width: '100%',
                        padding: '0.7rem',
                        border: 'none',
                        borderRadius: radius.md,
                        backgroundColor: colors.primary,
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        transition: 'opacity 0.12s',
                        fontFamily: font.body,
                    }}
                >
                    Analyze Skill Gap Now
                </button>
            </div>
        </div>
    </div>
);

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors, font }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse  { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: ${colors.textMuted}; }
        input:focus { border-color: ${colors.borderFocus} !important; box-shadow: 0 0 0 3px ${colors.primary}18 !important; }
        .op-card:hover     { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
        .view-btn:hover    { background-color: ${colors.bgHover} !important; }
        .analyze-btn:hover { opacity: 0.88 !important; }
        .modal-close:hover { color: ${colors.textMain} !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 10px; }
        @media (max-width: 480px) { input { font-size: 16px !important; } }
    `}</style>
);

export default Opportunities;
