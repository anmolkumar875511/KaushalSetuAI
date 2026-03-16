import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';
import {
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Trophy,
    Loader2,
    LayoutDashboard,
    RotateCcw,
} from 'lucide-react';

const AssessmentPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const { isDark, colors, font, radius, shadow, transition } = getThemeColors(
        user?.theme || 'light'
    );
    const navigate = useNavigate();

    const [topic, setTopic] = useState('');
    const [assessmentId, setAssessmentId] = useState(null);
    const [assessment, setAssessment] = useState(null);
    const [started, setStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [generating, setGenerating] = useState(false);

    /* ── FETCH ── */
    const fetchAssessment = async (aid) => {
        try {
            const res = await axiosInstance.get(`/assessment/${aid}`);
            const data = res.data.data;
            if (!data) return;
            setAssessment(data);
            setAnswers(data.questions.map((q) => q.userAnswer || null));
            if (data.completed) {
                setResult({
                    score: data.score,
                    maxScore: 100,
                    duration: data.duration ? Math.round(data.duration) : null,
                });
            } else if (data.timeStarted) {
                setStarted(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (id) fetchAssessment(id);
    }, [id]);

    /* ── GENERATE ── */
    const generateAssessment = async () => {
        try {
            setGenerating(true);
            const res = await axiosInstance.post('/assessment/generate', { topic });
            setAssessmentId(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    /* ── START ── */
    const startAssessment = async () => {
        try {
            const res = await axiosInstance.patch(`/assessment/start/${assessmentId}`);
            const data = res.data.data.assessment;
            setAssessment(data);
            setStarted(true);
            setAnswers(data.questions.map((q) => q.userAnswer || null));
        } catch (err) {
            console.error(err);
        }
    };

    /* ── SUBMIT ── */
    const submitAssessment = async () => {
        try {
            setSubmitting(true);
            const res = await axiosInstance.post('/assessment/submit', {
                assessmentId: assessment._id,
                answers,
            });
            setResult(res.data.data);
            setStarted(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    /* ── HELPERS ── */
    const selectOption = (opt) => {
        const u = [...answers];
        u[currentQuestion] = opt;
        setAnswers(u);
    };
    const nextQuestion = () => {
        if (currentQuestion < assessment.questions.length - 1) setCurrentQuestion((c) => c + 1);
    };
    const prevQuestion = () => {
        if (currentQuestion > 0) setCurrentQuestion((c) => c - 1);
    };
    const answeredCount = answers.filter(Boolean).length;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentQuestion]);

    /* ── ATOMS ── */
    const LevelPip = ({ level }) => (
        <span
            style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                flexShrink: 0,
                backgroundColor:
                    level === 'easy'
                        ? colors.levelEasy
                        : level === 'medium'
                          ? colors.levelMedium
                          : colors.levelHard,
            }}
        />
    );

    const Divider = () => <div style={{ height: 1, backgroundColor: colors.border }} />;

    const Spinner = ({ size = 15 }) => (
        <Loader2
            size={size}
            style={{ animation: 'spin 1s linear infinite', flexShrink: 0, color: colors.textSub }}
        />
    );

    /* ── REUSED STYLES ── */
    const labelStyle = {
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        margin: 0,
    };

    const ghostBtn = {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0.55rem 0.9rem',
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        backgroundColor: colors.bgCard,
        color: colors.textMain,
        fontSize: '0.8rem',
        cursor: 'pointer',
        transition: transition.fast,
        fontFamily: font.body,
    };

    /* ════════════════════════════════
       GENERATE SCREEN
    ════════════════════════════════ */
    if (!assessment && !assessmentId && !id) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: colors.bgPage,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    fontFamily: font.body,
                }}
            >
                <GlobalStyles colors={colors} font={font} />
                <div style={{ width: '100%', maxWidth: 400 }}>
                    <p style={{ ...labelStyle, marginBottom: '1.25rem' }}>New Assessment</p>
                    <h1
                        style={{
                            fontSize: 'clamp(1.6rem, 4vw, 2.1rem)',
                            fontWeight: 700,
                            color: colors.textOnBg,
                            lineHeight: 1.2,
                            marginBottom: '2rem',
                            fontFamily: font.display,
                        }}
                    >
                        What will you
                        <br />
                        be tested on?
                    </h1>
                    <input
                        type="text"
                        placeholder="e.g. Node.js, DSA, React…"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === 'Enter' && topic && !generating && generateAssessment()
                        }
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.md,
                            backgroundColor: colors.bgMuted,
                            color: colors.textMain,
                            fontSize: '0.875rem',
                            outline: 'none',
                            fontFamily: font.body,
                            boxSizing: 'border-box',
                            marginBottom: '0.75rem',
                            transition: transition.fast,
                        }}
                    />
                    <button
                        disabled={!topic || generating}
                        onClick={generateAssessment}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: topic && !generating ? colors.primary : colors.border,
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: radius.md,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: topic && !generating ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            letterSpacing: '0.02em',
                            fontFamily: font.body,
                            transition: transition.normal,
                        }}
                    >
                        {generating && <Spinner />}
                        {generating ? 'Generating…' : 'Generate Assessment'}
                    </button>
                </div>
            </div>
        );
    }

    /* ════════════════════════════════
       START SCREEN
    ════════════════════════════════ */
    if (!assessment && assessmentId) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: colors.bgPage,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    fontFamily: font.body,
                }}
            >
                <GlobalStyles colors={colors} font={font} />
                <div style={{ width: '100%', maxWidth: 340, textAlign: 'center' }}>
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            backgroundColor: colors.bgMuted,
                            border: `1px solid ${colors.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                        }}
                    >
                        <span style={{ fontSize: 18, color: colors.textMain }}>✦</span>
                    </div>
                    <h2
                        style={{
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            color: colors.textOnBg,
                            marginBottom: '0.375rem',
                            fontFamily: font.display,
                        }}
                    >
                        Ready when you are
                    </h2>
                    <p
                        style={{
                            color: colors.textSub,
                            fontSize: '0.8rem',
                            marginBottom: '1.75rem',
                        }}
                    >
                        10 questions · Mixed difficulty
                    </p>
                    <button
                        onClick={startAssessment}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: colors.primary,
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: radius.md,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            letterSpacing: '0.02em',
                            fontFamily: font.body,
                        }}
                    >
                        Begin
                    </button>
                </div>
            </div>
        );
    }

    /* ── LOADING ── */
    if (!assessment) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: colors.bgPage,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <GlobalStyles colors={colors} font={font} />
                <Spinner size={18} />
            </div>
        );
    }

    const question = assessment.questions?.[currentQuestion];
    const totalQ = assessment.questions.length;
    const progressPct = ((currentQuestion + 1) / totalQ) * 100;

    /* ════════════════════════════════
       MAIN PAGE
    ════════════════════════════════ */
    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} font={font} />

            <div
                style={{
                    maxWidth: 660,
                    margin: '0 auto',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem clamp(3rem, 8vw, 5rem)',
                }}
            >
                {/* ── TOP META ── */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '2rem',
                        gap: '1rem',
                    }}
                >
                    <div>
                        <p style={{ ...labelStyle, marginBottom: 4 }}>Assessment</p>
                        <h1
                            style={{
                                fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                                fontWeight: 700,
                                color: colors.textOnBg,
                                fontFamily: font.display,
                                textTransform: 'capitalize',
                                margin: 0,
                            }}
                        >
                            {assessment.topic}
                        </h1>
                    </div>
                    {started && !result && (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ ...labelStyle, marginBottom: 4 }}>Answered</p>
                            <p
                                style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    color: colors.textMain,
                                    margin: 0,
                                }}
                            >
                                {answeredCount}
                                <span style={{ color: colors.textSub, fontWeight: 400 }}>
                                    /{totalQ}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                {/* ── SUBMITTING ── */}
                {submitting && (
                    <div
                        style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.lg,
                            padding: '1rem 1.25rem',
                            backgroundColor: colors.bgCard,
                            marginBottom: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        <Spinner size={14} />
                        <span style={{ color: colors.textSub, fontSize: '0.8rem' }}>
                            Submitting your answers…
                        </span>
                    </div>
                )}

                {/* ── RESULT CARD ── */}
                {result && (
                    <div
                        style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.lg,
                            backgroundColor: colors.bgCard,
                            marginBottom: '2rem',
                            overflow: 'hidden',
                            animation: 'fadeUp 0.4s ease',
                            boxShadow: shadow.sm,
                        }}
                    >
                        <div
                            style={{
                                padding: '1.25rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        backgroundColor: colors.bgMuted,
                                        border: `1px solid ${colors.border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <Trophy size={14} style={{ color: colors.textMain }} />
                                </div>
                                <div>
                                    <p style={{ ...labelStyle, marginBottom: 3 }}>Final Score</p>
                                    <p
                                        style={{
                                            fontSize: '1.5rem',
                                            fontWeight: 700,
                                            color: colors.textMain,
                                            lineHeight: 1,
                                            margin: 0,
                                        }}
                                    >
                                        {result.score}
                                        <span
                                            style={{
                                                fontSize: '0.95rem',
                                                fontWeight: 400,
                                                color: colors.textSub,
                                            }}
                                        >
                                            /{result.maxScore}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            {result.duration && (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        color: colors.textSub,
                                        fontSize: '0.75rem',
                                    }}
                                >
                                    <Clock size={12} />
                                    {result.duration}s
                                </div>
                            )}
                        </div>
                        <div style={{ height: 3, backgroundColor: colors.border }}>
                            <div
                                style={{
                                    height: '100%',
                                    width: `${result.score}%`,
                                    backgroundColor:
                                        result.score >= 70
                                            ? colors.success
                                            : result.score >= 40
                                              ? colors.warning
                                              : colors.danger,
                                    transition: 'width 1s ease',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* ── RESULT ACTIONS ── */}
                {result && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.625rem',
                            marginBottom: '1.75rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '0.55rem 1rem',
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.md,
                                backgroundColor: colors.bgCard,
                                color: colors.textMain,
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                cursor: 'pointer',
                                transition: transition.fast,
                                fontFamily: font.mono,
                            }}
                            className="ghost-btn"
                        >
                            <LayoutDashboard size={12} /> Dashboard
                        </button>

                        <button
                            onClick={() => {
                                setAssessment(null);
                                setAssessmentId(null);
                                setResult(null);
                                setStarted(false);
                                setCurrentQuestion(0);
                                setAnswers([]);
                                setTopic('');
                                window.history.replaceState({}, '', '/assessment');
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '0.55rem 1rem',
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.md,
                                backgroundColor: colors.bgCard,
                                color: colors.textMain,
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                cursor: 'pointer',
                                transition: transition.fast,
                                fontFamily: font.mono,
                            }}
                            className="ghost-btn"
                        >
                            <RotateCcw size={12} /> New Assessment
                        </button>
                    </div>
                )}

                {/* ── REVIEW ── */}
                {result && assessment?.completed && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ ...labelStyle, marginBottom: '1rem' }}>
                            Review · {totalQ} questions
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {assessment.questions.map((q, index) => {
                                const isCorrect = q.userAnswer === q.correctAnswer;
                                const skipped = !q.userAnswer;
                                return (
                                    <div
                                        key={q._id}
                                        style={{
                                            border: `1px solid ${skipped ? colors.border : isCorrect ? colors.success + '28' : colors.danger + '28'}`,
                                            borderRadius: radius.lg,
                                            backgroundColor: skipped
                                                ? colors.bgCard
                                                : isCorrect
                                                  ? colors.successBg
                                                  : colors.dangerBg,
                                            overflow: 'hidden',
                                            animation: `fadeUp 0.3s ease ${index * 0.03}s both`,
                                        }}
                                    >
                                        {/* Q row */}
                                        <div
                                            style={{
                                                padding: '0.875rem 1.125rem',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.625rem',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '0.6rem',
                                                    fontFamily: font.mono,
                                                    color: colors.textSub,
                                                    marginTop: 2,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <p
                                                style={{
                                                    fontSize: '0.85rem',
                                                    color: colors.textMain,
                                                    lineHeight: 1.55,
                                                    flex: 1,
                                                    fontWeight: 500,
                                                    margin: 0,
                                                }}
                                            >
                                                {q.question}
                                            </p>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 7,
                                                    flexShrink: 0,
                                                    marginTop: 2,
                                                }}
                                            >
                                                <LevelPip level={q.level} />
                                                <span
                                                    style={{
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700,
                                                        color: skipped
                                                            ? colors.textSub
                                                            : isCorrect
                                                              ? colors.success
                                                              : colors.danger,
                                                    }}
                                                >
                                                    {skipped ? '—' : isCorrect ? '✓' : '✗'}
                                                </span>
                                            </div>
                                        </div>

                                        <Divider />

                                        {/* Options */}
                                        <div
                                            style={{
                                                padding: '0.5rem 1.125rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.25rem',
                                            }}
                                        >
                                            {q.options.map((opt, i) => {
                                                const isCorrectOpt = opt === q.correctAnswer;
                                                const isUserWrong =
                                                    opt === q.userAnswer && !isCorrectOpt;
                                                return (
                                                    <div
                                                        key={i}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            padding: '0.4rem 0.5rem',
                                                            borderRadius: radius.sm,
                                                            backgroundColor: isCorrectOpt
                                                                ? colors.successBg
                                                                : isUserWrong
                                                                  ? colors.dangerBg
                                                                  : 'transparent',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize: '0.6rem',
                                                                fontFamily: font.mono,
                                                                color: isCorrectOpt
                                                                    ? colors.success
                                                                    : isUserWrong
                                                                      ? colors.danger
                                                                      : colors.textSub,
                                                                width: 13,
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {String.fromCharCode(65 + i)}
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontSize: '0.8rem',
                                                                color: isCorrectOpt
                                                                    ? colors.successText
                                                                    : isUserWrong
                                                                      ? colors.dangerText
                                                                      : colors.textSub,
                                                                flex: 1,
                                                            }}
                                                        >
                                                            {opt}
                                                        </span>
                                                        {isCorrectOpt && (
                                                            <CheckCircle2
                                                                size={11}
                                                                style={{
                                                                    color: colors.success,
                                                                    flexShrink: 0,
                                                                }}
                                                            />
                                                        )}
                                                        {isUserWrong && (
                                                            <span
                                                                style={{
                                                                    fontSize: '0.6rem',
                                                                    color: colors.danger,
                                                                    flexShrink: 0,
                                                                    fontWeight: 600,
                                                                    fontFamily: font.mono,
                                                                }}
                                                            >
                                                                yours
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── PROGRESS BAR ── */}
                {started && !result && (
                    <div
                        style={{
                            height: 2,
                            backgroundColor: colors.border,
                            borderRadius: 2,
                            marginBottom: '1.25rem',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                height: '100%',
                                width: `${progressPct}%`,
                                backgroundColor: colors.primary,
                                borderRadius: 2,
                                transition: 'width 0.3s ease',
                            }}
                        />
                    </div>
                )}

                {/* ── QUESTION DOTS ── */}
                {started && !result && (
                    <div
                        style={{
                            display: 'flex',
                            gap: 4,
                            marginBottom: '1.25rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        {assessment.questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentQuestion(i)}
                                style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: radius.sm,
                                    border: `1px solid ${i === currentQuestion ? colors.primary : colors.border}`,
                                    backgroundColor:
                                        i === currentQuestion
                                            ? colors.primary
                                            : answers[i]
                                              ? colors.bgMuted
                                              : colors.bgCard,
                                    color:
                                        i === currentQuestion
                                            ? '#ffffff'
                                            : answers[i]
                                              ? colors.textMain
                                              : colors.textSub,
                                    fontSize: '0.6rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: transition.fast,
                                    fontFamily: font.mono,
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── QUESTION CARD ── */}
                {started && !result && question && (
                    <div style={{ animation: 'fadeUp 0.22s ease' }}>
                        <div
                            style={{
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.lg,
                                backgroundColor: colors.bgCard,
                                overflow: 'hidden',
                                marginBottom: '0.875rem',
                                boxShadow: shadow.sm,
                            }}
                        >
                            {/* Q text */}
                            <div
                                style={{
                                    padding: '1.25rem 1.5rem',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.875rem',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '0.6rem',
                                        fontFamily: font.mono,
                                        color: colors.textSub,
                                        marginTop: 3,
                                        flexShrink: 0,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {String(currentQuestion + 1).padStart(2, '0')}/
                                    {String(totalQ).padStart(2, '0')}
                                </span>
                                <p
                                    style={{
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        color: colors.textMain,
                                        lineHeight: 1.6,
                                        flex: 1,
                                        margin: 0,
                                    }}
                                >
                                    {question.question}
                                </p>
                                <LevelPip level={question.level} />
                            </div>

                            {question.code && (
                                <>
                                    <Divider />
                                    <pre
                                        style={{
                                            margin: 0,
                                            padding: '0.875rem 1.5rem',
                                            backgroundColor: isDark ? colors.bgPage : '#1e1e1e',
                                            color: '#d4d4d4',
                                            fontSize: '0.78rem',
                                            overflowX: 'auto',
                                            lineHeight: 1.65,
                                            fontFamily: font.mono,
                                        }}
                                    >
                                        <code>{question.code}</code>
                                    </pre>
                                </>
                            )}

                            <Divider />

                            {/* Options */}
                            <div>
                                {question.options?.map((opt, i) => {
                                    const selected = answers[currentQuestion] === opt;
                                    return (
                                        <React.Fragment key={i}>
                                            <div
                                                className="opt-row"
                                                onClick={() => selectOption(opt)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.875rem',
                                                    padding: '0.8rem 1.5rem',
                                                    cursor: 'pointer',
                                                    backgroundColor: selected
                                                        ? colors.bgHover
                                                        : 'transparent',
                                                    borderLeft: `3px solid ${selected ? colors.primary : 'transparent'}`,
                                                    transition: transition.fast,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: '0.6rem',
                                                        fontFamily: font.mono,
                                                        color: selected
                                                            ? colors.primary
                                                            : colors.textSub,
                                                        width: 13,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '0.875rem',
                                                        color: selected
                                                            ? colors.textMain
                                                            : colors.textSub,
                                                        flex: 1,
                                                    }}
                                                >
                                                    {opt}
                                                </span>
                                                {selected && (
                                                    <div
                                                        style={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: '50%',
                                                            backgroundColor: colors.primary,
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            {i < question.options.length - 1 && <Divider />}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── NAV ── */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <button
                                className="ghost-btn"
                                onClick={prevQuestion}
                                disabled={currentQuestion === 0}
                                style={{
                                    ...ghostBtn,
                                    opacity: currentQuestion === 0 ? 0.35 : 1,
                                    cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                                }}
                            >
                                <ArrowLeft size={13} /> Prev
                            </button>

                            {currentQuestion === totalQ - 1 ? (
                                <button
                                    onClick={submitAssessment}
                                    disabled={submitting}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '0.55rem 1.25rem',
                                        border: 'none',
                                        borderRadius: radius.md,
                                        backgroundColor: colors.success,
                                        color: '#ffffff',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        opacity: submitting ? 0.6 : 1,
                                        letterSpacing: '0.02em',
                                        fontFamily: font.body,
                                    }}
                                >
                                    {submitting ? (
                                        <>
                                            <Spinner size={13} /> Submitting…
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={13} /> Submit
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    className="ghost-btn"
                                    onClick={nextQuestion}
                                    style={ghostBtn}
                                >
                                    Next <ArrowRight size={13} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
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
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: ${colors.textMuted}; }
        input:focus { border-color: ${colors.borderFocus} !important; box-shadow: 0 0 0 3px ${colors.primary}18 !important; }
        .opt-row:hover { background-color: ${colors.bgHover} !important; }
        .ghost-btn:hover:not(:disabled) { background-color: ${colors.bgMuted} !important; }
        @media (max-width: 480px) { input, button { font-size: 16px !important; } }
    `}</style>
);

export default AssessmentPage;
