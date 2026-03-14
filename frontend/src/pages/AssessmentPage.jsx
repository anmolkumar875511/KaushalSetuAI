import React, { useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';
import { ClipboardList, Play, X } from 'lucide-react';

const Assessment = () => {
    const { user } = useContext(AuthContext);
    const { colors } = getThemeColors(user?.theme || 'light');

    const cardBg = user?.theme === 'dark' ? '#000000' : '#ffffff';

    const [assessments, setAssessments] = useState([]);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const [topic, setTopic] = useState('');

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

    const generateAssessment = async () => {
        if (!topic) return;

        try {
            setGenerating(true);

            await axiosInstance.post('/assessment/generate', { topic });

            setTopic('');
            await fetchAssessments();
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    const selectOption = (qIndex, option) => {
        setAnswers((prev) => ({
            ...prev,
            [qIndex]: option,
        }));
    };

    const submitAssessment = () => {
        let correct = 0;

        selectedAssessment.questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) correct++;
        });

        const result = Math.round((correct / selectedAssessment.questions.length) * 100);

        setScore(result);
    };

    const SkeletonCard = () => (
        <div
            className="rounded-3xl border p-8 animate-pulse"
            style={{ borderColor: colors.border, backgroundColor: cardBg }}
        >
            <div className="space-y-4">
                <div className="h-5 w-1/2 rounded" style={{ backgroundColor: colors.border }} />
                <div className="h-4 w-1/3 rounded" style={{ backgroundColor: colors.border }} />
                <div className="h-6 w-20 rounded" style={{ backgroundColor: colors.border }} />
            </div>
        </div>
    );

    const Card = ({ item }) => (
        <div
            onClick={() => {
                setSelectedAssessment(item);
                setAnswers({});
                setScore(null);
            }}
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

                <span
                    className="px-3 py-1 text-xs font-bold rounded-lg inline-block"
                    style={{
                        backgroundColor: `${colors.primary}15`,
                        color: colors.primary,
                    }}
                >
                    Start
                </span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-7xl mx-auto space-y-12">
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

                {/* GENERATE */}

                <div className="flex gap-4 flex-wrap">
                    <input
                        type="text"
                        placeholder="Enter topic (React, Node, DSA...)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="px-4 py-3 rounded-xl border text-sm w-64"
                        style={{
                            borderColor: colors.border,
                            backgroundColor: cardBg,
                            color: colors.textMain,
                        }}
                    />

                    <button
                        onClick={generateAssessment}
                        disabled={generating}
                        className="px-5 py-3 rounded-xl font-bold text-xs text-white flex items-center gap-2"
                        style={{ backgroundColor: colors.primary }}
                    >
                        <Play size={16} />
                        Generate Assessment
                    </button>
                </div>

                {/* LIST */}

                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <ClipboardList size={20} color={colors.primary} />
                        <h2 className="text-xl font-bold" style={{ color: colors.textMain }}>
                            Your Assessments
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                        ) : assessments.length ? (
                            assessments.map((item, i) => <Card key={i} item={item} />)
                        ) : (
                            <p style={{ color: colors.textMuted }}>No assessments generated yet</p>
                        )}
                    </div>
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
                        <div className="p-8 flex justify-between">
                            <h2 className="text-2xl font-bold" style={{ color: colors.textMain }}>
                                {selectedAssessment.topic}
                            </h2>

                            <button onClick={() => setSelectedAssessment(null)}>
                                <X color={colors.textMain} />
                            </button>
                        </div>

                        <div
                            className="px-8 pb-8 max-h-[65vh] overflow-y-auto space-y-6"
                            style={{ color: colors.textMain }}
                        >
                            {selectedAssessment.questions.map((q, i) => (
                                <div key={i} className="space-y-3">
                                    <p className="font-semibold">
                                        {i + 1}. {q.question}
                                    </p>

                                    {q.options.map((opt, j) => (
                                        <div
                                            key={j}
                                            onClick={() => selectOption(i, opt)}
                                            className="border rounded-xl px-4 py-3 cursor-pointer"
                                            style={{
                                                borderColor: colors.border,
                                                backgroundColor:
                                                    answers[i] === opt
                                                        ? `${colors.primary}20`
                                                        : 'transparent',
                                            }}
                                        >
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {!score && (
                                <button
                                    onClick={submitAssessment}
                                    className="mt-4 px-6 py-3 rounded-xl text-white font-bold"
                                    style={{ backgroundColor: colors.primary }}
                                >
                                    Submit
                                </button>
                            )}

                            {score !== null && (
                                <div
                                    className="text-center text-xl font-bold mt-4"
                                    style={{ color: colors.primary }}
                                >
                                    Your Score: {score}%
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
