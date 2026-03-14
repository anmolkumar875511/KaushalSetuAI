import React, { useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';
import { ClipboardList, Play, X, Clock } from 'lucide-react';

const QUESTION_TIME = 30;

const Assessment = () => {
    const { user } = useContext(AuthContext);
    const { colors } = getThemeColors(user?.theme || 'light');
    const cardBg = user?.theme === 'dark' ? '#000000' : '#ffffff';

    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedAssessment, setSelectedAssessment] = useState(null);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
    const [completed, setCompleted] = useState(false);
    const [score, setScore] = useState(null);

    const fetchAssessments = async () => {
        try {
            setLoading(true);

            const res = await axiosInstance.get('/assessment');

            setAssessments(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssessments();
    }, []);

    /* TIMER */

    useEffect(() => {
        if (!selectedAssessment || completed) return;

        if (timeLeft === 0) {
            nextQuestion();

            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, selectedAssessment, completed]);

    const startAssessment = (assessment) => {
        setSelectedAssessment(assessment);

        setAnswers(assessment.answers || {});

        setCompleted(assessment.completed || false);

        setScore(assessment.score || null);

        setCurrentQuestion(0);

        setTimeLeft(QUESTION_TIME);
    };

    const selectOption = (option) => {
        if (completed) return;

        setAnswers({
            ...answers,

            [currentQuestion]: option,
        });
    };

    const nextQuestion = () => {
        if (currentQuestion < selectedAssessment.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);

            setTimeLeft(QUESTION_TIME);
        }
    };

    const goToQuestion = (index) => {
        setCurrentQuestion(index);

        setTimeLeft(QUESTION_TIME);
    };

    const submitAssessment = () => {
        let correct = 0;

        selectedAssessment.questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) correct++;
        });

        const finalScore = Math.round((correct / selectedAssessment.questions.length) * 100);

        setScore(finalScore);

        setCompleted(true);
    };

    /* CARD */

    const Card = ({ item }) => (
        <div
            onClick={() => startAssessment(item)}
            className="rounded-3xl border p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            style={{
                borderColor: colors.border,
                backgroundColor: cardBg,
            }}
        >
            <div className="space-y-4">
                <h3 className="text-xl font-bold" style={{ color: colors.textMain }}>
                    {item.topic}
                </h3>

                <p className="text-xs uppercase tracking-wider" style={{ color: colors.textMuted }}>
                    {item.questions?.length} Questions
                </p>

                {item.completed ? (
                    <span
                        className="px-3 py-1 text-xs font-bold rounded-lg inline-block"
                        style={{
                            backgroundColor: `${colors.primary}15`,
                            color: colors.primary,
                        }}
                    >
                        Revisit
                    </span>
                ) : (
                    <span
                        className="px-3 py-1 text-xs font-bold rounded-lg inline-block"
                        style={{
                            backgroundColor: `${colors.primary}15`,
                            color: colors.primary,
                        }}
                    >
                        Start
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-7xl mx-auto space-y-10">
                {/* HEADER */}

                <div className="relative pl-5 border-l-4" style={{ borderColor: colors.secondary }}>
                    <h1
                        className="text-3xl md:text-4xl font-bold"
                        style={{ color: colors.textOnBg }}
                    >
                        AI <span style={{ color: colors.primary }}>Assessment</span>
                    </h1>

                    <p className="mt-2 text-sm md:text-lg" style={{ color: colors.textMuted }}>
                        Test your knowledge with AI generated quizzes
                    </p>
                </div>

                {/* LIST */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <p>Loading...</p>
                    ) : assessments.length ? (
                        assessments.map((item, i) => <Card key={i} item={item} />)
                    ) : (
                        <p style={{ color: colors.textMuted }}>No assessments available</p>
                    )}
                </div>
            </div>

            {/* MODAL */}

            {selectedAssessment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedAssessment(null)}
                    />

                    <div
                        className="relative w-full max-w-3xl rounded-3xl shadow-xl"
                        style={{ backgroundColor: cardBg }}
                    >
                        {/* HEADER */}

                        <div className="p-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold" style={{ color: colors.textMain }}>
                                {selectedAssessment.topic}
                            </h2>

                            <button onClick={() => setSelectedAssessment(null)}>
                                <X color={colors.textMain} />
                            </button>
                        </div>

                        {/* TIMER */}

                        {!completed && (
                            <div className="px-6 flex items-center gap-2 mb-2">
                                <Clock size={16} color={colors.primary} />

                                <span style={{ color: colors.primary }}>{timeLeft}s</span>
                            </div>
                        )}

                        {/* QUESTION */}

                        <div className="px-6 pb-6 space-y-6" style={{ color: colors.textMain }}>
                            <p className="font-semibold text-lg">
                                {currentQuestion + 1}.{' '}
                                {selectedAssessment.questions[currentQuestion].question}
                            </p>

                            {/* OPTIONS */}

                            {selectedAssessment.questions[currentQuestion].options.map((opt, i) => (
                                <div
                                    key={i}
                                    onClick={() => selectOption(opt)}
                                    className="border rounded-xl px-4 py-3 cursor-pointer"
                                    style={{
                                        borderColor: colors.border,
                                        backgroundColor:
                                            answers[currentQuestion] === opt
                                                ? `${colors.primary}20`
                                                : 'transparent',
                                    }}
                                >
                                    {opt}
                                </div>
                            ))}

                            {/* NAVIGATION */}

                            <div className="flex flex-wrap gap-2 pt-4">
                                {selectedAssessment.questions.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => goToQuestion(i)}
                                        className="w-9 h-9 rounded-lg text-sm font-bold"
                                        style={{
                                            backgroundColor:
                                                i === currentQuestion
                                                    ? colors.primary
                                                    : `${colors.primary}15`,
                                            color: i === currentQuestion ? '#fff' : colors.primary,
                                        }}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            {/* SUBMIT */}

                            {!completed &&
                                Object.keys(answers).length ===
                                    selectedAssessment.questions.length && (
                                    <button
                                        onClick={submitAssessment}
                                        className="mt-4 px-6 py-3 rounded-xl text-white font-bold"
                                        style={{
                                            backgroundColor: colors.primary,
                                        }}
                                    >
                                        Submit Assessment
                                    </button>
                                )}

                            {/* RESULT */}

                            {completed && (
                                <div
                                    className="text-center text-xl font-bold mt-4"
                                    style={{ color: colors.primary }}
                                >
                                    Score: {score}%
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assessment;
