import React, { useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';
import { TrendingUp, BookOpen, Briefcase, X, Loader2, ChevronDown } from 'lucide-react';

const Guidance = () => {
    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    const [jobReports, setJobReports] = useState([]);
    const [interestGuides, setInterestGuides] = useState([]);
    const [freelanceGuides, setFreelanceGuides] = useState([]);
    const [interests, setInterests] = useState([]);
    const [selectedInterest, setSelectedInterest] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [jr, ig, fg] = await Promise.all([
                axiosInstance.get('/guidance/job-readiness'),
                axiosInstance.get('/guidance/interest-guide'),
                axiosInstance.get('/guidance/freelance-guide'),
            ]);
            setJobReports(jr.data.data || []);
            setInterestGuides(ig.data.data || []);
            setFreelanceGuides(fg.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInterests = async () => {
        try {
            const res = await axiosInstance.get('/user/interests');
            const data = res.data.data || [];
            setInterests(data);
            if (data.length) setSelectedInterest(data[0].name);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
        fetchInterests();
    }, []);

    const generateGuide = async (type) => {
        if (!selectedInterest) return;
        const urls = {
            job: '/guidance/job-readiness',
            interest: '/guidance/interest-guide',
            freelance: '/guidance/freelance-guide',
        };
        try {
            setGenerating(true);
            await axiosInstance.post(urls[type], { interest: selectedInterest });
            await fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    /* ── SHARED ── */
    const labelStyle = {
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        margin: 0,
    };

    const genBtnStyle = (disabled) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '0.55rem 0.875rem',
        backgroundColor: disabled ? colors.border : colors.primary,
        color: '#ffffff',
        border: 'none',
        borderRadius: radius.md,
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: transition.fast,
        fontFamily: font.body,
    });

    /* ── SKELETON ── */
    const SkeletonCard = ({ i }) => (
        <div
            style={{
                border: `1px solid ${colors.border}`,
                borderRadius: radius.lg,
                padding: '1.125rem',
                backgroundColor: colors.bgCard,
                animation: `pulse 1.5s ease ${i * 0.1}s infinite`,
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                    style={{
                        height: 14,
                        width: '55%',
                        borderRadius: 4,
                        backgroundColor: colors.border,
                    }}
                />
                <div
                    style={{
                        height: 11,
                        width: '35%',
                        borderRadius: 4,
                        backgroundColor: colors.border,
                    }}
                />
                <div
                    style={{
                        height: 22,
                        width: 48,
                        borderRadius: 6,
                        backgroundColor: colors.border,
                        marginTop: 4,
                    }}
                />
            </div>
        </div>
    );

    /* ── CARD ── */
    const GuidanceCard = ({ title, subtitle, score, onClick, index }) => (
        <div
            className="guidance-card"
            onClick={onClick}
            style={{
                border: `1px solid ${colors.border}`,
                borderRadius: radius.lg,
                backgroundColor: colors.bgCard,
                padding: '1.125rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                boxShadow: shadow.sm,
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                animation: `fadeUp 0.25s ease ${index * 0.04}s both`,
            }}
        >
            <h3
                style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: colors.textMain,
                    margin: 0,
                    lineHeight: 1.4,
                }}
            >
                {title}
            </h3>
            <p style={{ ...labelStyle, margin: 0 }}>{subtitle}</p>
            {score !== undefined && (
                <span
                    style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: radius.sm,
                        backgroundColor: `${colors.primary}15`,
                        color: colors.primary,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        fontFamily: font.mono,
                        marginTop: 2,
                    }}
                >
                    {score}%
                </span>
            )}
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
                <div style={{ marginBottom: '1.75rem', animation: 'fadeUp 0.3s ease' }}>
                    <p style={{ ...labelStyle, marginBottom: 4 }}>Career Intelligence</p>
                    <h1
                        style={{
                            fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                            fontWeight: 700,
                            color: colors.textOnBg,
                            fontFamily: font.display,
                            margin: 0,
                        }}
                    >
                        AI Guidance
                    </h1>
                </div>

                {/* ── CONTROLS ── */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        alignItems: 'center',
                        marginBottom: '2rem',
                        padding: '1rem 1.125rem',
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.lg,
                        backgroundColor: colors.bgCard,
                        boxShadow: shadow.sm,
                    }}
                >
                    {/* Select */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <select
                            value={selectedInterest}
                            onChange={(e) => setSelectedInterest(e.target.value)}
                            style={{
                                padding: '0.55rem 2rem 0.55rem 0.75rem',
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.md,
                                backgroundColor: colors.bgMuted,
                                color: colors.textMain,
                                fontSize: '0.8rem',
                                outline: 'none',
                                appearance: 'none',
                                cursor: 'pointer',
                                fontFamily: font.body,
                                transition: transition.fast,
                            }}
                        >
                            {interests.map((item, i) => (
                                <option key={i} value={item.name}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={12}
                            style={{
                                position: 'absolute',
                                right: '0.625rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: colors.textSub,
                                pointerEvents: 'none',
                            }}
                        />
                    </div>

                    <div
                        style={{
                            width: 1,
                            height: 24,
                            backgroundColor: colors.border,
                            flexShrink: 0,
                        }}
                    />

                    {[
                        { type: 'job', label: 'Job Readiness' },
                        { type: 'interest', label: 'Learning Guide' },
                        { type: 'freelance', label: 'Freelance Guide' },
                    ].map(({ type, label }) => (
                        <button
                            key={type}
                            onClick={() => generateGuide(type)}
                            disabled={generating}
                            className="gen-btn"
                            style={genBtnStyle(generating)}
                        >
                            {generating && (
                                <Loader2
                                    size={11}
                                    style={{ animation: 'spin 1s linear infinite' }}
                                />
                            )}
                            Generate {label}
                        </button>
                    ))}
                </div>

                {/* ── SECTIONS ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <GuidanceSection
                        title="Job Readiness"
                        icon={<TrendingUp size={14} style={{ color: colors.primary }} />}
                        data={jobReports}
                        loading={loading}
                        colors={colors}
                        font={font}
                        SkeletonCard={SkeletonCard}
                        renderCard={(item, i) => (
                            <GuidanceCard
                                key={i}
                                index={i}
                                title={item.interest}
                                subtitle="Readiness Score"
                                score={item.readinessScore}
                                onClick={() => {
                                    setSelectedItem(item);
                                    setSelectedType('job');
                                }}
                            />
                        )}
                    />
                    <GuidanceSection
                        title="Learning Roadmaps"
                        icon={<BookOpen size={14} style={{ color: colors.primary }} />}
                        data={interestGuides}
                        loading={loading}
                        colors={colors}
                        font={font}
                        SkeletonCard={SkeletonCard}
                        renderCard={(item, i) => (
                            <GuidanceCard
                                key={i}
                                index={i}
                                title={item.interest}
                                subtitle={item.estimatedDuration}
                                onClick={() => {
                                    setSelectedItem(item);
                                    setSelectedType('interest');
                                }}
                            />
                        )}
                    />
                    <GuidanceSection
                        title="Freelance Strategies"
                        icon={<Briefcase size={14} style={{ color: colors.primary }} />}
                        data={freelanceGuides}
                        loading={loading}
                        colors={colors}
                        font={font}
                        SkeletonCard={SkeletonCard}
                        renderCard={(item, i) => (
                            <GuidanceCard
                                key={i}
                                index={i}
                                title={item.interest}
                                subtitle="Freelance Strategy"
                                onClick={() => {
                                    setSelectedItem(item);
                                    setSelectedType('freelance');
                                }}
                            />
                        )}
                    />
                </div>
            </div>

            {/* ── MODAL ── */}
            {selectedItem && (
                <Modal
                    item={selectedItem}
                    type={selectedType}
                    colors={colors}
                    font={font}
                    radius={radius}
                    shadow={shadow}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
   SECTION
───────────────────────────────────────────── */
const GuidanceSection = ({
    title,
    icon,
    data,
    loading,
    SkeletonCard,
    renderCard,
    colors,
    font,
}) => (
    <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: '0.875rem' }}>
            {icon}
            <h2
                style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.textMain, margin: 0 }}
            >
                {title}
            </h2>
            {!loading && (
                <span
                    style={{
                        fontSize: '0.6rem',
                        fontFamily: font.mono,
                        color: colors.textSub,
                        marginLeft: 2,
                    }}
                >
                    {data.length}
                </span>
            )}
        </div>
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '0.5rem',
            }}
        >
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} i={i} />)
            ) : data?.length ? (
                data.map(renderCard)
            ) : (
                <p style={{ fontSize: '0.8rem', color: colors.textSub, fontFamily: font.mono }}>
                    No reports yet
                </p>
            )}
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   MODAL
───────────────────────────────────────────── */
const Modal = ({ item, type, colors, font, radius, shadow, onClose }) => {
    const labelStyle = {
        fontSize: 10,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        margin: 0,
        marginBottom: 6,
    };
    const sectionStyle = { display: 'flex', flexDirection: 'column', gap: '0.375rem' };
    const itemStyle = {
        fontSize: '0.8rem',
        color: colors.textSub,
        lineHeight: 1.55,
        paddingLeft: '0.75rem',
        borderLeft: `2px solid ${colors.border}`,
    };

    return (
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
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: colors.overlay,
                    backdropFilter: 'blur(4px)',
                }}
            />

            {/* Panel */}
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
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: `1px solid ${colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                    }}
                >
                    <div>
                        <p style={{ ...labelStyle, marginBottom: 3 }}>
                            {type === 'job'
                                ? 'Job Readiness'
                                : type === 'interest'
                                  ? 'Learning Roadmap'
                                  : 'Freelance Strategy'}
                        </p>
                        <h2
                            style={{
                                fontSize: '1rem',
                                fontWeight: 700,
                                color: colors.textMain,
                                margin: 0,
                            }}
                        >
                            {item.interest}
                        </h2>
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
                            transition: 'color 0.12s',
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div
                    style={{
                        padding: '1.25rem 1.5rem',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                    }}
                    className="custom-scrollbar"
                >
                    {type === 'job' && (
                        <>
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '0.3rem 0.625rem',
                                    borderRadius: radius.sm,
                                    backgroundColor: `${colors.primary}15`,
                                    color: colors.primary,
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    fontFamily: font.mono,
                                    alignSelf: 'flex-start',
                                }}
                            >
                                Readiness · {item.readinessScore}%
                            </div>
                            <div>
                                <p style={labelStyle}>Strengths</p>
                                <div style={sectionStyle}>
                                    {item.strengths?.map((s, i) => (
                                        <p key={i} style={itemStyle}>
                                            {s}
                                        </p>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p style={labelStyle}>Missing Skills</p>
                                <div style={sectionStyle}>
                                    {item.missingSkills?.map((s, i) => (
                                        <p
                                            key={i}
                                            style={{ ...itemStyle, borderLeftColor: colors.danger }}
                                        >
                                            {s}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {type === 'interest' && (
                        <>
                            <p
                                style={{
                                    fontSize: '0.85rem',
                                    color: colors.textSub,
                                    lineHeight: 1.7,
                                    margin: 0,
                                }}
                            >
                                {item.description}
                            </p>
                            {item.roadmap?.map((stage, i) => (
                                <div key={i}>
                                    <p
                                        style={{
                                            ...labelStyle,
                                            marginBottom: 4,
                                            color: colors.primary,
                                        }}
                                    >
                                        {stage.level}
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: colors.textSub }}>
                                        {stage.skills.join(', ')}
                                    </p>
                                </div>
                            ))}
                        </>
                    )}

                    {type === 'freelance' && (
                        <>
                            <div>
                                <p style={labelStyle}>Platforms</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {item.platforms?.map((p, i) => (
                                        <a
                                            key={i}
                                            href={p.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                fontSize: '0.8rem',
                                                color: colors.primary,
                                                textDecoration: 'none',
                                                fontWeight: 500,
                                            }}
                                            className="modal-link"
                                        >
                                            {p.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p style={labelStyle}>Services to Offer</p>
                                <div style={sectionStyle}>
                                    {item.servicesToOffer?.slice(0, 6).map((s, i) => (
                                        <p key={i} style={itemStyle}>
                                            {s}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors, font }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        select:focus { border-color: ${colors.borderFocus} !important; outline: none; }
        .guidance-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
        .gen-btn:hover:not(:disabled) { opacity: 0.85 !important; }
        .modal-close:hover { color: ${colors.textMain} !important; }
        .modal-link:hover  { text-decoration: underline !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 10px; }
    `}</style>
);

export default Guidance;
