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
    const [assessmentId, setAssessmentId] = useState(id || null);
    const [topic, setTopic] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [started, setStarted] = useState(false);

    /* ---------------- FETCH ASSESSMENT ---------------- */

    const fetchAssessment = async (id) => {
        try {
            const res = await axiosInstance.get(`/assessment/${id}`);
            const data = res.data.data;

            setAssessment(data);
            setAnswers(data.questions.map((q) => q.userAnswer || null));

            if (data.timeStarted || data.completed) {
                setStarted(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (assessmentId) {
            fetchAssessment(assessmentId);
        }
    }, [assessmentId]);

    /* ---------------- GENERATE ---------------- */

    const generateAssessment = async () => {
        try {
            const res = await axiosInstance.post('/assessment/generate', { topic });

            const newId = res.data.data;

            setAssessmentId(newId);
            setAssessment(null);
            setStarted(false);
        } catch (err) {
            console.error(err);
        }
    };

    /* ---------------- START ---------------- */

    const startAssessment = async () => {
        try {
            await axiosInstance.patch(`/assessment/start/${assessmentId}`);

            await fetchAssessment(assessmentId);

            setStarted(true);
        } catch (err) {
            console.error(err);
        }
    };

    /* ---------------- SUBMIT ---------------- */

    const submitAssessment = async () => {
        try {
            await axiosInstance.post('/assessment/submit', {
                assessmentId,
                answers,
            });

            await fetchAssessment(assessmentId);
        } catch (err) {
            console.error(err);
        }
    };

    /* ---------------- OPTION SELECT ---------------- */

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

    if (!assessmentId) {
        return (
            <div className="min-h-screen py-16 px-6" style={{ backgroundColor: colors.bgLight }}>
                <div className="max-w-xl mx-auto space-y-6">
                    <h1 className="text-3xl font-bold" style={{ color: colors.textMain }}>
                        Generate Assessment
                    </h1>

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
                        className="px-6 py-3 rounded-xl text-white font-semibold"
                        style={{ backgroundColor: colors.secondary }}
                    >
                        Generate Assessment
                    </button>
                </div>
            </div>
        );
    }

    /* ---------------- LOADING ---------------- */

    if (!assessment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading assessment...
            </div>
        );
    }

    const completed = assessment.completed;
    const question = assessment.questions[currentQuestion];

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold" style={{ color: colors.textMain }}>
                    {assessment.topic} Assessment
                </h1>

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

                        <p className="mb-6 text-sm">
                            This assessment contains {assessment.questions.length} questions
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
                        className="border rounded-2xl p-5 flex justify-between"
                        style={{ borderColor: colors.border, backgroundColor: colors.white }}
                    >
                        <div>
                            <p className="font-bold">Your Score</p>
                            <p className="text-sm">Duration: {assessment.duration}s</p>
                        </div>

                        <div className="text-2xl font-bold">{assessment.score}/100</div>
                    </div>
                )}

                {/* QUESTIONS */}

                {(started || completed) && (
                    <>
                        <div
                            className="border rounded-3xl p-6"
                            style={{ borderColor: colors.border, backgroundColor: colors.white }}
                        >
                            <p className="font-semibold mb-4">
                                Q{currentQuestion + 1}. {question.question}
                            </p>

                            {question.code && (
                                <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl mb-5">
                                    <code>{question.code}</code>
                                </pre>
                            )}

                            <div className="space-y-3">
                                {question.options.map((option, i) => (
                                    <div
                                        key={i}
                                        onClick={() =>
                                            !assessment.completed && selectOption(option)
                                        }
                                        className="border p-4 rounded-xl cursor-pointer"
                                        style={{
                                            borderColor: colors.border,
                                            ...getOptionStyle(option),
                                        }}
                                    >
                                        {String.fromCharCode(65 + i)}. {option}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* NAVIGATION */}

                        <div className="flex justify-between">
                            <button
                                onClick={prevQuestion}
                                disabled={currentQuestion === 0}
                                className="px-4 py-2 border rounded-xl"
                                style={{ borderColor: colors.border }}
                            >
                                <ArrowLeft size={16} />
                            </button>

                            {currentQuestion === assessment.questions.length - 1 && !completed ? (
                                <button
                                    onClick={submitAssessment}
                                    className="px-6 py-2 text-white rounded-xl"
                                    style={{ backgroundColor: '#16a34a' }}
                                >
                                    Submit
                                </button>
                            ) : (
                                <button
                                    onClick={nextQuestion}
                                    className="px-4 py-2 border rounded-xl"
                                    style={{ borderColor: colors.border }}
                                >
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
