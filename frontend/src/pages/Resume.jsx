import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import axiosInstance from '../axiosInstance.js';
import { useNavigate } from 'react-router-dom';
import ConfirmResume from './ConfirmResume.jsx';
import { getThemeColors } from '../theme';
import { UploadCloud, FileText, ArrowRight, MousePointer2 } from 'lucide-react';
import { toast } from 'sonner';
import { ResumeContext } from '../context/ResumeContext.jsx';

const Resume = () => {
    const { resume, fetchResume } = useContext(ResumeContext);

    const { user } = useContext(AuthContext);
    const [file, setFile] = useState(null);
    const [isContent, setIsContent] = useState(!!localStorage.getItem('lastResumeId'));
    const [resumeId, setResumeId] = useState(localStorage.getItem('lastResumeId') || '');
    const [loading, setLoading] = useState(false);
    const { colors } = getThemeColors(user?.theme || 'light');

    const navigate = useNavigate();

    const handleUpload = async () => {
        if (!file) {
            toast.warning('Please Upload the pdf file to get roadmap');
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('resume', file);

        toast.promise(axiosInstance.post('/resume/upload', formData), {
            loading: 'Parsing Your Resume...',
            success: async (res) => {
                const id = res.data.data.resumeId;
                await new Promise((resolve) => setTimeout(resolve, 1500));
                await fetchResume();
                setResumeId(id);
                setIsContent(true);
                setLoading(false);
                localStorage.setItem('lastResumeId', id);
                return 'Resume Parsed successfully!';
            },
            error: (err) => {
                if (err.status === 500) {
                    return 'Please Check Your Resume Format';
                }
                console.log(err);
                return 'Something went wrong Please try again';
            },
        });
    };

    useEffect(() => {}, [resumeId]);

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-5xl mx-auto space-y-10">
                {/* Welcome Header - Unified Style */}
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
                        Upload your PDF to generate your personalized{' '}
                        <span style={{ color: colors.textMain }}>Career Roadmap</span>.
                    </p>
                </div>

                {/* Upload Portal Card - Decent & Clean */}
                <div
                    className=" rounded-3xl p-8 md:p-12 shadow-sm border transition-all duration-300 hover:shadow-md"
                    style={{ borderColor: colors.border }}
                >
                    <div className="flex flex-col items-center justify-center space-y-6">
                        {/* Professional Icon Container */}
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform hover:scale-105"
                            style={{
                                backgroundColor: `${colors.primary}10`,
                                color: colors.primary,
                            }}
                        >
                            <UploadCloud size={32} />
                        </div>

                        <div className="text-center space-y-1">
                            <h2
                                className="text-xl font-bold"
                                style={{ color: colors.textMain }}
                            >
                                Upload Resume
                            </h2>
                            <p
                                className="text-xs font-medium"
                                style={{ color: colors.textMuted }}
                            >
                                PDF format is required for accurate parsing
                            </p>
                        </div>

                        {/* Hidden Input with Decent Label Styling */}
                        <div className="w-full max-w-md">
                            <input
                                type="file"
                                accept="application/pdf"
                                id="file-upload"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="hidden"
                            />
                            <label
                                htmlFor="file-upload"
                                className="flex items-center justify-between w-full px-5 py-3.5 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-400  transition-all group"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText size={18} className="text-slate-400 shrink-0" />
                                    <span
                                        className={`text-xs font-bold truncate ${file ? 'text-slate-900' : 'text-slate-400'}`}
                                    >
                                        {file ? file.name : 'Choose PDF file...'}
                                    </span>
                                </div>
                                <span
                                    className="px-4 py-1.5 text-[10px] font-bold text-white rounded-lg uppercase tracking-wider shadow-sm"
                                    style={{ backgroundColor: colors.primary }}
                                >
                                    Browse
                                </span>
                            </label>
                        </div>

                        {/* Action Button - Uniform with Login/Banner */}
                        <button
                            onClick={handleUpload}
                            disabled={loading}
                            className="px-12 py-3.5 rounded-xl font-bold text-white transition-all flex items-center gap-3 text-sm uppercase tracking-widest shadow-md hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                            style={{ backgroundColor: colors.secondary }}
                        >
                            {loading ? 'Processing...' : 'Upload Resume'}
                            {!loading && <ArrowRight size={16} />}
                        </button>
                    </div>
                </div>

                {/* Data Display Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <h1
                            className="text-lg font-bold uppercase tracking-wider"
                            style={{ color: colors.primary }}
                        >
                            Parsed Results
                        </h1>
                        
                    </div>

                    <div
                        className="min-h-75  rounded-3xl shadow-sm p-8 border"
                        style={{ borderColor: colors.border }}
                    >
                        {isContent ? (
                            <ConfirmResume />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full space-y-4 py-16 opacity-40">
                                <MousePointer2
                                    size={40}
                                    style={{ color: colors.textMuted }}
                                />
                                <div className="text-center">
                                    <p
                                        className="text-[10px] font-bold uppercase tracking-[0.2em]"
                                        style={{ color: colors.textMain }}
                                    >
                                        Pending Upload
                                    </p>
                                    <p
                                        className="text-xs font-medium italic"
                                        style={{ color: colors.textMuted }}
                                    >
                                        Your parsed resume data will appear here.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Resume;
