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

    const [assessment, setAssessment] = useState(null);
    const [topic, setTopic] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [started, setStarted] = useState(false);

    /* ---------------- LOAD EXISTING ASSESSMENT ---------------- */

    const fetchAssessment = async (assessmentId) => {
        try {
            const res = await axiosInstance.get(`/assessment/${assessmentId}`);
            const data = res.data.data;

            setAssessment(data);
            setAnswers(data.questions.map((q) => q.userAnswer || null));

            if (data.completed || data.timeStarted) {
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

            const assessmentId = res.data.data.assessmentId;

            setAssessment({
                _id: assessmentId,
                topic,
            });

            setStarted(false);
        } catch (err) {
            console.error(err);
        }
    };

    /* ---------------- START ---------------- */

    const startAssessment = async () => {
        try {
            const res = await axiosInstance.patch(`/assessment/start/${assessment._id}`);

            const data = res.data.data.assessment;

            setAssessment(data);
            setAnswers(data.questions.map(() => null));
            setStarted(true);
        } catch (err) {
            console.error(err);
        }
    };

    /* ---------------- SUBMIT ---------------- */

    const submitAssessment = async () => {
        try {
            const res = await axiosInstance.post('/assessment/submit', {
                assessmentId: assessment._id,
                answers,
            });

            const result = res.data.data.assessment;

            setAssessment(result);
            setAnswers(result.questions.map((q) => q.userAnswer));
            setStarted(true);
        } catch (err) {
            console.error(err);
        }
    };

    /* ---------------- SELECT OPTION ---------------- */

    const selectOption = (option) => {
        if (assessment.completed) return;

        const newAnswers = [...answers];
        newAnswers[currentQuestion] = option;

        setAnswers(newAnswers);
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
        if (!assessment.completed) {
            return answers[currentQuestion] === option
                ? { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }
                : {};
        }

        const question = assessment.questions[currentQuestion];

        if (option === question.correctAnswer) {
            return { backgroundColor: '#dcfce7', borderColor: '#16a34a' };
        }

        if (option === question.userAnswer && option !== question.correctAnswer) {
            return { backgroundColor: '#fee2e2', borderColor: '#dc2626' };
        }

        return {};
    };

    /* ---------------- GENERATE SCREEN ---------------- */

    if (!assessment && !id) {
        return (
            <div className="min-h-screen py-16 px-6" style={{ backgroundColor: colors.bgLight }}>
                <div className="max-w-xl mx-auto space-y-6">
                    <div
                        className="relative pl-5 border-l-4"
                        style={{ borderColor: colors.secondary }}
                    >
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

    if (!assessment) return <div className="p-6">Loading...</div>;

    const completed = assessment.completed;
    const question = assessment.questions?.[currentQuestion];

    /* ---------------- PAGE ---------------- */

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-3xl mx-auto space-y-8">
                {/* HEADER */}

                <div className="relative pl-5 border-l-4" style={{ borderColor: colors.secondary }}>
                    <h1 className="text-3xl font-bold" style={{ color: colors.textMain }}>
                        {assessment.topic} Assessment
                    </h1>
                </div>

                {/* START SCREEN */}

                {!started && !completed && (
                    <div
                        className="border rounded-3xl p-10 text-center"
                        style={{ borderColor: colors.border, backgroundColor: colors.white }}
                    >
                        <PlayCircle
                            size={48}
                            style={{ color: colors.primary }}
                            className="mx-auto mb-4"
                        />

                        <p className="mb-6 text-sm" style={{ color: colors.textMuted }}>
                            Click below to start the assessment
                        </p>

                        <button
                            onClick={startAssessment}
                            className="px-8 py-3 text-white rounded-xl font-semibold"
                            style={{ backgroundColor: colors.primary }}
                        >
                            Start Assessment
                        </button>
                    </div>
                )}

                {/* RESULT */}

                {completed && (
                    <div
                        className="border rounded-2xl p-5 flex items-center justify-between"
                        style={{ borderColor: colors.border, backgroundColor: colors.white }}
                    >
                        <div>
                            <p className="font-bold text-lg" style={{ color: colors.textMain }}>
                                Your Score
                            </p>

                            <p className="text-sm" style={{ color: colors.textMuted }}>
                                Duration: {assessment.duration}s
                            </p>
                        </div>

                        <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                            {assessment.score}/100
                        </div>
                    </div>
                )}

                {/* QUESTIONS */}

                {(started || completed) && question && (
                    <>
                        <div
                            className="border rounded-3xl p-6"
                            style={{ borderColor: colors.border, backgroundColor: colors.white }}
                        >
                            <p className="font-semibold mb-4" style={{ color: colors.textMain }}>
                                Q{currentQuestion + 1}. {question.question}
                            </p>

                            <div className="space-y-3">
                                {question.options.map((option, i) => (
                                    <div
                                        key={i}
                                        onClick={() => !completed && selectOption(option)}
                                        className="border p-4 rounded-xl cursor-pointer"
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

                            <div className="text-xs mt-4" style={{ color: colors.textMuted }}>
                                Difficulty: {question.level}
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

                            {currentQuestion === assessment.questions.length - 1 && !completed ? (
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
                                    disabled={currentQuestion === assessment.questions.length - 1}
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
