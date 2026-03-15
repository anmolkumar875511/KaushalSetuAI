import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';
import { ArrowRight, ArrowLeft, CheckCircle2, Clock, Trophy, Loader2 } from 'lucide-react';

const AssessmentPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const { colors } = getThemeColors(user?.theme || 'light');
    const isDark = user?.theme === 'dark';

    const cardBg = isDark ? '#0a0a0a' : '#ffffff';
    const pageBg = isDark ? '#050505' : colors.bgLight;
    const mutedBg = isDark ? '#111111' : '#f7f7f7';
    const border = isDark ? '#1f1f1f' : '#e8e8e8';
    const textMain = isDark ? '#f0f0f0' : '#111111';
    const textSub = isDark ? '#555555' : '#aaaaaa';

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
                setStarted(false);
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
    const LevelPip = ({ level }) => {
        const map = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
        return (
            <span
                style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: map[level] || map.easy,
                    flexShrink: 0,
                }}
            />
        );
    };

    const Divider = () => <div style={{ height: 1, backgroundColor: border }} />;

    /* ════════════════════════════════
       GENERATE SCREEN
    ════════════════════════════════ */
    if (!assessment && !assessmentId && !id) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: pageBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                }}
            >
                <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap'); @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                <div
                    style={{
                        width: '100%',
                        maxWidth: 420,
                        fontFamily: '"DM Sans", system-ui, sans-serif',
                    }}
                >
                    <p
                        style={{
                            fontSize: 11,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: textSub,
                            marginBottom: '1.5rem',
                            fontFamily: 'monospace',
                        }}
                    >
                        New Assessment
                    </p>
                    <h1
                        style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: textMain,
                            lineHeight: 1.2,
                            marginBottom: '2.5rem',
                            fontFamily: '"Playfair Display", Georgia, serif',
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
                        onKeyDown={(e) => e.key === 'Enter' && topic && generateAssessment()}
                        style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            border: `1px solid ${border}`,
                            borderRadius: 10,
                            backgroundColor: cardBg,
                            color: textMain,
                            fontSize: '0.9rem',
                            outline: 'none',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                            marginBottom: '0.875rem',
                        }}
                    />
                    <button
                        disabled={!topic || generating}
                        onClick={generateAssessment}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            backgroundColor: topic && !generating ? textMain : border,
                            color: isDark ? '#050505' : '#ffffff',
                            border: 'none',
                            borderRadius: 10,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: topic && !generating ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            letterSpacing: '0.02em',
                        }}
                    >
                        {generating && (
                            <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                        )}
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
                    backgroundColor: pageBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                }}
            >
                <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');`}</style>
                <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: mutedBg,
                            border: `1px solid ${border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                        }}
                    >
                        <span style={{ fontSize: 18 }}>✦</span>
                    </div>
                    <h2
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: textMain,
                            marginBottom: '0.5rem',
                            fontFamily: '"Playfair Display", Georgia, serif',
                        }}
                    >
                        Ready when you are
                    </h2>
                    <p style={{ color: textSub, fontSize: '0.875rem', marginBottom: '2rem' }}>
                        10 questions · Mixed difficulty
                    </p>
                    <button
                        onClick={startAssessment}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            backgroundColor: textMain,
                            color: isDark ? '#050505' : '#ffffff',
                            border: 'none',
                            borderRadius: 10,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            letterSpacing: '0.02em',
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
                    backgroundColor: pageBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                <Loader2
                    size={20}
                    style={{ color: textSub, animation: 'spin 1s linear infinite' }}
                />
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
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: pageBg,
                fontFamily: '"DM Sans", system-ui, sans-serif',
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
                @keyframes spin    { from { transform: rotate(0deg); }    to { transform: rotate(360deg); } }
                @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .opt-row { transition: background-color 0.12s, border-left-color 0.12s; }
                .opt-row:hover { background-color: ${isDark ? '#161616' : '#f9f9f9'} !important; }
                .ghost-btn:hover:not(:disabled) { background-color: ${mutedBg} !important; }
            `}</style>

            <div style={{ maxWidth: 660, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
                {/* ── TOP META ── */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '3rem',
                        gap: '1rem',
                    }}
                >
                    <div>
                        <p
                            style={{
                                fontSize: 10,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                color: textSub,
                                fontFamily: 'monospace',
                                marginBottom: 5,
                            }}
                        >
                            Assessment
                        </p>
                        <h1
                            style={{
                                fontSize: '1.4rem',
                                fontWeight: 700,
                                color: textMain,
                                fontFamily: '"Playfair Display", Georgia, serif',
                                textTransform: 'capitalize',
                                margin: 0,
                            }}
                        >
                            {assessment.topic}
                        </h1>
                    </div>
                    {started && !result && (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p
                                style={{
                                    fontSize: 10,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    color: textSub,
                                    fontFamily: 'monospace',
                                    marginBottom: 5,
                                }}
                            >
                                Answered
                            </p>
                            <p
                                style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    color: textMain,
                                    margin: 0,
                                }}
                            >
                                {answeredCount}
                                <span style={{ color: textSub, fontWeight: 400 }}>/{totalQ}</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* ── SUBMITTING STATE ── */}
                {submitting && (
                    <div
                        style={{
                            border: `1px solid ${border}`,
                            borderRadius: 12,
                            padding: '1.25rem 1.5rem',
                            backgroundColor: cardBg,
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        <Loader2
                            size={14}
                            style={{
                                color: textSub,
                                animation: 'spin 1s linear infinite',
                                flexShrink: 0,
                            }}
                        />
                        <span style={{ color: textSub, fontSize: '0.8rem' }}>
                            Submitting your answers…
                        </span>
                    </div>
                )}

                {/* ── RESULT CARD ── */}
                {result && (
                    <div
                        style={{
                            border: `1px solid ${border}`,
                            borderRadius: 14,
                            backgroundColor: cardBg,
                            marginBottom: '2.5rem',
                            overflow: 'hidden',
                            animation: 'fadeUp 0.4s ease',
                        }}
                    >
                        <div
                            style={{
                                padding: '1.5rem 1.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: '50%',
                                        backgroundColor: mutedBg,
                                        border: `1px solid ${border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <Trophy size={15} style={{ color: textMain }} />
                                </div>
                                <div>
                                    <p
                                        style={{
                                            fontSize: '0.7rem',
                                            color: textSub,
                                            marginBottom: 2,
                                            letterSpacing: '0.05em',
                                        }}
                                    >
                                        Final Score
                                    </p>
                                    <p
                                        style={{
                                            fontSize: '1.6rem',
                                            fontWeight: 700,
                                            color: textMain,
                                            lineHeight: 1,
                                            margin: 0,
                                        }}
                                    >
                                        {result.score}
                                        <span
                                            style={{
                                                fontSize: '1rem',
                                                fontWeight: 400,
                                                color: textSub,
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
                                        color: textSub,
                                        fontSize: '0.75rem',
                                    }}
                                >
                                    <Clock size={12} />
                                    {result.duration}s
                                </div>
                            )}
                        </div>
                        {/* Thin score bar */}
                        <div style={{ height: 3, backgroundColor: border }}>
                            <div
                                style={{
                                    height: '100%',
                                    width: `${result.score}%`,
                                    backgroundColor:
                                        result.score >= 70
                                            ? '#22c55e'
                                            : result.score >= 40
                                              ? '#f59e0b'
                                              : '#ef4444',
                                    transition: 'width 1s ease',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* ── REVIEW ── */}
                {result && assessment?.completed && (
                    <div style={{ marginBottom: '2rem' }}>
                        <p
                            style={{
                                fontSize: 10,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                color: textSub,
                                fontFamily: 'monospace',
                                marginBottom: '1.25rem',
                            }}
                        >
                            Review · {totalQ} questions
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                            {assessment.questions.map((q, index) => {
                                const isCorrect = q.userAnswer === q.correctAnswer;
                                const skipped = !q.userAnswer;

                                return (
                                    <div
                                        key={q._id}
                                        style={{
                                            border: `1px solid ${skipped ? border : isCorrect ? '#22c55e28' : '#ef444428'}`,
                                            borderRadius: 12,
                                            backgroundColor: skipped
                                                ? cardBg
                                                : isCorrect
                                                  ? isDark
                                                      ? '#0d1f1280'
                                                      : '#f0fdf4'
                                                  : isDark
                                                    ? '#1f0d0d80'
                                                    : '#fff5f5',
                                            overflow: 'hidden',
                                            animation: `fadeUp 0.3s ease ${index * 0.035}s both`,
                                        }}
                                    >
                                        {/* Q header */}
                                        <div
                                            style={{
                                                padding: '0.875rem 1.25rem',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.75rem',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '0.65rem',
                                                    fontFamily: 'monospace',
                                                    color: textSub,
                                                    marginTop: 2,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <p
                                                style={{
                                                    fontSize: '0.875rem',
                                                    color: textMain,
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
                                                    gap: 8,
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
                                                            ? textSub
                                                            : isCorrect
                                                              ? '#16a34a'
                                                              : '#dc2626',
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
                                                padding: '0.625rem 1.25rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.3rem',
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
                                                            gap: '0.625rem',
                                                            padding: '0.45rem 0.625rem',
                                                            borderRadius: 7,
                                                            backgroundColor: isCorrectOpt
                                                                ? isDark
                                                                    ? '#14532d22'
                                                                    : '#dcfce7'
                                                                : isUserWrong
                                                                  ? isDark
                                                                      ? '#7f1d1d22'
                                                                      : '#fee2e2'
                                                                  : 'transparent',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize: '0.65rem',
                                                                fontFamily: 'monospace',
                                                                color: isCorrectOpt
                                                                    ? '#16a34a'
                                                                    : isUserWrong
                                                                      ? '#dc2626'
                                                                      : textSub,
                                                                width: 14,
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {String.fromCharCode(65 + i)}
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontSize: '0.8rem',
                                                                color: isCorrectOpt
                                                                    ? '#15803d'
                                                                    : isUserWrong
                                                                      ? '#b91c1c'
                                                                      : textSub,
                                                                flex: 1,
                                                            }}
                                                        >
                                                            {opt}
                                                        </span>
                                                        {isCorrectOpt && (
                                                            <CheckCircle2
                                                                size={12}
                                                                style={{
                                                                    color: '#16a34a',
                                                                    flexShrink: 0,
                                                                }}
                                                            />
                                                        )}
                                                        {isUserWrong && (
                                                            <span
                                                                style={{
                                                                    fontSize: '0.6rem',
                                                                    color: '#dc2626',
                                                                    flexShrink: 0,
                                                                    letterSpacing: '0.04em',
                                                                    fontWeight: 600,
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
                            backgroundColor: border,
                            borderRadius: 2,
                            marginBottom: '1.75rem',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                height: '100%',
                                width: `${progressPct}%`,
                                backgroundColor: textMain,
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
                            gap: 5,
                            marginBottom: '1.75rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        {assessment.questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentQuestion(i)}
                                style={{
                                    width: 27,
                                    height: 27,
                                    borderRadius: 6,
                                    border: `1px solid ${i === currentQuestion ? textMain : border}`,
                                    backgroundColor:
                                        i === currentQuestion
                                            ? textMain
                                            : answers[i]
                                              ? mutedBg
                                              : cardBg,
                                    color:
                                        i === currentQuestion
                                            ? isDark
                                                ? '#050505'
                                                : '#fff'
                                            : answers[i]
                                              ? textMain
                                              : textSub,
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    fontFamily: 'monospace',
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── QUESTION CARD ── */}
                {started && !result && question && (
                    <div style={{ animation: 'fadeUp 0.25s ease' }}>
                        <div
                            style={{
                                border: `1px solid ${border}`,
                                borderRadius: 14,
                                backgroundColor: cardBg,
                                overflow: 'hidden',
                                marginBottom: '1rem',
                            }}
                        >
                            {/* Q text */}
                            <div
                                style={{
                                    padding: '1.5rem 1.75rem',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '1rem',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '0.65rem',
                                        fontFamily: 'monospace',
                                        color: textSub,
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
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: textMain,
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
                                            padding: '1rem 1.75rem',
                                            backgroundColor: isDark ? '#0d0d0d' : '#1e1e1e',
                                            color: '#d4d4d4',
                                            fontSize: '0.78rem',
                                            overflowX: 'auto',
                                            lineHeight: 1.65,
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
                                                    gap: '1rem',
                                                    padding: '0.875rem 1.75rem',
                                                    cursor: 'pointer',
                                                    backgroundColor: selected
                                                        ? isDark
                                                            ? '#161616'
                                                            : '#f5f5f5'
                                                        : 'transparent',
                                                    borderLeft: `3px solid ${selected ? textMain : 'transparent'}`,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: '0.65rem',
                                                        fontFamily: 'monospace',
                                                        color: selected ? textMain : textSub,
                                                        width: 14,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '0.875rem',
                                                        color: selected ? textMain : textSub,
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
                                                            backgroundColor: textMain,
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
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '0.6rem 1rem',
                                    border: `1px solid ${border}`,
                                    borderRadius: 8,
                                    backgroundColor: cardBg,
                                    color: currentQuestion === 0 ? textSub : textMain,
                                    fontSize: '0.8rem',
                                    cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                                    opacity: currentQuestion === 0 ? 0.4 : 1,
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
                                        padding: '0.6rem 1.4rem',
                                        border: 'none',
                                        borderRadius: 8,
                                        backgroundColor: '#16a34a',
                                        color: '#fff',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        opacity: submitting ? 0.6 : 1,
                                        letterSpacing: '0.02em',
                                    }}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2
                                                size={13}
                                                style={{ animation: 'spin 1s linear infinite' }}
                                            />{' '}
                                            Submitting…
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
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '0.6rem 1rem',
                                        border: `1px solid ${border}`,
                                        borderRadius: 8,
                                        backgroundColor: cardBg,
                                        color: textMain,
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                    }}
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

export default AssessmentPage;
