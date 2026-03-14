import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext.jsx';
import { getThemeColors } from '../theme';
import { ClipboardList, Clock } from 'lucide-react';

const PastAssessments = () => {
    const [assessments, setAssessments] = useState([]);
    const navigate = useNavigate();

    const { user } = useContext(AuthContext);
    const { colors } = getThemeColors(user?.theme || 'light');

    const fetchAssessments = async () => {
        try {
            const res = await axiosInstance.get('/assessment');
            setAssessments(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAssessments();
    }, []);

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="relative pl-5 border-l-4" style={{ borderColor: colors.secondary }}>
                    <h1
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: colors.textMain }}
                    >
                        Past Assessments
                    </h1>

                    <p className="text-sm mt-2" style={{ color: colors.textMuted }}>
                        Review your previous assessment attempts and scores.
                    </p>
                </div>

                {/* Empty State */}
                {assessments.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center py-20 border rounded-3xl"
                        style={{ borderColor: colors.border }}
                    >
                        <ClipboardList size={42} style={{ color: colors.textMuted }} />
                        <p className="mt-4 text-sm font-medium" style={{ color: colors.textMuted }}>
                            No assessments attempted yet.
                        </p>
                    </div>
                ) : (
                    /* Assessments Grid */
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assessments.map((a) => (
                            <div
                                key={a._id}
                                onClick={() => navigate(`/assessment/${a._id}`)}
                                className="rounded-3xl p-6 border shadow-sm hover:shadow-md cursor-pointer transition-all duration-300"
                                style={{
                                    borderColor: colors.border,
                                    backgroundColor: colors.white,
                                }}
                            >
                                {/* Topic */}
                                <h2
                                    className="text-lg font-bold mb-3"
                                    style={{ color: colors.textMain }}
                                >
                                    {a.topic}
                                </h2>

                                {/* Score */}
                                <div
                                    className="text-sm font-semibold mb-3"
                                    style={{ color: colors.primary }}
                                >
                                    Score: {a.score}/100
                                </div>

                                {/* Details */}
                                <div
                                    className="text-xs space-y-2"
                                    style={{ color: colors.textMuted }}
                                >
                                    <p>Start: {new Date(a.timeStarted).toLocaleString()}</p>

                                    <p>End: {new Date(a.timeCompleted).toLocaleString()}</p>

                                    <div className="flex items-center gap-2">
                                        <Clock size={14} />
                                        <span>Duration: {a.duration}s</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PastAssessments;
