import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import {
    CheckCircle,
    Circle,
    BookOpen,
    ExternalLink,
    ClipboardList,
    ArrowLeft,
    PartyPopper,
    Lock,
    SearchX,
    Youtube,
    Trash2,
    AlertTriangle,
    X,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const Roadmap = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // States
    const [roadmapData, setRoadmapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showHurray, setShowHurray] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const {user} = useContext(AuthContext)
    const { colors } = getThemeColors(user?.theme || 'light');

    const isReadonly = roadmapData?.progress === 100;

    const fetchSingleRoadmap = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/roadmap`);
            const selected = res.data.data.find((r) => r._id === id);
            setRoadmapData(selected);
        } catch (error) {
            console.error('Error fetching roadmap details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchSingleRoadmap();
    }, [id]);

    useEffect(() => {
        if (roadmapData && roadmapData.roadmap && !isReadonly) {
            const allTasks = roadmapData.roadmap.flatMap((week) => week.tasks);
            const isEverythingFinished =
                allTasks.length > 0 && allTasks.every((task) => task.isCompleted);

            if (isEverythingFinished) {
                handleCompletion();
            }
        }
    }, [roadmapData]);

    const calculateProgress = (roadmap) => {
        const allTasks = roadmap.flatMap((week) => week.tasks);
        if (allTasks.length === 0) return 0;
        const completedTasks = allTasks.filter((task) => task.isCompleted).length;
        return Math.round((completedTasks / allTasks.length) * 100);
    };

    const handleCompletion = () => {
        setShowHurray(true);
        setTimeout(() => {
            navigate('/Dashboard');
        }, 3500);
    };

    const toggleTask = async (weekIndex, taskId) => {
        if (isReadonly) return;

        const updatedData = { ...roadmapData };
        const week = updatedData.roadmap[weekIndex];
        const task = week.tasks.find((t) => t._id === taskId);

        if (task) {
            task.isCompleted = !task.isCompleted;
            updatedData.progress = calculateProgress(updatedData.roadmap);
            setRoadmapData(updatedData);
        }

        try {
            await axiosInstance.patch(`/roadmap/${id}/task/${taskId}`);
        } catch (error) {
            console.error('Sync failed:', error);
            fetchSingleRoadmap();
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await axiosInstance.delete(`/roadmap/${id}`);
            // Pass a state object so the Dashboard knows to show a success message
            navigate('/Dashboard', {
                state: { message: 'Roadmap deleted successfully', type: 'success' },
            });
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete roadmap.');
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const backLabel = roadmapData?.progress === 100 ? 'Back to Completed' : 'Back to Dashboard';
    const backPath = roadmapData?.progress === 100 ? '/complete_roadmap' : '/Dashboard';

    if (loading)
        return (
            <div
                className="flex items-center justify-center min-h-screen"
                style={{ backgroundColor: colors.bgLight }}
            >
                <div className="text-center">
                    <div
                        className="w-10 h-10 rounded-full animate-spin mx-auto mb-4 border-t-2"
                        style={{ borderColor: colors.primary }}
                    ></div>
                    <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                        Curating your path...
                    </p>
                </div>
            </div>
        );

    if (!roadmapData) {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
                style={{ backgroundColor: colors.bgLight }}
            >
                <div className="p-6 rounded-full  shadow-sm mb-6">
                    <SearchX size={48} className="opacity-20" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Roadmap Not Found</h2>
                <button
                    onClick={() => navigate('/Dashboard')}
                    className="mt-4 text-blue-600 font-bold"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const displayTitle =
        roadmapData.opportunity?.title || roadmapData.targetSkill?.targetRole || 'Skill Roadmap';
    const displaySubtitle = roadmapData.opportunity?.company?.name || 'Target Learning Goal';

    return (
        <div className="min-h-screen py-12 px-4" style={{ backgroundColor: colors.bgLight }}>
            {/* CUSTOM DELETE MODAL */}
            {showDeleteModal && (
                <div style={{backgroundColor:colors.bgLight}} className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => !isDeleting && setShowDeleteModal(false)}
                    />
                    <div className="relative  w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-full transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={32} className="text-red-500" />
                            </div>
                            <h3 style={{color:colors.textMain}} className="text-xl font-bold mb-2">
                                Delete Roadmap?
                            </h3>
                            <p className="text-sm text-slate-500 mb-8 px-4">
                                This will permanently remove your progress for{' '}
                                <span className="font-bold text-slate-700">"{displayTitle}"</span>.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Yes, Delete Roadmap'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                    className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                {showHurray && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md animate-in fade-in duration-500"
                        style={{ backgroundColor: `${colors.primary}F2` }}
                    >
                        <div className="text-center text-white p-8">
                            <PartyPopper size={64} className="mx-auto mb-6 animate-bounce" />
                            <h1 className="text-4xl font-bold mb-2">Congratulations!</h1>
                            <p className="text-lg opacity-90">You've mastered this roadmap.</p>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(backPath)}
                        className="group flex items-center gap-2 font-bold transition-all text-xs uppercase tracking-widest"
                        style={{ color: colors.textMuted }}
                    >
                        <ArrowLeft
                            size={16}
                            className="group-hover:-translate-x-1 transition-transform"
                        />
                        {backLabel}
                    </button>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-[10px] uppercase tracking-widest"
                    >
                        <Trash2 size={16} /> Delete Roadmap
                    </button>
                </div>

                <header className="mb-10  p-8 rounded-3xl shadow-sm   flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1
                                className="text-2xl md:text-3xl font-bold tracking-tight"
                                style={{ color: colors.textMain }}
                            >
                                {displayTitle}
                            </h1>
                            {isReadonly && <Lock size={18} className="opacity-30" />}
                        </div>
                        <p
                            className="text-[11px] font-bold uppercase tracking-[0.2em]"
                            style={{ color: colors.secondary }}
                        >
                            {displaySubtitle}
                        </p>
                    </div>
                    <div className="md:text-right">
                        <div
                            className="text-4xl font-bold"
                            style={{ color: isReadonly ? '#10b981' : colors.primary }}
                        >
                            {roadmapData.progress || 0}%
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {isReadonly ? 'Roadmap Mastered' : 'Current Progress'}
                        </p>
                    </div>
                </header>

                <div
                    className="relative border-l-2 ml-4 md:ml-6 space-y-10"
                    style={{ borderColor: colors.border }}
                >
                    {roadmapData.roadmap.map((item, weekIndex) => (
                        <div key={weekIndex} className="relative pl-8 md:pl-10">
                            <div
                                className="absolute -left-2.25 top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm"
                                style={{
                                    backgroundColor: isReadonly ? '#10b981' : colors.primary,
                                }}
                            ></div>

                            <div className=" rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div
                                    className="px-6 py-3 flex justify-between items-center text-white"
                                    style={{
                                        backgroundColor: isReadonly
                                            ? '#059669'
                                            : colors.textMain,
                                    }}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                                        Week {item.week}
                                    </span>
                                    <BookOpen size={14} className="opacity-50" />
                                </div>

                                <div className="p-6 md:p-8">
                                    <h2
                                        className="text-xl font-bold mb-8"
                                        style={{ color: colors.textMain }}
                                    >
                                        {item.topic}
                                    </h2>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div
                                                className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-widest"
                                                style={{ color: colors.primary }}
                                            >
                                                <Youtube size={14} /> Learning Material
                                            </div>
                                            <div className="space-y-2">
                                                {item.resources.map((resource, rIndex) => (
                                                    <a
                                                        key={rIndex}
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-4  rounded-xl border border-transparent hover:border-blue-100  transition-all group"
                                                    >
                                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 line-clamp-1">
                                                            {resource.title}
                                                        </span>
                                                        <ExternalLink
                                                            size={14}
                                                            className="text-slate-300 group-hover:text-blue-700 shrink-0"
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div
                                                className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-widest"
                                                style={{ color: '#059669' }}
                                            >
                                                <ClipboardList size={14} /> Action Plan
                                            </div>
                                            <div className="space-y-2">
                                                {item.tasks.map((task, tIndex) => (
                                                    <div
                                                        key={tIndex}
                                                        onClick={() =>
                                                            toggleTask(weekIndex, task._id)
                                                        }
                                                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                                                            isReadonly
                                                                ? 'cursor-default'
                                                                : 'cursor-pointer'
                                                        } ${
                                                            task.isCompleted
                                                                ? ' border-emerald-100'
                                                                : ' border-slate-100 hover:border-emerald-200'
                                                        }`}
                                                    >
                                                        <div className="mt-0.5">
                                                            {task.isCompleted ? (
                                                                <CheckCircle
                                                                    size={20}
                                                                    className="text-emerald-500"
                                                                />
                                                            ) : (
                                                                <Circle
                                                                    size={20}
                                                                    className="text-slate-200"
                                                                />
                                                            )}
                                                        </div>
                                                        <span
                                                            className={`text-sm font-medium leading-relaxed ${
                                                                task.isCompleted
                                                                    ? 'line-through text-slate-400'
                                                                    : 'text-slate-700'
                                                            }`}
                                                        >
                                                            {task.description}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Roadmap;
