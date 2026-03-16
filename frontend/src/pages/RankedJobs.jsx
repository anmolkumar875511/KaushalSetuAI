import React, { useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { MapPin, X, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const RankedJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [roadmapLoading, setRoadmapLoading] = useState(false);

    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    useEffect(() => {
        const fetchRankedJobs = async () => {
            try {
                const res = await axiosInstance.get('/opportunity/ranked');
                setJobs(res.data.data || []);
            } catch (err) {
                console.error('Error fetching ranked jobs:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRankedJobs();
    }, []);

    const handleGenerateRoadmap = async (job) => {
        try {
            setRoadmapLoading(true);
            const res = await axiosInstance.post('/roadmap/generate-ranked-job-roadmap', {
                jobTitle: job.title,
                category: job.category || 'All Categories',
                missingSkills: job.missingSkills,
                opportunityId: job.jobId,
            });
            window.location.href = `/roadmap/${res.data.data._id}`;
        } catch (err) {
            console.error('Roadmap generation failed:', err);
        } finally {
            setRoadmapLoading(false);
        }
    };

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
                padding: '1.125rem',
                backgroundColor: colors.bgCard,
                animation: `pulse 1.5s ease ${i * 0.08}s infinite`,
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div
                        style={{
                            height: 10,
                            width: 70,
                            borderRadius: 4,
                            backgroundColor: colors.border,
                        }}
                    />
                    <div
                        style={{
                            height: 20,
                            width: 44,
                            borderRadius: radius.full,
                            backgroundColor: colors.border,
                        }}
                    />
                </div>
                <div
                    style={{
                        height: 14,
                        width: '65%',
                        borderRadius: 4,
                        backgroundColor: colors.border,
                    }}
                />
                <div
                    style={{
                        height: 10,
                        width: '40%',
                        borderRadius: 4,
                        backgroundColor: colors.border,
                    }}
                />
                <div style={{ display: 'flex', gap: 5 }}>
                    {[48, 56, 40].map((w, j) => (
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
                <div
                    style={{
                        height: 32,
                        borderRadius: radius.md,
                        backgroundColor: colors.border,
                        marginTop: 4,
                    }}
                />
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
                <div style={{ marginBottom: '1.75rem', animation: 'fadeUp 0.3s ease' }}>
                    <p style={{ ...labelStyle, marginBottom: 4 }}>AI Ranked</p>
                    <h1
                        style={{
                            fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                            fontWeight: 700,
                            color: colors.textOnBg,
                            fontFamily: font.display,
                            margin: 0,
                        }}
                    >
                        Ranked Jobs
                    </h1>
                </div>

                {/* ── GRID ── */}
                {!isLoading && jobs.length > 0 && (
                    <p style={{ ...labelStyle, marginBottom: '1rem' }}>
                        {jobs.length} job{jobs.length !== 1 ? 's' : ''} ranked by skill match
                    </p>
                )}

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '0.75rem',
                    }}
                >
                    {isLoading
                        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} i={i} />)
                        : jobs.map((job, i) => (
                              <JobCard
                                  key={i}
                                  job={job}
                                  index={i}
                                  colors={colors}
                                  font={font}
                                  radius={radius}
                                  shadow={shadow}
                                  transition={transition}
                                  onView={() => setSelectedJob(job)}
                              />
                          ))}
                </div>
            </div>

            {/* ── MODAL ── */}
            {selectedJob && (
                <JobModal
                    job={selectedJob}
                    colors={colors}
                    font={font}
                    radius={radius}
                    shadow={shadow}
                    transition={transition}
                    roadmapLoading={roadmapLoading}
                    onClose={() => setSelectedJob(null)}
                    onGenerateRoadmap={() => handleGenerateRoadmap(selectedJob)}
                />
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
   JOB CARD
───────────────────────────────────────────── */
const JobCard = ({ job, index, colors, font, radius, shadow, transition, onView }) => {
    const score = job.weightedScore ?? 0;
    const scoreColor = score >= 70 ? colors.success : score >= 40 ? colors.warning : colors.danger;

    return (
        <div
            className="job-card"
            style={{
                border: `1px solid ${colors.border}`,
                borderRadius: radius.lg,
                backgroundColor: colors.bgCard,
                padding: '1.125rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: shadow.sm,
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                animation: `fadeUp 0.28s ease ${index * 0.035}s both`,
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {/* Score row */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <span
                        style={{
                            fontSize: '0.65rem',
                            color: colors.textSub,
                            fontFamily: font.mono,
                        }}
                    >
                        Match Score
                    </span>
                    <span
                        style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: radius.full,
                            backgroundColor: `${scoreColor}15`,
                            color: scoreColor,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            fontFamily: font.mono,
                        }}
                    >
                        {score}%
                    </span>
                </div>

                {/* Title */}
                <div>
                    <h3
                        style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: colors.textMain,
                            margin: 0,
                            marginBottom: 2,
                            lineHeight: 1.4,
                        }}
                    >
                        {job.title}
                    </h3>
                    <p style={{ fontSize: '0.72rem', color: colors.textSub, margin: 0 }}>
                        {job.company?.name}
                    </p>
                </div>

                {/* Matched skills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {job.matchedSkills?.slice(0, 3).map((skill, i) => (
                        <span
                            key={i}
                            style={{
                                padding: '0.2rem 0.45rem',
                                borderRadius: radius.sm,
                                backgroundColor: `${colors.primary}12`,
                                color: colors.primary,
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                fontFamily: font.mono,
                            }}
                        >
                            {skill}
                        </span>
                    ))}
                </div>

                {/* Location */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: '0.75rem',
                        color: colors.textSub,
                    }}
                >
                    <MapPin size={11} style={{ color: colors.primary, flexShrink: 0 }} />
                    <span>{job.location}</span>
                </div>
            </div>

            {/* CTA */}
            <button
                onClick={onView}
                className="job-cta"
                style={{
                    marginTop: '0.875rem',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    padding: '0.575rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.md,
                    backgroundColor: colors.bgMuted,
                    color: colors.textMain,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    transition: transition.fast,
                    fontFamily: font.mono,
                }}
            >
                View Analysis <ChevronRight size={11} />
            </button>
        </div>
    );
};

/* ─────────────────────────────────────────────
   MODAL
───────────────────────────────────────────── */
const JobModal = ({
    job,
    colors,
    font,
    radius,
    shadow,
    transition,
    roadmapLoading,
    onClose,
    onGenerateRoadmap,
}) => (
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
                maxWidth: 520,
                borderRadius: radius.xl,
                backgroundColor: colors.bgCard,
                border: `1px solid ${colors.border}`,
                boxShadow: shadow.lg,
                overflow: 'hidden',
                animation: 'fadeUp 0.25s ease',
                fontFamily: font.body,
            }}
        >
            {/* Header */}
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
                        {job.title}
                    </h2>
                    <p style={{ fontSize: '0.75rem', color: colors.textSub, margin: 0 }}>
                        {job.company?.name}
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
                        transition: transition.fast,
                    }}
                >
                    <X size={15} />
                </button>
            </div>

            {/* Body */}
            <div
                style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                }}
            >
                {/* Match score */}
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 7,
                        padding: '0.35rem 0.75rem',
                        borderRadius: radius.sm,
                        backgroundColor: `${colors.primary}15`,
                        alignSelf: 'flex-start',
                    }}
                >
                    <TrendingUp size={13} style={{ color: colors.primary }} />
                    <span
                        style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: colors.primary,
                            fontFamily: font.mono,
                        }}
                    >
                        {job.weightedScore}% Match
                    </span>
                </div>

                {/* Missing skills */}
                <div>
                    <p
                        style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.16em',
                            color: colors.textSub,
                            fontFamily: font.mono,
                            margin: 0,
                            marginBottom: 8,
                        }}
                    >
                        Missing Skills
                    </p>
                    {job.missingSkills?.length ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {job.missingSkills.map((skill, i) => (
                                <span
                                    key={i}
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        border: `1px solid ${colors.danger}28`,
                                        borderRadius: radius.sm,
                                        backgroundColor: colors.dangerBg,
                                        color: colors.dangerText,
                                        fontSize: '0.72rem',
                                        fontFamily: font.mono,
                                    }}
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.8rem', color: colors.textSub }}>
                            No missing skills — great match!
                        </p>
                    )}
                </div>
            </div>

            {/* Footer CTA */}
            {job.missingSkills?.length > 0 && (
                <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${colors.border}` }}>
                    <button
                        onClick={onGenerateRoadmap}
                        disabled={roadmapLoading}
                        className="modal-cta"
                        style={{
                            width: '100%',
                            padding: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 7,
                            border: 'none',
                            borderRadius: radius.md,
                            backgroundColor: colors.primary,
                            color: '#ffffff',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            cursor: roadmapLoading ? 'not-allowed' : 'pointer',
                            opacity: roadmapLoading ? 0.65 : 1,
                            transition: transition.fast,
                            fontFamily: font.body,
                        }}
                    >
                        {roadmapLoading ? (
                            <>
                                <Loader2
                                    size={13}
                                    style={{ animation: 'spin 1s linear infinite' }}
                                />{' '}
                                Generating…
                            </>
                        ) : (
                            'Generate Roadmap'
                        )}
                    </button>
                </div>
            )}
        </div>
    </div>
);

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse  { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .job-card:hover   { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
        .job-cta:hover    { background-color: ${colors.bgHover} !important; }
        .modal-close:hover { color: ${colors.textMain} !important; }
        .modal-cta:hover:not(:disabled) { opacity: 0.88 !important; }
    `}</style>
);

export default RankedJobs;
