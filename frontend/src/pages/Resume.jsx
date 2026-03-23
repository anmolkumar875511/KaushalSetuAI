import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import axiosInstance from '../axiosInstance.js';
import ConfirmResume from './ConfirmResume.jsx';
import { getThemeColors } from '../theme';
import { UploadCloud, FileText, ArrowRight, MousePointer2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ResumeContext } from '../context/ResumeContext.jsx';
import { useNavigate } from 'react-router-dom';

const Resume = () => {
    const { fetchResume } = useContext(ResumeContext);
    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isContent, setIsContent] = useState(!!localStorage.getItem('lastResumeId'));

    const handleUpload = async () => {
        if (!file) return toast.warning('Please select a PDF file first');
        setLoading(true);

        const formData = new FormData();
        formData.append('resume', file);

        toast.promise(axiosInstance.post('/resume/upload', formData), {
            loading: 'Parsing your resume…',
            success: async (res) => {
                const id = res.data.data.resumeId;
                await new Promise((r) => setTimeout(r, 1500));
                await fetchResume();
                localStorage.setItem('lastResumeId', id);
                setIsContent(true);
                setLoading(false);
                return 'Resume parsed successfully!';
            },
            error: (err) => {
                setLoading(false);
                return err.status === 500
                    ? 'Please check your resume format'
                    : 'Something went wrong — try again';
            },
        });
    };

    /* ── Shared ── */
    const labelStyle = {
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        margin: 0,
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} font={font} />

            <div
                style={{
                    maxWidth: 860,
                    margin: '0 auto',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                }}
            >
                {/* ── HEADER ── */}
                <div style={{ animation: 'fadeUp 0.3s ease', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <p style={{ ...labelStyle, marginBottom: 4 }}>Resume</p>
                        <h1
                            style={{
                                fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                                fontWeight: 700,
                                color: colors.textOnBg,
                                fontFamily: font.display,
                                margin: 0,
                            }}
                        >
                            Hello,{' '}
                            <span style={{ color: colors.primary }}>{user?.name || 'Explorer'}</span>
                        </h1>
                        <p
                            style={{
                                fontSize: '0.875rem',
                                color: colors.textSub,
                                margin: '4px 0 0',
                                lineHeight: 1.6,
                            }}
                        >
                            Upload your PDF to generate your personalized career roadmap.
                        </p>
                    </div>

                    {/* ── IMPROVE RESUME BUTTON ── */}
                    {isContent && (
                        <button
                            onClick={() => navigate('/resume/improve')}
                            className="improve-btn"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '0.6rem 1.2rem',
                                border: `1px solid ${colors.primary}50`,
                                borderRadius: radius.md,
                                backgroundColor: colors.primary + '12',
                                color: colors.primary,
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: font.body,
                                transition: transition.fast,
                                letterSpacing: '0.02em',
                                animation: 'fadeUp 0.3s ease 0.08s both',
                            }}
                        >
                            <Sparkles size={14} />
                            Improve Resume
                        </button>
                    )}
                </div>

                {/* ── UPLOAD CARD ── */}
                <div
                    style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.lg,
                        backgroundColor: colors.bgCard,
                        padding: 'clamp(1.5rem, 4vw, 2rem)',
                        boxShadow: shadow.sm,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.25rem',
                        animation: 'fadeUp 0.3s ease 0.06s both',
                    }}
                >
                    {/* Icon */}
                    <div
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: radius.md,
                            backgroundColor: `${colors.primary}15`,
                            color: colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <UploadCloud size={24} />
                    </div>

                    {/* Title */}
                    <div style={{ textAlign: 'center' }}>
                        <h2
                            style={{
                                fontSize: '1rem',
                                fontWeight: 700,
                                color: colors.textMain,
                                margin: 0,
                                marginBottom: 4,
                            }}
                        >
                            Upload Resume
                        </h2>
                        <p style={{ fontSize: '0.775rem', color: colors.textSub, margin: 0 }}>
                            PDF format required for accurate parsing
                        </p>
                    </div>

                    {/* File picker */}
                    <div style={{ width: '100%', maxWidth: 400 }}>
                        <input
                            type="file"
                            accept="application/pdf"
                            id="file-upload"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
                        <label
                            htmlFor="file-upload"
                            className="file-label"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.65rem 0.875rem',
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.md,
                                backgroundColor: colors.bgMuted,
                                cursor: 'pointer',
                                gap: '0.75rem',
                                transition: transition.fast,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    overflow: 'hidden',
                                }}
                            >
                                <FileText
                                    size={14}
                                    style={{ color: colors.textSub, flexShrink: 0 }}
                                />
                                <span
                                    style={{
                                        fontSize: '0.775rem',
                                        fontWeight: 500,
                                        color: file ? colors.textMain : colors.textMuted,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {file ? file.name : 'Choose PDF file…'}
                                </span>
                            </div>
                            <span
                                style={{
                                    padding: '0.25rem 0.625rem',
                                    borderRadius: radius.sm,
                                    backgroundColor: colors.primary,
                                    color: '#fff',
                                    fontSize: '0.6rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    flexShrink: 0,
                                    fontFamily: font.mono,
                                }}
                            >
                                Browse
                            </span>
                        </label>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="upload-btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '0.7rem 1.75rem',
                            backgroundColor: loading ? colors.border : colors.secondary,
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: radius.md,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: transition.fast,
                            fontFamily: font.body,
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={14}
                                    style={{ animation: 'spin 1s linear infinite' }}
                                />{' '}
                                Processing…
                            </>
                        ) : (
                            <>
                                Upload Resume <ArrowRight size={14} />
                            </>
                        )}
                    </button>
                </div>

                {/* ── PARSED RESULTS ── */}
                <div style={{ animation: 'fadeUp 0.3s ease 0.1s both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem', flexWrap: 'wrap', gap: 8 }}>
                        <p style={{ ...labelStyle }}>Parsed Results</p>

                        {/* Inline improve button — visible when resume is parsed, as a secondary CTA */}
                        {isContent && (
                            <button
                                onClick={() => navigate('/resume/improve')}
                                className="improve-inline-btn"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    padding: '0.25rem 0.65rem',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.sm,
                                    backgroundColor: 'transparent',
                                    color: colors.textSub,
                                    fontSize: '0.68rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: font.mono,
                                    transition: transition.fast,
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                <Sparkles size={11} /> AI Improve
                            </button>
                        )}
                    </div>

                    <div
                        style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.lg,
                            backgroundColor: colors.bgCard,
                            boxShadow: shadow.sm,
                            minHeight: 200,
                            overflow: 'hidden',
                        }}
                    >
                        {isContent ? (
                            <div style={{ padding: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
                                <ConfirmResume />
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '3rem 1.5rem',
                                    gap: '0.75rem',
                                    opacity: 0.4,
                                }}
                            >
                                <MousePointer2 size={28} style={{ color: colors.textSub }} />
                                <div style={{ textAlign: 'center' }}>
                                    <p
                                        style={{
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.18em',
                                            color: colors.textMain,
                                            fontFamily: font.mono,
                                            margin: 0,
                                            marginBottom: 4,
                                        }}
                                    >
                                        Pending Upload
                                    </p>
                                    <p
                                        style={{
                                            fontSize: '0.775rem',
                                            fontStyle: 'italic',
                                            color: colors.textSub,
                                            margin: 0,
                                        }}
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

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors, font }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .file-label:hover        { border-color: ${colors.borderFocus} !important; background-color: ${colors.bgHover} !important; }
        .upload-btn:hover:not(:disabled) { opacity: 0.88 !important; }
        .improve-btn:hover       { background-color: ${colors.primary}22 !important; border-color: ${colors.primary}80 !important; }
        .improve-inline-btn:hover { color: ${colors.primary} !important; border-color: ${colors.primary}60 !important; background-color: ${colors.primary}08 !important; }
    `}</style>
);

export default Resume;