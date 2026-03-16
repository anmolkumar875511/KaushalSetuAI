import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import {
    CheckCircle,
    Circle,
    BookOpen,
    ExternalLink,
    ClipboardList,
    ArrowLeft,
    PartyPopper,
    Lock,
    SearchX,
    Youtube,
    Trash2,
    AlertTriangle,
    X,
    Loader2,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const Roadmap = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    const [roadmapData, setRoadmapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showHurray, setShowHurray] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isReadonly = roadmapData?.progress === 100;

    /* ── Fetch ── */
    const fetchSingleRoadmap = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/roadmap');
            const selected = res.data.data.find((r) => r._id === id);
            setRoadmapData(selected || null);
        } catch (err) {
            console.error('Error fetching roadmap:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchSingleRoadmap();
    }, [id]);

    /* ── Auto-complete check ── */
    useEffect(() => {
        if (!roadmapData?.roadmap || isReadonly) return;
        const allTasks = roadmapData.roadmap.flatMap((w) => w.tasks);
        if (allTasks.length > 0 && allTasks.every((t) => t.isCompleted)) handleCompletion();
    }, [roadmapData]);

    /* ── Helpers ── */
    const calculateProgress = (roadmap) => {
        const all = roadmap.flatMap((w) => w.tasks);
        return all.length === 0
            ? 0
            : Math.round((all.filter((t) => t.isCompleted).length / all.length) * 100);
    };

    const handleCompletion = () => {
        setShowHurray(true);
        setTimeout(() => navigate('/dashboard'), 3500);
    };

    const toggleTask = async (weekIndex, taskId) => {
        if (isReadonly) return;
        const updated = { ...roadmapData };
        const task = updated.roadmap[weekIndex].tasks.find((t) => t._id === taskId);
        if (task) {
            task.isCompleted = !task.isCompleted;
            updated.progress = calculateProgress(updated.roadmap);
        }
        setRoadmapData(updated);
        try {
            await axiosInstance.patch(`/roadmap/${id}/task/${taskId}`);
        } catch (err) {
            console.error('Sync failed:', err);
            fetchSingleRoadmap();
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await axiosInstance.delete(`/roadmap/${id}`);
            navigate('/dashboard', {
                state: { message: 'Roadmap deleted successfully', type: 'success' },
            });
        } catch (err) {
            console.error('Delete failed:', err);
            setIsDeleting(false);
            setShowDeleteModal(false);
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

    const backLabel = isReadonly ? 'Back to Completed' : 'Back to Dashboard';
    const backPath = isReadonly ? '/complete_roadmap' : '/Dashboard';

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
                <GlobalStyles colors={colors} font={font} />
                <div style={{ textAlign: 'center' }}>
                    <Loader2
                        size={20}
                        style={{
                            color: colors.primary,
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 8px',
                        }}
                    />
                    <p
                        style={{
                            fontSize: '0.72rem',
                            color: colors.textSub,
                            fontFamily: font.mono,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                        }}
                    >
                        Curating your path…
                    </p>
                </div>
            </div>
        );
    }

    /* ── Not found ── */
    if (!roadmapData) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: colors.bgPage,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    textAlign: 'center',
                    fontFamily: font.body,
                }}
            >
                <GlobalStyles colors={colors} font={font} />
                <SearchX size={36} style={{ color: colors.textMuted, marginBottom: '0.875rem' }} />
                <h2
                    style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: colors.textOnBg,
                        fontFamily: font.display,
                        margin: 0,
                        marginBottom: 8,
                    }}
                >
                    Roadmap Not Found
                </h2>
                <button
                    onClick={() => navigate('/Dashboard')}
                    style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: colors.primary,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: font.mono,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                    }}
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const displayTitle =
        roadmapData.opportunity?.title || roadmapData.targetSkill?.targetRole || 'Skill Roadmap';
    const displaySubtitle = roadmapData.opportunity?.company?.name || 'Target Learning Goal';
    const progress = roadmapData.progress || 0;
    const progressColor = isReadonly
        ? colors.success
        : progress >= 70
          ? colors.success
          : progress >= 40
            ? colors.warning
            : colors.primary;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} font={font} />

            {/* ── HURRAY OVERLAY ── */}
            {showHurray && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `${colors.success}E8`,
                        backdropFilter: 'blur(8px)',
                        animation: 'fadeUp 0.4s ease',
                    }}
                >
                    <div style={{ textAlign: 'center', color: '#fff', padding: '2rem' }}>
                        <PartyPopper
                            size={56}
                            style={{ margin: '0 auto 1rem', animation: 'bounce 0.8s infinite' }}
                        />
                        <h1
                            style={{
                                fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                                fontWeight: 700,
                                fontFamily: font.display,
                                margin: 0,
                                marginBottom: 8,
                            }}
                        >
                            Congratulations!
                        </h1>
                        <p style={{ fontSize: '1rem', opacity: 0.9 }}>
                            You've mastered this roadmap.
                        </p>
                    </div>
                </div>
            )}

            {/* ── DELETE MODAL ── */}
            {showDeleteModal && (
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
                        onClick={() => !isDeleting && setShowDeleteModal(false)}
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
                            maxWidth: 380,
                            borderRadius: radius.xl,
                            backgroundColor: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            boxShadow: shadow.lg,
                            padding: '2rem',
                            textAlign: 'center',
                            animation: 'fadeUp 0.22s ease',
                        }}
                    >
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: colors.textSub,
                                display: 'flex',
                                alignItems: 'center',
                                padding: 4,
                                borderRadius: radius.sm,
                            }}
                            className="modal-close"
                        >
                            <X size={15} />
                        </button>

                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: radius.md,
                                backgroundColor: colors.dangerBg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.25rem',
                            }}
                        >
                            <AlertTriangle size={20} style={{ color: colors.danger }} />
                        </div>

                        <h3
                            style={{
                                fontSize: '1rem',
                                fontWeight: 700,
                                color: colors.textOnBg,
                                fontFamily: font.display,
                                margin: 0,
                                marginBottom: 8,
                            }}
                        >
                            Delete Roadmap?
                        </h3>
                        <p
                            style={{
                                fontSize: '0.825rem',
                                color: colors.textSub,
                                marginBottom: '1.5rem',
                                lineHeight: 1.6,
                            }}
                        >
                            This permanently removes your progress for{' '}
                            <span style={{ fontWeight: 700, color: colors.textMain }}>
                                "{displayTitle}"
                            </span>
                            .
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="delete-confirm-btn"
                                style={{
                                    width: '100%',
                                    padding: '0.7rem',
                                    backgroundColor: colors.danger,
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: radius.md,
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    opacity: isDeleting ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    fontFamily: font.mono,
                                    transition: transition.fast,
                                }}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2
                                            size={13}
                                            style={{ animation: 'spin 1s linear infinite' }}
                                        />{' '}
                                        Deleting…
                                    </>
                                ) : (
                                    'Yes, Delete Roadmap'
                                )}
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="cancel-btn"
                                style={{
                                    width: '100%',
                                    padding: '0.7rem',
                                    backgroundColor: colors.bgMuted,
                                    color: colors.textMain,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.md,
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    cursor: 'pointer',
                                    fontFamily: font.mono,
                                    transition: transition.fast,
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div
                style={{
                    maxWidth: 860,
                    margin: '0 auto',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem',
                }}
            >
                {/* ── NAV ROW ── */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.5rem',
                    }}
                >
                    <button
                        onClick={() => navigate(backPath)}
                        className="back-btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: colors.textSub,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: font.mono,
                            transition: transition.fast,
                        }}
                    >
                        <ArrowLeft size={13} /> {backLabel}
                    </button>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="delete-btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '0.45rem 0.75rem',
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.md,
                            backgroundColor: colors.bgCard,
                            color: colors.danger,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            cursor: 'pointer',
                            fontFamily: font.mono,
                            transition: transition.fast,
                        }}
                    >
                        <Trash2 size={12} /> Delete
                    </button>
                </div>

                {/* ── HEADER CARD ── */}
                <div
                    style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.lg,
                        backgroundColor: colors.bgCard,
                        padding: 'clamp(1.25rem, 3vw, 1.75rem)',
                        boxShadow: shadow.sm,
                        marginBottom: '1.75rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                    }}
                >
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 5,
                            }}
                        >
                            <h1
                                style={{
                                    fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                                    fontWeight: 700,
                                    color: colors.textOnBg,
                                    fontFamily: font.display,
                                    margin: 0,
                                }}
                            >
                                {displayTitle}
                            </h1>
                            {isReadonly && (
                                <Lock size={14} style={{ color: colors.textSub, opacity: 0.5 }} />
                            )}
                        </div>
                        <p
                            style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.16em',
                                color: colors.secondary,
                                fontFamily: font.mono,
                                margin: 0,
                            }}
                        >
                            {displaySubtitle}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p
                            style={{
                                fontSize: '2rem',
                                fontWeight: 700,
                                color: progressColor,
                                lineHeight: 1,
                                margin: 0,
                            }}
                        >
                            {progress}%
                        </p>
                        <p style={{ ...labelStyle, marginTop: 3 }}>
                            {isReadonly ? 'Mastered' : 'Progress'}
                        </p>
                    </div>
                </div>

                {/* ── PROGRESS BAR ── */}
                <div
                    style={{
                        height: 2,
                        backgroundColor: colors.border,
                        borderRadius: 2,
                        marginBottom: '2rem',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            width: `${progress}%`,
                            backgroundColor: progressColor,
                            borderRadius: 2,
                            transition: 'width 0.6s ease',
                        }}
                    />
                </div>

                {/* ── TIMELINE ── */}
                <div
                    style={{
                        position: 'relative',
                        borderLeft: `2px solid ${colors.border}`,
                        marginLeft: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                    }}
                >
                    {roadmapData.roadmap.map((item, weekIndex) => (
                        <div
                            key={weekIndex}
                            style={{
                                position: 'relative',
                                paddingLeft: 'clamp(1.25rem, 4vw, 2rem)',
                            }}
                        >
                            {/* Timeline dot */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: -8,
                                    top: 16,
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    backgroundColor: isReadonly ? colors.success : colors.primary,
                                    border: `2px solid ${colors.bgPage}`,
                                }}
                            />

                            <div
                                style={{
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.lg,
                                    backgroundColor: colors.bgCard,
                                    overflow: 'hidden',
                                    boxShadow: shadow.sm,
                                }}
                            >
                                {/* Week header */}
                                <div
                                    style={{
                                        padding: '0.625rem 1.25rem',
                                        backgroundColor: isReadonly
                                            ? colors.success
                                            : colors.primary,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: '0.6rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.2em',
                                            color: '#ffffff',
                                            fontFamily: font.mono,
                                        }}
                                    >
                                        Week {item.week}
                                    </span>
                                    <BookOpen
                                        size={12}
                                        style={{ color: 'rgba(255,255,255,0.6)' }}
                                    />
                                </div>

                                <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
                                    <h2
                                        style={{
                                            fontSize: '0.975rem',
                                            fontWeight: 700,
                                            color: colors.textMain,
                                            margin: 0,
                                            marginBottom: '1.25rem',
                                        }}
                                    >
                                        {item.topic}
                                    </h2>

                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns:
                                                'repeat(auto-fit, minmax(240px, 1fr))',
                                            gap: '1.25rem',
                                        }}
                                    >
                                        {/* Resources */}
                                        <div>
                                            <p
                                                style={{
                                                    ...labelStyle,
                                                    color: colors.primary,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 5,
                                                    marginBottom: '0.625rem',
                                                }}
                                            >
                                                <Youtube size={11} /> Learning Material
                                            </p>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.3rem',
                                                }}
                                            >
                                                {item.resources.map((res, rIndex) => (
                                                    <a
                                                        key={rIndex}
                                                        href={res.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="resource-link"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            gap: '0.5rem',
                                                            padding: '0.55rem 0.75rem',
                                                            borderRadius: radius.md,
                                                            border: `1px solid ${colors.border}`,
                                                            backgroundColor: colors.bgMuted,
                                                            textDecoration: 'none',
                                                            transition: transition.fast,
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize: '0.8rem',
                                                                fontWeight: 500,
                                                                color: colors.textMain,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {res.title}
                                                        </span>
                                                        <ExternalLink
                                                            size={11}
                                                            style={{
                                                                color: colors.textSub,
                                                                flexShrink: 0,
                                                            }}
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Tasks */}
                                        <div>
                                            <p
                                                style={{
                                                    ...labelStyle,
                                                    color: colors.success,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 5,
                                                    marginBottom: '0.625rem',
                                                }}
                                            >
                                                <ClipboardList size={11} /> Action Plan
                                            </p>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.3rem',
                                                }}
                                            >
                                                {item.tasks.map((task) => (
                                                    <div
                                                        key={task._id}
                                                        onClick={() =>
                                                            toggleTask(weekIndex, task._id)
                                                        }
                                                        className={isReadonly ? '' : 'task-row'}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: '0.625rem',
                                                            padding: '0.55rem 0.75rem',
                                                            borderRadius: radius.md,
                                                            border: `1px solid ${task.isCompleted ? colors.success + '30' : colors.border}`,
                                                            backgroundColor: task.isCompleted
                                                                ? colors.successBg
                                                                : colors.bgMuted,
                                                            cursor: isReadonly
                                                                ? 'default'
                                                                : 'pointer',
                                                            transition: transition.fast,
                                                        }}
                                                    >
                                                        {task.isCompleted ? (
                                                            <CheckCircle
                                                                size={14}
                                                                style={{
                                                                    color: colors.success,
                                                                    flexShrink: 0,
                                                                    marginTop: 2,
                                                                }}
                                                            />
                                                        ) : (
                                                            <Circle
                                                                size={14}
                                                                style={{
                                                                    color: colors.border,
                                                                    flexShrink: 0,
                                                                    marginTop: 2,
                                                                }}
                                                            />
                                                        )}
                                                        <span
                                                            style={{
                                                                fontSize: '0.8rem',
                                                                color: task.isCompleted
                                                                    ? colors.textSub
                                                                    : colors.textMain,
                                                                textDecoration: task.isCompleted
                                                                    ? 'line-through'
                                                                    : 'none',
                                                                lineHeight: 1.55,
                                                            }}
                                                        >
                                                            {task.description}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors, font }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .back-btn:hover         { color: ${colors.textMain} !important; }
        .delete-btn:hover       { background-color: ${colors.dangerBg} !important; }
        .modal-close:hover      { color: ${colors.textMain} !important; }
        .delete-confirm-btn:hover:not(:disabled) { opacity: 0.88 !important; }
        .cancel-btn:hover       { background-color: ${colors.bgHover} !important; }
        .resource-link:hover    { border-color: ${colors.primary} !important; background-color: ${colors.bgHover} !important; }
        .task-row:hover         { border-color: ${colors.success}50 !important; }
    `}</style>
);

export default Roadmap;
