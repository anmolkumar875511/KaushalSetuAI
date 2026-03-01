import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, Calendar, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const CompletedRoadmap = () => {
    const [completed, setCompleted] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const {user} = useContext(AuthContext)
    const { colors } = getThemeColors(user?.theme || 'light');

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/roadmap/completed');
            // Assuming your API returns data in the same structure: res.data.data
            setCompleted(res.data.data || []);
        } catch (error) {
            console.error('Error fetching completed roadmaps:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading)
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div
                    className="animate-spin rounded-full h-10 w-10 border-t-2"
                    style={{ borderColor: colors.primary }}
                ></div>
            </div>
        );

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-6xl mx-auto">
                {/* Header Section - Decent & Clean */}
                <div
                    className="relative pl-5 border-l-4 mb-12"
                    style={{ borderColor: colors.primary }}
                >
                    <h1
                        className="text-3xl md:text-4xl font-bold tracking-tight"
                        style={{ color: colors.textMain }}
                    >
                        Mission <span style={{ color: colors.primary }}>Accomplished</span>
                    </h1>
                    <p
                        className="mt-2 text-sm md:text-lg font-medium"
                        style={{ color: colors.textMuted }}
                    >
                        Review your{' '}
                        <span style={{ color: colors.textMain }}>Completed Career Paths</span>{' '}
                        and achievements.
                    </p>
                </div>

                {completed.length === 0 ? (
                    <div
                        className="text-center  p-16 rounded-3xl shadow-sm border"
                        style={{ borderColor: colors.border }}
                    >
                        <div className="flex justify-center mb-4 opacity-20">
                            <Trophy size={48} style={{ color: colors.textMain }} />
                        </div>
                        <p
                            className="text-lg font-medium"
                            style={{ color: colors.textMuted }}
                        >
                            No roadmaps completed yet. Keep pushing!
                        </p>
                        <button
                            onClick={() => navigate('/Dashboard')}
                            className="mt-6 flex items-center justify-center gap-2 mx-auto text-xs font-bold uppercase tracking-widest hover:underline"
                            style={{ color: colors.primary }}
                        >
                            <ArrowLeft size={14} /> Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completed.map((item) => (
                            <div
                                key={item._id}
                                className="group  rounded-3xl p-6 shadow-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative overflow-hidden"
                                style={{ borderColor: colors.border }}
                            >
                                {/* Completed Badge - Professional Green */}
                                <div
                                    className="absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider"
                                    style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}
                                >
                                    <CheckCircle size={10} /> Finished
                                </div>

                                <div className="space-y-5">
                                    {/* Icon Container - Branded Blue */}
                                    <div
                                        className="p-3 w-fit rounded-xl text-white shadow-sm"
                                        style={{ backgroundColor: colors.primary }}
                                    >
                                        <Trophy size={20} />
                                    </div>

                                    <div>
                                        <h2
                                            className="text-lg font-bold line-clamp-2 min-h-14 leading-snug"
                                            style={{ color: colors.textMain }}
                                        >
                                            {item.opportunity?.title || 'Career Roadmap'}
                                        </h2>
                                        <p
                                            className="text-[11px] font-bold uppercase tracking-widest mt-1 opacity-60"
                                            style={{ color: colors.textMuted }}
                                        >
                                            {item.opportunity?.company?.name || 'Target Goal'}
                                        </p>
                                    </div>

                                    <div
                                        className="flex items-center gap-4 text-xs font-medium"
                                        style={{ color: colors.textMuted }}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="opacity-70" />
                                            <span>{item.roadmap?.length || 0} Weeks</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle size={14} style={{ color: '#16a34a' }} />
                                            <span>Validated</span>
                                        </div>
                                    </div>

                                    {/* Static Progress Bar - Uniform with Dashboard */}
                                    <div className="w-full  h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full w-full"
                                            style={{ backgroundColor: colors.primary }}
                                        />
                                    </div>

                                    <button
                                        onClick={() =>
                                            navigate(`/roadmap/${item._id}`, {
                                                state: { from: 'completed' },
                                            })
                                        }
                                        className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 text-white shadow-sm hover:opacity-90 active:scale-[0.98]"
                                        style={{ backgroundColor: colors.textMain }}
                                    >
                                        Review Roadmap <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompletedRoadmap;
