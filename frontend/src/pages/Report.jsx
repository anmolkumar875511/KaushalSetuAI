import React, { useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import SkillGapChart from '../components/SkillGapChart';
import ProgressBar from '../components/ProgressBar';
import { ResumeContext } from '../context/ResumeContext';
import { FileSearch, Sparkles, ArrowRight, RotateCcw, LayoutDashboard } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const Report = () => {
    const [matchedskills, setMatchedSkills] = useState([]);
    const [unmatchedskills, setUnmatchedSkills] = useState([]);
    const [matchedPercentage, setMatchedPercentage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const {user} = useContext(AuthContext)
    const { colors } = getThemeColors(user?.theme || 'light');

    const { resume } = useContext(ResumeContext);

    const { opportunityId } = useParams();
    const navigate = useNavigate();

    const isResumeEmpty = !resume || (Array.isArray(resume) && resume.length === 0);

    const fetchSkillGap = async () => {
        try {
            setIsLoading(true);
            const res = await axiosInstance.get(`/skillgap/analyze/${opportunityId}`);
            const data = res.data.data;
            setMatchedSkills(data.matchedSkills || []);
            setUnmatchedSkills(data.missingSkills || []);
            setMatchedPercentage(data.matchPercentage || 0);
        } catch (error) {
            console.error(error.response?.data?.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch skill gap if we have a resume
        if (!isResumeEmpty) {
            fetchSkillGap();
        } else {
            setIsLoading(false);
        }
    }, [opportunityId, isResumeEmpty]);

    const createRoadmap = async () => {
        try {
            const res = await axiosInstance.post(`/roadmap/generate/${opportunityId}`);
            // Optional: navigate to the roadmap view
            navigate('/Dashboard');
        } catch (error) {
            console.error(error);
        }
    };

    if (isResumeEmpty) {
        return (
            <div
                className="flex flex-col items-center justify-center min-h-screen px-6"
                style={{ backgroundColor: colors.bgLight }}
            >
                <div className=" p-10 rounded-3xl shadow-sm border border-slate-100 max-w-md text-center">
                    <div
                        className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                        style={{
                            backgroundColor: `${colors.primary}10`,
                            color: colors.primary,
                        }}
                    >
                        <FileSearch size={32} />
                    </div>
                    <h2 className="text-xl font-bold mb-3" style={{ color: colors.textMain }}>
                        Resume Missing
                    </h2>
                    <p
                        className="text-sm font-medium leading-relaxed mb-8"
                        style={{ color: colors.textMuted }}
                    >
                        To analyze your skill gap and generate a custom roadmap, we first need to
                        process your professional experience.
                    </p>
                    <button
                        onClick={() => navigate('/Resume')}
                        className="w-full py-3.5 px-6 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                        style={{ backgroundColor: colors.primary }}
                    >
                        Go to Upload
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div
                className="flex items-center justify-center min-h-screen"
                style={{ backgroundColor: colors.bgLight }}
            >
                <div className="flex flex-col items-center">
                    <div
                        className="w-10 h-10 border-2 rounded-full animate-spin mb-4"
                        style={{
                            borderColor: colors.primary,
                            borderTopColor: 'transparent',
                        }}
                    ></div>
                    <p
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: colors.textMuted }}
                    >
                        Analyzing Skills...
                    </p>
                </div>
            </div>
        );
    }

    if (matchedskills.length === 0 && unmatchedskills.length === 0) {
        return (
            <div
                className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
                style={{ backgroundColor: colors.bgLight }}
            >
                <div className=" p-10 rounded-3xl shadow-sm border border-slate-100 max-w-md">
                    <div
                        className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                        style={{
                            backgroundColor: `${colors.secondary}10`,
                            color: colors.secondary,
                        }}
                    >
                        <Sparkles size={32} />
                    </div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: colors.textMain }}>
                        Perfect Match!
                    </h2>
                    <p
                        className="text-sm font-medium mb-8"
                        style={{ color: colors.textMuted }}
                    >
                        Your profile fully aligns with this opportunity. No additional roadmap is
                        required.
                    </p>
                    <button
                        onClick={() => navigate('/opportunities')}
                        className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border"
                        style={{
                            color: colors.textMain,
                            borderColor: colors.border,
                        }}
                    >
                        Back to Opportunities
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Analysis Section */}
                <div
                    className=" p-8 rounded-3xl shadow-sm border"
                    style={{ borderColor: colors.border }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div
                            className="w-1.5 h-6 rounded-full"
                            style={{ backgroundColor: colors.secondary }}
                        />
                        <h1 className="text-xl font-bold" style={{ color: colors.textMain }}>
                            Analysis Report
                        </h1>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Job Compatibility
                            </span>
                            <span
                                className="text-3xl font-black"
                                style={{ color: colors.primary }}
                            >
                                {matchedPercentage}%
                            </span>
                        </div>
                        <ProgressBar value={matchedPercentage} color={colors.primary} />
                    </div>
                </div>

                {/* Chart & AI Roadmap Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    <div
                        className=" rounded-3xl shadow-sm border p-2"
                        style={{ borderColor: colors.border }}
                    >
                        <SkillGapChart
                            matchedCount={matchedskills.length}
                            unmatchedCount={unmatchedskills.length}
                        />
                    </div>

                    <div
                        className=" p-8 rounded-3xl shadow-sm border flex flex-col justify-center"
                        style={{ borderColor: colors.border }}
                    >
                        <h3
                            className="text-lg font-bold mb-3"
                            style={{ color: colors.textMain }}
                        >
                            Bridge the Gap
                        </h3>
                        <p
                            className="text-sm font-medium leading-relaxed mb-8"
                            style={{ color: colors.textMuted }}
                        >
                            We've identified{' '}
                            <span style={{ color: colors.textMain }}>
                                {unmatchedskills.length} missing skills
                            </span>
                            . Generate an AI roadmap to achieve 100% eligibility.
                        </p>

                        <button
                            onClick={createRoadmap}
                            className="w-full py-4 rounded-xl font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                            style={{ backgroundColor: colors.primary }}
                        >
                            <span>Generate AI Roadmap</span>
                            <ArrowRight size={16} />
                        </button>

                        <button
                            onClick={() => navigate('/opportunities')}
                            className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                            style={{ color: colors.textMain }}
                        >
                            <RotateCcw size={12} />
                            Re-evaluate Selection
                        </button>
                    </div>
                </div>

                {/* Action Button to Dashboard */}
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => navigate('/Dashboard')}
                        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-all"
                        style={{ color: colors.textMuted }}
                    >
                        <LayoutDashboard size={14} />
                        Go to My Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Report;
