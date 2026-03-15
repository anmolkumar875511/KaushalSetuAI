import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';
import { ArrowRight, ArrowLeft, PlayCircle, CheckCircle2, Clock, Trophy } from 'lucide-react';

const AssessmentPage = () => {
    const { id } = useParams();

    const { user } = useContext(AuthContext);
    const { colors } = getThemeColors(user?.theme || 'light');

    const cardBg = user?.theme === 'dark' ? '#000000' : '#ffffff';

    const [topic, setTopic] = useState('');
    const [assessmentId, setAssessmentId] = useState(null);
    const [assessment, setAssessment] = useState(null);

    const [started, setStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);

    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    /* ---------------- FETCH ASSESSMENT ---------------- */

    const fetchAssessment = async (aid) => {
        try {
            const res = await axiosInstance.get(`/assessment/${aid}`);
            const data = res.data.data;

            if (!data) return;

            setAssessment(data);
            setAnswers(data.questions.map((q) => q.userAnswer || null));

            if (data.completed) {
                // Show review mode — populate result from the assessment itself
                setResult({
                    score: data.score,
                    maxScore: 100,
                    duration: data.duration ? Math.round(data.duration) : null,
                });
                setStarted(false);
            } else if (data.timeStarted) {
                // Resume in-progress assessment
                setStarted(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (id) {
            fetchAssessment(id);
        }
    }, [id]);

    /* ---------------- GENERATE ---------------- */

    const generateAssessment = async () => {
        try {
            const res = await axiosInstance.post('/assessment/generate', { topic });
            const aid = res.data.data;
            setAssessmentId(aid);
        } catch (err) {
            console.error(err);
        }
    };

    /* ---------------- START ---------------- */

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

    /* ---------------- SUBMIT ---------------- */

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

    /* ---------------- OPTION SELECT ---------------- */

    const selectOption = (option) => {
        const updated = [...answers];
        updated[currentQuestion] = option;
        setAnswers(updated);
    };

    /* ---------------- NAVIGATION ---------------- */

    const nextQuestion = () => {
        if (currentQuestion < assessment.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentQuestion]);

    /* ---------------- OPTION STYLE ---------------- */

    const getOptionStyle = (option) => {
        return answers[currentQuestion] === option
            ? { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }
            : {};
    };

    /* ---------------- LEVEL BADGE ---------------- */

    const LevelBadge = ({ level }) => {
        const levelColors = {
            easy: { bg: '#dcfce7', text: '#16a34a' },
            medium: { bg: '#fef9c3', text: '#ca8a04' },
            hard: { bg: '#fee2e2', text: '#dc2626' },
        };
        const lc = levelColors[level] || levelColors.easy;
        return (
            <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                style={{ backgroundColor: lc.bg, color: lc.text }}
            >
                {level}
            </span>
        );
    };

    /* ---------------- SKELETON RESULT ---------------- */

    const SkeletonResult = () => (
        <div
            className="rounded-3xl border p-8 animate-pulse"
            style={{ borderColor: colors.border, backgroundColor: cardBg }}
        >
            <div className="space-y-4">
                <div className="h-6 w-1/3 rounded" style={{ backgroundColor: colors.border }} />
                <div className="h-5 w-1/4 rounded" style={{ backgroundColor: colors.border }} />
                <div className="h-8 w-24 rounded" style={{ backgroundColor: colors.border }} />
            </div>
        </div>
    );

    /* ================================================
       GENERATE SCREEN
    ================================================ */

    if (!assessment && !assessmentId && !id) {
        return (
            <div className="min-h-screen py-16 px-6" style={{ backgroundColor: colors.bgLight }}>
                <div className="max-w-xl mx-auto space-y-6">
                    <div className="pl-5 border-l-4" style={{ borderColor: colors.secondary }}>
                        <h1 className="text-3xl font-bold" style={{ color: colors.textMain }}>
                            Generate <span style={{ color: colors.primary }}>Assessment</span>
                        </h1>
                        <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
                            Enter a topic to generate a 10-question assessment
                        </p>
                    </div>

                    <input
                        type="text"
                        placeholder="Enter topic (React, NodeJS...)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && topic && generateAssessment()}
                        className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2"
                        style={{
                            borderColor: colors.border,
                            color: colors.textMain,
                            backgroundColor: cardBg,
                        }}
                    />

                    <button
                        disabled={!topic}
                        onClick={generateAssessment}
                        className="px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50 transition-opacity"
                        style={{ backgroundColor: colors.primary }}
                    >
                        Generate Assessment
                    </button>
                </div>
            </div>
        );
    }

    /* ================================================
       START SCREEN
    ================================================ */

    if (!assessment && assessmentId) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: colors.bgLight }}
            >
                <div
                    className="p-10 rounded-3xl text-center border max-w-sm w-full mx-4"
                    style={{ borderColor: colors.border, backgroundColor: cardBg }}
                >
                    <PlayCircle
                        size={50}
                        style={{ color: colors.primary }}
                        className="mx-auto mb-4"
                    />

                    <h2 className="text-xl font-semibold mb-2" style={{ color: colors.textMain }}>
                        Assessment <span style={{ color: colors.primary }}>Ready</span>
                    </h2>

                    <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
                        10 questions • Mixed difficulty
                    </p>

                    <button
                        onClick={startAssessment}
                        className="w-full px-8 py-3 text-white rounded-xl font-semibold transition-opacity hover:opacity-90"
                        style={{ backgroundColor: colors.primary }}
                    >
                        Start Assessment
                    </button>
                </div>
            </div>
        );
    }

    if (!assessment) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: colors.bgLight }}
            >
                <p style={{ color: colors.textMuted }}>Loading...</p>
            </div>
        );
    }

    const question = assessment.questions?.[currentQuestion];
    const answeredCount = answers.filter(Boolean).length;

    /* ================================================
       MAIN ASSESSMENT PAGE
    ================================================ */

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-3xl mx-auto space-y-8">
                {/* HEADER */}
                <div className="pl-5 border-l-4" style={{ borderColor: colors.secondary }}>
                    <h1
                        className="text-3xl font-bold capitalize"
                        style={{ color: colors.textMain }}
                    >
                        {assessment.topic} <span style={{ color: colors.primary }}>Assessment</span>
                    </h1>
                    {started && !result && (
                        <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
                            {answeredCount} of {assessment.questions.length} answered
                        </p>
                    )}
                </div>

                {/* RESULT SKELETON */}
                {submitting && <SkeletonResult />}

                {/* RESULT CARD */}
                {result && (
                    <div
                        className="rounded-3xl border p-8"
                        style={{ borderColor: colors.border, backgroundColor: cardBg }}
                    >
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Trophy size={22} style={{ color: colors.primary }} />
                                    <h2
                                        className="text-2xl font-bold"
                                        style={{ color: colors.textMain }}
                                    >
                                        Assessment{' '}
                                        <span style={{ color: colors.primary }}>Complete</span>
                                    </h2>
                                </div>

                                <div
                                    className="flex items-center gap-2 text-sm"
                                    style={{ color: colors.textMuted }}
                                >
                                    <Clock size={14} />
                                    <span>Duration: {result.duration}s</span>
                                </div>

                                <div
                                    className="flex items-center gap-2 text-sm"
                                    style={{ color: colors.textMuted }}
                                >
                                    <CheckCircle2 size={14} />
                                    <span>
                                        {result.score} correct out of {result.maxScore}
                                    </span>
                                </div>
                            </div>

                            <div
                                className="text-5xl font-bold px-8 py-4 rounded-2xl"
                                style={{
                                    backgroundColor: `${colors.primary}15`,
                                    color: colors.primary,
                                }}
                            >
                                {result.score}
                                <span
                                    className="text-2xl font-medium"
                                    style={{ color: `${colors.primary}80` }}
                                >
                                    /{result.maxScore}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* REVIEW MODE — completed assessment */}
                {result && assessment?.completed && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold" style={{ color: colors.textMain }}>
                            Question Review
                        </h3>

                        {assessment.questions.map((q, index) => {
                            const isCorrect = q.userAnswer === q.correctAnswer;
                            const skipped = !q.userAnswer;

                            return (
                                <div
                                    key={q._id}
                                    className="border rounded-2xl p-5 space-y-3"
                                    style={{
                                        borderColor: skipped
                                            ? colors.border
                                            : isCorrect
                                              ? '#16a34a40'
                                              : '#dc262640',
                                        backgroundColor: skipped
                                            ? cardBg
                                            : isCorrect
                                              ? '#f0fdf4'
                                              : '#fff1f2',
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p
                                            className="font-medium text-sm leading-relaxed"
                                            style={{ color: colors.textMain }}
                                        >
                                            Q{index + 1}. {q.question}
                                        </p>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <LevelBadge level={q.level} />
                                            {skipped ? (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                                    Skipped
                                                </span>
                                            ) : isCorrect ? (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                                    Correct
                                                </span>
                                            ) : (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                                    Wrong
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {q.options.map((option, i) => {
                                            const isCorrectOpt = option === q.correctAnswer;
                                            const isUserOpt = option === q.userAnswer;

                                            let optStyle = {
                                                borderColor: colors.border,
                                                backgroundColor: cardBg,
                                                color: colors.textMain,
                                            };
                                            if (isCorrectOpt) {
                                                optStyle = {
                                                    borderColor: '#16a34a',
                                                    backgroundColor: '#dcfce7',
                                                    color: '#15803d',
                                                };
                                            } else if (isUserOpt && !isCorrectOpt) {
                                                optStyle = {
                                                    borderColor: '#dc2626',
                                                    backgroundColor: '#fee2e2',
                                                    color: '#b91c1c',
                                                };
                                            }

                                            return (
                                                <div
                                                    key={i}
                                                    className="border px-4 py-2.5 rounded-xl flex items-center gap-3 text-sm"
                                                    style={optStyle}
                                                >
                                                    <span className="font-semibold shrink-0">
                                                        {String.fromCharCode(65 + i)}.
                                                    </span>
                                                    <span>{option}</span>
                                                    {isCorrectOpt && (
                                                        <CheckCircle2
                                                            size={14}
                                                            className="ml-auto shrink-0"
                                                            style={{ color: '#16a34a' }}
                                                        />
                                                    )}
                                                    {isUserOpt && !isCorrectOpt && (
                                                        <span className="ml-auto text-xs shrink-0 font-medium">
                                                            your answer
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
                )}

                {/* PROGRESS BAR */}
                {started && !result && (
                    <div
                        className="w-full h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: colors.border }}
                    >
                        <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${((currentQuestion + 1) / assessment.questions.length) * 100}%`,
                                backgroundColor: colors.primary,
                            }}
                        />
                    </div>
                )}

                {/* QUESTION NAVIGATOR */}
                {started && !result && (
                    <div className="grid grid-cols-10 gap-2">
                        {assessment.questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestion(index)}
                                className="w-8 h-8 text-xs rounded-lg border font-medium transition-all"
                                style={{
                                    borderColor: colors.border,
                                    backgroundColor:
                                        currentQuestion === index
                                            ? colors.primary
                                            : answers[index]
                                              ? `${colors.primary}20`
                                              : cardBg,
                                    color: currentQuestion === index ? 'white' : colors.textMain,
                                }}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                )}

                {/* QUESTION CARD */}
                {started && !result && question && (
                    <>
                        <div
                            className="border rounded-3xl p-6 space-y-5"
                            style={{ borderColor: colors.border, backgroundColor: cardBg }}
                        >
                            {/* Question header */}
                            <div className="flex items-start justify-between gap-4">
                                <p
                                    className="font-semibold text-base leading-relaxed"
                                    style={{ color: colors.textMain }}
                                >
                                    Q{currentQuestion + 1}. {question.question}
                                </p>
                                <LevelBadge level={question.level} />
                            </div>

                            {/* Code block */}
                            {question.code && (
                                <pre className="p-4 rounded-xl text-sm overflow-x-auto bg-slate-900 text-slate-200">
                                    <code>{question.code}</code>
                                </pre>
                            )}

                            {/* Options */}
                            <div className="space-y-3">
                                {question.options?.map((option, i) => (
                                    <div
                                        key={i}
                                        onClick={() => selectOption(option)}
                                        className="border p-4 rounded-xl cursor-pointer transition-all hover:shadow-sm flex items-start gap-3"
                                        style={{
                                            borderColor: colors.border,
                                            ...getOptionStyle(option),
                                        }}
                                    >
                                        <span
                                            className="font-semibold text-sm shrink-0 mt-0.5"
                                            style={{ color: colors.primary }}
                                        >
                                            {String.fromCharCode(65 + i)}.
                                        </span>
                                        <span style={{ color: colors.textMain }}>{option}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* NAVIGATION */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={prevQuestion}
                                disabled={currentQuestion === 0}
                                className="flex items-center gap-2 px-4 py-2 border rounded-xl disabled:opacity-40 transition-opacity"
                                style={{
                                    borderColor: colors.border,
                                    color: colors.textMain,
                                    backgroundColor: cardBg,
                                }}
                            >
                                <ArrowLeft size={16} />
                                Previous
                            </button>

                            <span className="text-sm" style={{ color: colors.textMuted }}>
                                {currentQuestion + 1} / {assessment.questions.length}
                            </span>

                            {currentQuestion === assessment.questions.length - 1 ? (
                                <button
                                    onClick={submitAssessment}
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-2 text-white rounded-xl font-semibold disabled:opacity-60 transition-opacity hover:opacity-90"
                                    style={{ backgroundColor: '#16a34a' }}
                                >
                                    <CheckCircle2 size={16} />
                                    Submit
                                </button>
                            ) : (
                                <button
                                    onClick={nextQuestion}
                                    className="flex items-center gap-2 px-4 py-2 border rounded-xl transition-opacity hover:opacity-80"
                                    style={{
                                        borderColor: colors.border,
                                        color: colors.textMain,
                                        backgroundColor: cardBg,
                                    }}
                                >
                                    Next
                                    <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AssessmentPage;
