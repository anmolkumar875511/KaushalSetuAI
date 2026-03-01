import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import axiosInstance from '../axiosInstance';
import { Plus, BookOpen, Calendar, Trophy, ArrowRight, CheckCircle, X } from 'lucide-react';
import { getThemeColors } from '../theme';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation(); // Capture the state passed from Roadmap.jsx
    const { colors } = getThemeColors(user?.theme || 'light');

    // Toast State
    const [toastMessage, setToastMessage] = useState(location.state?.message || null);

    const activeRoadmaps = roadmaps.filter((item) => (item.progress || 0) < 100);

    // Effect to handle Toast visibility
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage(null);
                // Clean up the URL state so the toast doesn't show again on refresh
                window.history.replaceState({}, document.title);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const fetchAllRoadmaps = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/roadmap/');
            setRoadmaps(res.data.data || []);
        } catch (error) {
            console.error('Error fetching roadmaps:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllRoadmaps();
    }, []);

    if (loading)
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );

    return (
        <div
            className="min-h-screen py-12 px-6 relative"
            style={{ backgroundColor: colors.bgLight }}
        >
            {/* SUCCESS TOAST NOTIFICATION */}
            {toastMessage && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 p-1.5 rounded-lg">
                                <CheckCircle size={18} className="text-emerald-400" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-widest">
                                {toastMessage}
                            </span>
                        </div>
                        <button
                            onClick={() => setToastMessage(null)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                    <div
                        className="relative pl-5 border-l-4"
                        style={{ borderColor: colors.secondary }}
                    >
                        <h1
                            className="text-3xl md:text-4xl font-bold tracking-tight"
                            style={{ color: colors.textMain }}
                        >
                            Hello,{' '}
                            <span style={{ color: colors.primary }}>
                                {user?.name || 'Explorer'}
                            </span>
                        </h1>
                        <p
                            className="mt-2 text-sm md:text-lg font-medium"
                            style={{ color: colors.textMuted }}
                        >
                            Continue your path to{' '}
                            <span style={{ color: colors.textMain }}>Career Excellence</span>.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/set-target')}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-md"
                        style={{ backgroundColor: colors.primary }}
                    >
                        <Plus size={18} /> New Goal
                    </button>
                </div>

                {activeRoadmaps.length === 0 ? (
                    <div className="text-center  p-16 rounded-[40px] shadow-sm border border-slate-100">
                        <p
                            className="font-medium opacity-60"
                            style={{ color: colors.textMain }}
                        >
                            No roadmaps generated yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeRoadmaps.map((item) => (
                            <div
                                key={item._id}
                                className="group  rounded-3xl p-6 shadow-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative overflow-hidden"
                                style={{ borderColor: colors.border }}
                            >
                                <div
                                    className="absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                    style={{
                                        backgroundColor: `${colors.primary}10`,
                                        color: colors.primary,
                                    }}
                                >
                                    {item.progress || 0}%
                                </div>

                                <div className="space-y-5">
                                    <div
                                        className="p-3 w-fit rounded-xl text-white"
                                        style={{ backgroundColor: colors.primary }}
                                    >
                                        <BookOpen size={20} />
                                    </div>

                                    <div>
                                        <h2
                                            className="text-lg font-bold line-clamp-2 min-h-14 leading-tight"
                                            style={{ color: colors.textMain }}
                                        >
                                            {item.opportunity?.title ||
                                                item.targetSkill?.targetRole ||
                                                'Career Roadmap'}
                                        </h2>
                                        <p
                                            className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-50"
                                            style={{ color: colors.textMuted }}
                                        >
                                            {item.opportunity?.company?.name || 'Personal Target'}
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
                                    </div>

                                    <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-700"
                                            style={{
                                                width: `${item.progress || 0}%`,
                                                backgroundColor: colors.primary,
                                            }}
                                        />
                                    </div>

                                    <button
                                        onClick={() => navigate(`/roadmap/${item._id}`)}
                                        className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all text-white hover:opacity-90 active:scale-[0.98]"
                                        style={{ backgroundColor: colors.textMain }}
                                    >
                                        Continue <ArrowRight size={14} />
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

export default Dashboard;
