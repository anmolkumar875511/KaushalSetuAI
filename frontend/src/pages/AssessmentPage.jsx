import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';
import { ArrowRight, ArrowLeft, PlayCircle } from 'lucide-react';

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

    /* ---------------- GENERATE SCREEN ---------------- */

    if (!assessment && !assessmentId && !id) {
        return (
            <div className="min-h-screen py-16 px-6" style={{ backgroundColor: colors.bgLight }}>
                <div className="max-w-xl mx-auto space-y-6">
                    <div className="pl-5 border-l-4" style={{ borderColor: colors.secondary }}>
                        <h1 className="text-3xl font-bold" style={{ color: colors.textMain }}>
                            Generate Assessment
                        </h1>
                    </div>

                    <input
                        type="text"
                        placeholder="Enter topic (React, NodeJS...)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl"
                        style={{ borderColor: colors.border }}
                    />

                    <button
                        disabled={!topic}
                        onClick={generateAssessment}
                        className="px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50"
                        style={{ backgroundColor: colors.secondary }}
                    >
                        Generate Assessment
                    </button>
                </div>
            </div>
        );
    }

    /* ---------------- START SCREEN ---------------- */

    if (!assessment && assessmentId) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: colors.bgLight }}
            >
                <div
                    className="p-10 rounded-3xl text-center border"
                    style={{ borderColor: colors.border, backgroundColor: cardBg }}
                >
                    <PlayCircle
                        size={50}
                        style={{ color: colors.primary }}
                        className="mx-auto mb-4"
                    />

                    <h2 className="text-xl font-semibold mb-2" style={{ color: colors.textMain }}>
                        Assessment Ready
                    </h2>

                    <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
                        Click below to start your assessment
                    </p>

                    <button
                        onClick={startAssessment}
                        className="px-8 py-3 text-white rounded-xl font-semibold"
                        style={{ backgroundColor: colors.primary }}
                    >
                        Start Assessment
                    </button>
                </div>
            </div>
        );
    }

    if (!assessment) return <div className="p-6">Loading...</div>;

    const question = assessment.questions?.[currentQuestion];

    /* ---------------- PAGE ---------------- */

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-3xl mx-auto space-y-8">
                {/* HEADER */}

                <div className="pl-5 border-l-4" style={{ borderColor: colors.secondary }}>
                    <h1 className="text-3xl font-bold" style={{ color: colors.textMain }}>
                        {assessment.topic} Assessment
                    </h1>
                </div>

                {/* RESULT SKELETON */}

                {submitting && <SkeletonResult />}

                {/* RESULT CARD */}

                {result && (
                    <div
                        className="rounded-3xl border p-8 flex flex-col md:flex-row justify-between items-center gap-6"
                        style={{
                            borderColor: colors.border,
                            backgroundColor: cardBg,
                        }}
                    >
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold" style={{ color: colors.textMain }}>
                                Assessment Result
                            </h2>

                            <p style={{ color: colors.textMuted }}>
                                Duration: {result.duration}s
                            </p>
                        </div>

                        <div
                            className="text-4xl font-bold px-6 py-3 rounded-xl"
                            style={{
                                backgroundColor: `${colors.primary}15`,
                                color: colors.primary,
                            }}
                        >
                            {result.score}/{result.maxScore}
                        </div>
                    </div>
                )}

                {/* PROGRESS BAR */}

                {started && !result && (
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: colors.border }}>
                        <div
                            className="h-2 rounded-full"
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
                                className="w-8 h-8 text-xs rounded-lg border"
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

                {/* QUESTION */}

                {started && !result && question && (
                    <>
                        <div
                            className="border rounded-3xl p-6"
                            style={{ borderColor: colors.border, backgroundColor: cardBg }}
                        >
                            <p className="font-semibold mb-4" style={{ color: colors.textMain }}>
                                Q{currentQuestion + 1}. {question.question}
                            </p>

                            {question.code && (
                                <pre className="p-4 rounded-xl text-sm mb-5 overflow-x-auto bg-slate-900 text-slate-200">
                                    <code>{question.code}</code>
                                </pre>
                            )}

                            <div className="space-y-3">
                                {question.options?.map((option, i) => (
                                    <div
                                        key={i}
                                        onClick={() => selectOption(option)}
                                        className="border p-4 rounded-xl cursor-pointer transition-all hover:shadow-sm"
                                        style={{
                                            borderColor: colors.border,
                                            ...getOptionStyle(option),
                                        }}
                                    >
                                        <span className="font-medium mr-2">
                                            {String.fromCharCode(65 + i)}.
                                        </span>
                                        {option}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* NAVIGATION */}

                        <div className="flex justify-between">
                            <button
                                onClick={prevQuestion}
                                disabled={currentQuestion === 0}
                                className="flex items-center gap-2 px-4 py-2 border rounded-xl"
                                style={{ borderColor: colors.border }}
                            >
                                <ArrowLeft size={16} />
                                Previous
                            </button>

                            {currentQuestion === assessment.questions.length - 1 ? (
                                <button
                                    onClick={submitAssessment}
                                    className="px-6 py-2 text-white rounded-xl font-semibold"
                                    style={{ backgroundColor: '#16a34a' }}
                                >
                                    Submit
                                </button>
                            ) : (
                                <button
                                    onClick={nextQuestion}
                                    className="flex items-center gap-2 px-4 py-2 border rounded-xl"
                                    style={{ borderColor: colors.border }}
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