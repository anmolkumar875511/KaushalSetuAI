import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';
import {
    Mic,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Loader2,
    Trophy,
    LayoutDashboard,
    TrendingUp,
    Target,
    AlertCircle,
    Star,
    Clock,
    Briefcase,
    Zap,
    RotateCcw,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const EXPERIENCE_LEVELS = [
    { value: 'fresher', label: 'Fresher', sub: '0 years' },
    { value: 'junior', label: 'Junior', sub: '1–2 yrs' },
    { value: 'mid', label: 'Mid', sub: '3–5 yrs' },
    { value: 'senior', label: 'Senior', sub: '5+ yrs' },
];

const QUICK_ROLES = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
    'UI/UX Designer',
    'Machine Learning Engineer',
];

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const MockInterviewPage = () => {
    const { user } = useContext(AuthContext);
    const { isDark, colors, font, radius, shadow, transition } = getThemeColors(
        user?.theme || 'light'
    );
    const navigate = useNavigate();

    // ── Setup state
    const [jobRole, setJobRole] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('junior');
    const [focusInput, setFocusInput] = useState('');
    const [focusAreas, setFocusAreas] = useState([]);
    const [totalQuestions, setTotalQuestions] = useState(5);

    // ── Interview state
    const [phase, setPhase] = useState('setup'); // setup | loading | interview | evaluating | results
    const [interview, setInterview] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState([]); // array of strings, indexed by question
    const [evaluations, setEvaluations] = useState([]); // aiEvaluation per question
    const [submittingAnswer, setSubmittingAnswer] = useState(false);
    const [result, setResult] = useState(null);

    // ── Timer
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef(null);
    const textareaRef = useRef(null);

    const startTimer = () => {
        setElapsed(0);
        timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    };
    const stopTimer = () => {
        clearInterval(timerRef.current);
        timerRef.current = null;
    };
    useEffect(() => () => stopTimer(), []);

    const formatTime = (s) =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    /* ── Focus tag helpers ── */
    const addFocusArea = (tag) => {
        const trimmed = tag.trim();
        if (trimmed && !focusAreas.includes(trimmed) && focusAreas.length < 5) {
            setFocusAreas((p) => [...p, trimmed]);
        }
        setFocusInput('');
    };

    const removeFocusArea = (tag) => setFocusAreas((p) => p.filter((t) => t !== tag));

    const handleFocusKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && focusInput.trim()) {
            e.preventDefault();
            addFocusArea(focusInput);
        }
        if (e.key === 'Backspace' && !focusInput && focusAreas.length) {
            setFocusAreas((p) => p.slice(0, -1));
        }
    };

    /* ── CREATE interview ── */
    const handleCreate = async () => {
        if (!jobRole.trim()) return;
        setPhase('loading');
        try {
            const res = await axiosInstance.post('/mock-interview/create', {
                jobRole,
                experienceLevel,
                focusAreas,
                totalQuestions,
            });
            const data = res.data.data;
            setInterview(data);
            setAnswers(new Array(data.questions.length).fill(''));
            setEvaluations(new Array(data.questions.length).fill(null));

            // Start the interview
            await axiosInstance.patch(`/mock-interview/${data.interviewId}/start`);
            startTimer();
            setCurrentIdx(0);
            setPhase('interview');
        } catch (err) {
            console.error(err);
            setPhase('setup');
        }
    };

    /* ── SUBMIT single answer ── */
    const handleSubmitAnswer = async () => {
        if (!answers[currentIdx]?.trim() || submittingAnswer) return;
        setSubmittingAnswer(true);
        try {
            const res = await axiosInstance.post(
                `/mock-interview/${interview.interviewId}/answer`,
                { questionIndex: currentIdx, answer: answers[currentIdx] }
            );
            const newEvals = [...evaluations];
            newEvals[currentIdx] = res.data.data.evaluation;
            setEvaluations(newEvals);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingAnswer(false);
        }
    };

    /* ── NEXT question ── */
    const handleNext = async () => {
        if (!evaluations[currentIdx]) {
            await handleSubmitAnswer();
        }
        if (currentIdx < interview.questions.length - 1) {
            setCurrentIdx((i) => i + 1);
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    };

    /* ── FINISH interview ── */
    const handleFinish = async () => {
        // Submit current answer if not yet evaluated
        if (answers[currentIdx]?.trim() && !evaluations[currentIdx]) {
            await handleSubmitAnswer();
        }
        stopTimer();
        setPhase('evaluating');
        try {
            const res = await axiosInstance.post(
                `/mock-interview/${interview.interviewId}/complete`
            );
            setResult(res.data.data);
            setPhase('results');
        } catch (err) {
            console.error(err);
            setPhase('evaluating');
        }
    };

    const isLastQuestion = interview && currentIdx === interview.questions.length - 1;
    const currentAnswer = answers[currentIdx] || '';
    const currentEval = evaluations[currentIdx];
    const answeredCount = evaluations.filter(Boolean).length;

    /* ─────────────────────────────
       ATOMS
    ───────────────────────────── */
    const Spinner = ({ size = 15 }) => (
        <Loader2
            size={size}
            style={{ animation: 'spin 1s linear infinite', color: colors.textSub }}
        />
    );

    const ScoreBadge = ({ score, size = 'sm' }) => {
        const color = score >= 8 ? colors.success : score >= 5 ? colors.warning : colors.danger;
        const fontSize = size === 'lg' ? '2rem' : '0.875rem';
        return (
            <span style={{ color, fontWeight: 700, fontSize, fontFamily: font.mono }}>
                {score}/10
            </span>
        );
    };

    const ghostBtn = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '0.5rem 1rem',
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        backgroundColor: 'transparent',
        color: colors.textMain,
        fontSize: '0.8rem',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: font.body,
        transition: transition.fast,
    };

    const primaryBtn = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '0.6rem 1.4rem',
        border: 'none',
        borderRadius: radius.md,
        backgroundColor: colors.primary,
        color: '#fff',
        fontSize: '0.85rem',
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: font.body,
        transition: transition.fast,
        letterSpacing: '0.02em',
    };

    /* ─────────────────────────────
       PHASE: SETUP
    ───────────────────────────── */
    if (phase === 'setup') {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: colors.bgPage,
                    fontFamily: font.body,
                }}
            >
                <GlobalStyles colors={colors} />
                <div
                    style={{
                        maxWidth: 680,
                        margin: '0 auto',
                        padding: 'clamp(2rem, 5vw, 3rem) 1.25rem',
                    }}
                >
                    {/* Header */}
                    <div style={{ marginBottom: '2.5rem', animation: 'fadeUp 0.3s ease' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                marginBottom: 8,
                            }}
                        >
                            <Mic size={20} style={{ color: colors.primary }} />
                            <p
                                style={{
                                    fontSize: 10,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: colors.textSub,
                                    fontFamily: font.mono,
                                    margin: 0,
                                }}
                            >
                                Mock Interview
                            </p>
                        </div>
                        <h1
                            style={{
                                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                                fontWeight: 700,
                                color: colors.textOnBg,
                                fontFamily: font.display,
                                margin: 0,
                                marginBottom: 8,
                            }}
                        >
                            Practice your interview
                        </h1>
                        <p style={{ fontSize: '0.9rem', color: colors.textSub, margin: 0 }}>
                            AI generates role-specific questions and evaluates your answers in
                            real-time.
                        </p>
                    </div>

                    {/* Card */}
                    <div
                        style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.lg,
                            backgroundColor: colors.bgCard,
                            boxShadow: shadow.sm,
                            overflow: 'hidden',
                            animation: 'fadeUp 0.35s ease 0.05s both',
                        }}
                    >
                        {/* Job Role */}
                        <div style={{ padding: '1.5rem' }}>
                            <label style={labelStyle(colors, font)}>Job Role *</label>
                            <input
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && jobRole.trim() && handleCreate()
                                }
                                placeholder="e.g. Backend Developer, Data Analyst..."
                                style={inputStyle(colors, font, radius)}
                            />
                            {/* Quick role chips */}
                            <div
                                style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}
                            >
                                {QUICK_ROLES.map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setJobRole(r)}
                                        style={{
                                            padding: '0.25rem 0.65rem',
                                            border: `1px solid ${jobRole === r ? colors.primary : colors.border}`,
                                            borderRadius: radius.sm,
                                            backgroundColor:
                                                jobRole === r
                                                    ? colors.primary + '15'
                                                    : 'transparent',
                                            color: jobRole === r ? colors.primary : colors.textSub,
                                            fontSize: '0.7rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            fontFamily: font.body,
                                            transition: transition.fast,
                                        }}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Divider colors={colors} />

                        {/* Experience Level */}
                        <div style={{ padding: '1.5rem' }}>
                            <label style={labelStyle(colors, font)}>Experience Level</label>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: 8,
                                    marginTop: 8,
                                }}
                            >
                                {EXPERIENCE_LEVELS.map(({ value, label, sub }) => {
                                    const active = experienceLevel === value;
                                    return (
                                        <button
                                            key={value}
                                            onClick={() => setExperienceLevel(value)}
                                            style={{
                                                padding: '0.65rem 0.5rem',
                                                border: `1px solid ${active ? colors.primary : colors.border}`,
                                                borderRadius: radius.md,
                                                backgroundColor: active
                                                    ? colors.primary + '12'
                                                    : colors.bgMuted,
                                                color: active ? colors.primary : colors.textMain,
                                                cursor: 'pointer',
                                                fontFamily: font.body,
                                                transition: transition.fast,
                                                textAlign: 'center',
                                            }}
                                        >
                                            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                                {label}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '0.65rem',
                                                    color: active ? colors.primary : colors.textSub,
                                                    marginTop: 2,
                                                }}
                                            >
                                                {sub}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <Divider colors={colors} />

                        {/* Focus Areas */}
                        <div style={{ padding: '1.5rem' }}>
                            <label style={labelStyle(colors, font)}>
                                Focus Areas{' '}
                                <span style={{ color: colors.textMuted, fontWeight: 400 }}>
                                    (optional, max 5)
                                </span>
                            </label>
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    gap: 6,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.md,
                                    padding: '0.5rem 0.75rem',
                                    marginTop: 8,
                                    backgroundColor: colors.bgMuted,
                                    minHeight: 42,
                                }}
                            >
                                {focusAreas.map((tag) => (
                                    <span
                                        key={tag}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            padding: '0.15rem 0.5rem',
                                            backgroundColor: colors.primary + '20',
                                            color: colors.primary,
                                            borderRadius: radius.sm,
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {tag}
                                        <button
                                            onClick={() => removeFocusArea(tag)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: colors.primary,
                                                padding: 0,
                                                lineHeight: 1,
                                                fontSize: '0.8rem',
                                            }}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                {focusAreas.length < 5 && (
                                    <input
                                        value={focusInput}
                                        onChange={(e) => setFocusInput(e.target.value)}
                                        onKeyDown={handleFocusKeyDown}
                                        placeholder={
                                            focusAreas.length === 0
                                                ? 'e.g. React, System Design...'
                                                : 'Add more...'
                                        }
                                        style={{
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            color: colors.textMain,
                                            fontSize: '0.82rem',
                                            fontFamily: font.body,
                                            flex: 1,
                                            minWidth: 120,
                                        }}
                                    />
                                )}
                            </div>
                            <p
                                style={{
                                    fontSize: '0.68rem',
                                    color: colors.textMuted,
                                    marginTop: 5,
                                    margin: '5px 0 0',
                                }}
                            >
                                Press Enter or comma to add a tag
                            </p>
                        </div>

                        <Divider colors={colors} />

                        {/* Number of questions */}
                        <div style={{ padding: '1.5rem' }}>
                            <label style={labelStyle(colors, font)}>Number of Questions</label>
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                {[3, 5, 7, 10].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setTotalQuestions(n)}
                                        style={{
                                            width: 52,
                                            height: 42,
                                            border: `1px solid ${totalQuestions === n ? colors.primary : colors.border}`,
                                            borderRadius: radius.md,
                                            backgroundColor:
                                                totalQuestions === n
                                                    ? colors.primary + '12'
                                                    : colors.bgMuted,
                                            color:
                                                totalQuestions === n
                                                    ? colors.primary
                                                    : colors.textMain,
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            fontFamily: font.mono,
                                            transition: transition.fast,
                                        }}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <p
                                style={{
                                    fontSize: '0.68rem',
                                    color: colors.textMuted,
                                    marginTop: 5,
                                    margin: '5px 0 0',
                                }}
                            >
                                Approx. {totalQuestions * 3}–{totalQuestions * 5} min
                            </p>
                        </div>

                        {/* Footer */}
                        <div
                            style={{
                                padding: '1.25rem 1.5rem',
                                borderTop: `1px solid ${colors.border}`,
                                backgroundColor: colors.bgMuted,
                                display: 'flex',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <button
                                onClick={handleCreate}
                                disabled={!jobRole.trim()}
                                style={{
                                    ...primaryBtn,
                                    opacity: !jobRole.trim() ? 0.5 : 1,
                                    cursor: !jobRole.trim() ? 'not-allowed' : 'pointer',
                                }}
                            >
                                Generate Interview <Zap size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Past interviews link */}
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <button
                            onClick={() => navigate('/past_interviews')}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: colors.textSub,
                                fontSize: '0.8rem',
                                fontFamily: font.body,
                            }}
                        >
                            View past interviews →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ─────────────────────────────
       PHASE: LOADING
    ───────────────────────────── */
    if (phase === 'loading') {
        return (
            <FullScreenCenter colors={colors} font={font}>
                <Spinner size={24} />
                <p style={{ fontSize: '0.9rem', color: colors.textSub, marginTop: 16 }}>
                    Generating your interview questions…
                </p>
            </FullScreenCenter>
        );
    }

    /* ─────────────────────────────
       PHASE: EVALUATING
    ───────────────────────────── */
    if (phase === 'evaluating') {
        return (
            <FullScreenCenter colors={colors} font={font}>
                <Spinner size={24} />
                <p style={{ fontSize: '0.9rem', color: colors.textSub, marginTop: 16 }}>
                    Generating your final report…
                </p>
            </FullScreenCenter>
        );
    }

    /* ─────────────────────────────
       PHASE: INTERVIEW
    ───────────────────────────── */
    if (phase === 'interview' && interview) {
        const totalQ = interview.questions.length;
        const progress = ((currentIdx + 1) / totalQ) * 100;

        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: colors.bgPage,
                    fontFamily: font.body,
                }}
            >
                <GlobalStyles colors={colors} />

                {/* Top bar */}
                <div
                    style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        backgroundColor: colors.bgCard,
                        borderBottom: `1px solid ${colors.border}`,
                        padding: '0.75rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: shadow.sm,
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span
                            style={{ fontSize: '0.82rem', fontWeight: 700, color: colors.textMain }}
                        >
                            {interview.jobRole}
                        </span>
                        <span
                            style={{
                                fontSize: '0.68rem',
                                color: colors.textSub,
                                fontFamily: font.mono,
                                textTransform: 'capitalize',
                            }}
                        >
                            {interview.experienceLevel}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Timer */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '0.25rem 0.65rem',
                                borderRadius: radius.md,
                                border: `1px solid ${colors.border}`,
                                backgroundColor: colors.bgMuted,
                            }}
                        >
                            <Clock size={12} style={{ color: colors.textSub }} />
                            <span
                                style={{
                                    fontSize: '0.75rem',
                                    fontFamily: font.mono,
                                    color: colors.textSub,
                                }}
                            >
                                {formatTime(elapsed)}
                            </span>
                        </div>
                        {/* Progress */}
                        <span
                            style={{
                                fontSize: '0.75rem',
                                fontFamily: font.mono,
                                color: colors.textSub,
                            }}
                        >
                            {currentIdx + 1} / {totalQ}
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 3, backgroundColor: colors.border }}>
                    <div
                        style={{
                            height: '100%',
                            width: `${progress}%`,
                            backgroundColor: colors.primary,
                            transition: 'width 0.4s ease',
                        }}
                    />
                </div>

                <div
                    style={{
                        maxWidth: 720,
                        margin: '0 auto',
                        padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem',
                    }}
                >
                    {/* Question pills nav */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 6,
                            flexWrap: 'wrap',
                            marginBottom: '1.5rem',
                        }}
                    >
                        {interview.questions.map((_, i) => {
                            const done = !!evaluations[i];
                            const active = i === currentIdx;
                            return (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIdx(i)}
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        border: `2px solid ${active ? colors.primary : done ? colors.success : colors.border}`,
                                        backgroundColor: active
                                            ? colors.primary
                                            : done
                                              ? colors.success + '20'
                                              : colors.bgMuted,
                                        color: active
                                            ? '#fff'
                                            : done
                                              ? colors.success
                                              : colors.textSub,
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        fontFamily: font.mono,
                                        transition: transition.fast,
                                    }}
                                >
                                    {i + 1}
                                </button>
                            );
                        })}
                    </div>

                    {/* Question card */}
                    <div
                        style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.lg,
                            backgroundColor: colors.bgCard,
                            boxShadow: shadow.sm,
                            overflow: 'hidden',
                            animation: 'fadeUp 0.25s ease',
                        }}
                        key={currentIdx}
                    >
                        {/* Question header */}
                        <div
                            style={{
                                padding: '1.5rem',
                                borderBottom: `1px solid ${colors.border}`,
                            }}
                        >
                            <p
                                style={{
                                    fontSize: 10,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: colors.textSub,
                                    fontFamily: font.mono,
                                    marginBottom: 10,
                                }}
                            >
                                Question {currentIdx + 1} of {totalQ}
                            </p>
                            <p
                                style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    color: colors.textMain,
                                    lineHeight: 1.6,
                                    margin: 0,
                                }}
                            >
                                {interview.questions[currentIdx]}
                            </p>
                        </div>

                        {/* Answer textarea */}
                        <div
                            style={{
                                padding: '1.5rem',
                                borderBottom: `1px solid ${colors.border}`,
                            }}
                        >
                            <label
                                style={{
                                    ...labelStyle(colors, font),
                                    marginBottom: 8,
                                    display: 'block',
                                }}
                            >
                                Your Answer
                            </label>
                            <textarea
                                ref={textareaRef}
                                value={currentAnswer}
                                onChange={(e) => {
                                    const newAnswers = [...answers];
                                    newAnswers[currentIdx] = e.target.value;
                                    setAnswers(newAnswers);
                                    // Clear old evaluation when user edits
                                    if (evaluations[currentIdx]) {
                                        const newEvals = [...evaluations];
                                        newEvals[currentIdx] = null;
                                        setEvaluations(newEvals);
                                    }
                                }}
                                disabled={!!currentEval}
                                placeholder="Type your answer here. Aim for 3–5 sentences that demonstrate your understanding..."
                                rows={6}
                                style={{
                                    width: '100%',
                                    resize: 'vertical',
                                    padding: '0.75rem',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.md,
                                    backgroundColor: currentEval ? colors.bgMuted : colors.bgCard,
                                    color: colors.textMain,
                                    fontSize: '0.875rem',
                                    fontFamily: font.body,
                                    lineHeight: 1.7,
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    opacity: currentEval ? 0.75 : 1,
                                }}
                            />
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: 8,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '0.68rem',
                                        color: colors.textMuted,
                                        fontFamily: font.mono,
                                    }}
                                >
                                    {currentAnswer.length} chars
                                </span>
                                {!currentEval && (
                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={!currentAnswer.trim() || submittingAnswer}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            padding: '0.4rem 0.9rem',
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: radius.md,
                                            backgroundColor: colors.bgMuted,
                                            color: colors.textMain,
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            cursor:
                                                !currentAnswer.trim() || submittingAnswer
                                                    ? 'not-allowed'
                                                    : 'pointer',
                                            opacity:
                                                !currentAnswer.trim() || submittingAnswer ? 0.5 : 1,
                                            fontFamily: font.body,
                                            transition: transition.fast,
                                        }}
                                    >
                                        {submittingAnswer ? (
                                            <>
                                                <Spinner size={12} /> Evaluating…
                                            </>
                                        ) : (
                                            <>
                                                <Zap size={12} /> Evaluate
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* AI Evaluation panel (shows after submit) */}
                        {currentEval && (
                            <div
                                style={{
                                    padding: '1.5rem',
                                    borderBottom: `1px solid ${colors.border}`,
                                    backgroundColor: colors.bgMuted,
                                    animation: 'fadeUp 0.3s ease',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '1rem',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Star size={14} style={{ color: colors.warning }} />
                                        <span
                                            style={{
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                color: colors.textMain,
                                            }}
                                        >
                                            AI Feedback
                                        </span>
                                    </div>
                                    <ScoreBadge score={currentEval.score} />
                                </div>

                                <p
                                    style={{
                                        fontSize: '0.85rem',
                                        color: colors.textSub,
                                        lineHeight: 1.6,
                                        marginBottom: '1rem',
                                    }}
                                >
                                    {currentEval.feedback}
                                </p>

                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 12,
                                        marginBottom: '1rem',
                                    }}
                                >
                                    {currentEval.strengths?.length > 0 && (
                                        <div>
                                            <p
                                                style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    color: colors.success,
                                                    letterSpacing: '0.1em',
                                                    textTransform: 'uppercase',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                Strengths
                                            </p>
                                            {currentEval.strengths.map((s, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: 6,
                                                        marginBottom: 4,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: colors.success,
                                                            fontSize: '0.75rem',
                                                            marginTop: 1,
                                                        }}
                                                    >
                                                        ✓
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: '0.78rem',
                                                            color: colors.textSub,
                                                            lineHeight: 1.5,
                                                        }}
                                                    >
                                                        {s}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {currentEval.improvements?.length > 0 && (
                                        <div>
                                            <p
                                                style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    color: colors.warning,
                                                    letterSpacing: '0.1em',
                                                    textTransform: 'uppercase',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                Improve
                                            </p>
                                            {currentEval.improvements.map((s, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: 6,
                                                        marginBottom: 4,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: colors.warning,
                                                            fontSize: '0.75rem',
                                                            marginTop: 1,
                                                        }}
                                                    >
                                                        →
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: '0.78rem',
                                                            color: colors.textSub,
                                                            lineHeight: 1.5,
                                                        }}
                                                    >
                                                        {s}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {currentEval.idealAnswer && (
                                    <details style={{ marginTop: 4 }}>
                                        <summary
                                            style={{
                                                fontSize: '0.75rem',
                                                color: colors.textSub,
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                userSelect: 'none',
                                            }}
                                        >
                                            View ideal answer
                                        </summary>
                                        <p
                                            style={{
                                                fontSize: '0.82rem',
                                                color: colors.textSub,
                                                lineHeight: 1.65,
                                                marginTop: 8,
                                                paddingLeft: 12,
                                                borderLeft: `2px solid ${colors.border}`,
                                            }}
                                        >
                                            {currentEval.idealAnswer}
                                        </p>
                                    </details>
                                )}
                            </div>
                        )}

                        {/* Navigation */}
                        <div
                            style={{
                                padding: '1rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <button
                                className="ghost-btn"
                                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                                disabled={currentIdx === 0}
                                style={{
                                    ...ghostBtn,
                                    opacity: currentIdx === 0 ? 0.35 : 1,
                                    cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                                }}
                            >
                                <ChevronLeft size={13} /> Prev
                            </button>

                            {isLastQuestion ? (
                                <button
                                    onClick={handleFinish}
                                    style={{ ...primaryBtn, backgroundColor: colors.success }}
                                >
                                    <CheckCircle2 size={14} /> Finish Interview
                                </button>
                            ) : (
                                <button
                                    className="ghost-btn"
                                    onClick={handleNext}
                                    disabled={submittingAnswer}
                                    style={{ ...ghostBtn, opacity: submittingAnswer ? 0.5 : 1 }}
                                >
                                    {submittingAnswer ? (
                                        <>
                                            <Spinner size={12} /> Evaluating…
                                        </>
                                    ) : (
                                        <>
                                            Next <ChevronRight size={13} />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ─────────────────────────────
       PHASE: RESULTS
    ───────────────────────────── */
    if (phase === 'results' && result) {
        const score = result.overallScore ?? 0;
        const scoreColor =
            score >= 70 ? colors.success : score >= 45 ? colors.warning : colors.danger;
        const durationStr = result.duration
            ? `${Math.floor(result.duration / 60)}m ${result.duration % 60}s`
            : null;

        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: colors.bgPage,
                    fontFamily: font.body,
                }}
            >
                <GlobalStyles colors={colors} />
                <div
                    style={{
                        maxWidth: 760,
                        margin: '0 auto',
                        padding: 'clamp(2rem, 5vw, 3rem) 1.25rem',
                    }}
                >
                    {/* Hero score */}
                    <div
                        style={{
                            textAlign: 'center',
                            marginBottom: '2.5rem',
                            animation: 'fadeUp 0.3s ease',
                        }}
                    >
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 90,
                                height: 90,
                                borderRadius: '50%',
                                border: `3px solid ${scoreColor}`,
                                marginBottom: 16,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 900,
                                    color: scoreColor,
                                    fontFamily: font.mono,
                                }}
                            >
                                {score}
                            </span>
                        </div>
                        <h1
                            style={{
                                fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
                                fontWeight: 700,
                                color: colors.textOnBg,
                                fontFamily: font.display,
                                margin: '0 0 6px',
                            }}
                        >
                            Interview Complete
                        </h1>
                        <p
                            style={{
                                fontSize: '0.875rem',
                                color: colors.textSub,
                                margin: '0 0 4px',
                            }}
                        >
                            {result.jobRole} · {result.experienceLevel}
                        </p>
                        {durationStr && (
                            <p
                                style={{
                                    fontSize: '0.75rem',
                                    color: colors.textMuted,
                                    fontFamily: font.mono,
                                    margin: 0,
                                }}
                            >
                                Completed in {durationStr}
                            </p>
                        )}
                    </div>

                    {/* Overall feedback */}
                    {result.overallFeedback && (
                        <div
                            style={{
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.lg,
                                backgroundColor: colors.bgCard,
                                padding: '1.5rem',
                                marginBottom: '1.25rem',
                                animation: 'fadeUp 0.3s ease 0.05s both',
                                boxShadow: shadow.sm,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 10,
                                }}
                            >
                                <Target size={15} style={{ color: colors.primary }} />
                                <span
                                    style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        color: colors.textMain,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                    }}
                                >
                                    Overall Feedback
                                </span>
                            </div>
                            <p
                                style={{
                                    fontSize: '0.9rem',
                                    color: colors.textSub,
                                    lineHeight: 1.7,
                                    margin: 0,
                                }}
                            >
                                {result.overallFeedback}
                            </p>
                        </div>
                    )}

                    {/* Strengths + Improvements */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            marginBottom: '1.25rem',
                            animation: 'fadeUp 0.3s ease 0.1s both',
                        }}
                    >
                        {result.strengths?.length > 0 && (
                            <div
                                style={{
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.lg,
                                    backgroundColor: colors.bgCard,
                                    padding: '1.25rem',
                                    boxShadow: shadow.sm,
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: colors.success,
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        marginBottom: 12,
                                    }}
                                >
                                    Strengths
                                </p>
                                {result.strengths.map((s, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 8,
                                            marginBottom: 8,
                                        }}
                                    >
                                        <TrendingUp
                                            size={13}
                                            style={{
                                                color: colors.success,
                                                flexShrink: 0,
                                                marginTop: 2,
                                            }}
                                        />
                                        <span
                                            style={{
                                                fontSize: '0.82rem',
                                                color: colors.textSub,
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            {s}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {result.areasToImprove?.length > 0 && (
                            <div
                                style={{
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.lg,
                                    backgroundColor: colors.bgCard,
                                    padding: '1.25rem',
                                    boxShadow: shadow.sm,
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: colors.warning,
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        marginBottom: 12,
                                    }}
                                >
                                    Areas to Improve
                                </p>
                                {result.areasToImprove.map((s, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 8,
                                            marginBottom: 8,
                                        }}
                                    >
                                        <AlertCircle
                                            size={13}
                                            style={{
                                                color: colors.warning,
                                                flexShrink: 0,
                                                marginTop: 2,
                                            }}
                                        />
                                        <span
                                            style={{
                                                fontSize: '0.82rem',
                                                color: colors.textSub,
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            {s}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Per-question breakdown */}
                    {result.answers?.length > 0 && (
                        <div style={{ animation: 'fadeUp 0.3s ease 0.15s both' }}>
                            <p
                                style={{
                                    fontSize: 10,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: colors.textSub,
                                    fontFamily: font.mono,
                                    marginBottom: '1rem',
                                }}
                            >
                                Question Breakdown
                            </p>
                            <div
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                            >
                                {result.answers.map((a, i) => {
                                    const ev = a.aiEvaluation;
                                    const sc = ev?.score ?? 0;
                                    const sColor =
                                        sc >= 8
                                            ? colors.success
                                            : sc >= 5
                                              ? colors.warning
                                              : colors.danger;
                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: radius.lg,
                                                backgroundColor: colors.bgCard,
                                                overflow: 'hidden',
                                                boxShadow: shadow.sm,
                                            }}
                                        >
                                            {/* Question header */}
                                            <div
                                                style={{
                                                    padding: '1rem 1.25rem',
                                                    borderBottom: `1px solid ${colors.border}`,
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    justifyContent: 'space-between',
                                                    gap: 12,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: 10,
                                                        flex: 1,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: '0.7rem',
                                                            fontFamily: font.mono,
                                                            color: colors.textMuted,
                                                            flexShrink: 0,
                                                            marginTop: 2,
                                                        }}
                                                    >
                                                        Q{i + 1}
                                                    </span>
                                                    <p
                                                        style={{
                                                            fontSize: '0.875rem',
                                                            fontWeight: 600,
                                                            color: colors.textMain,
                                                            margin: 0,
                                                            lineHeight: 1.5,
                                                        }}
                                                    >
                                                        {a.question}
                                                    </p>
                                                </div>
                                                <span
                                                    style={{
                                                        fontSize: '0.875rem',
                                                        fontWeight: 700,
                                                        color: sColor,
                                                        fontFamily: font.mono,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {sc}/10
                                                </span>
                                            </div>

                                            {/* Your answer */}
                                            {a.userAnswer && (
                                                <div
                                                    style={{
                                                        padding: '0.875rem 1.25rem',
                                                        borderBottom: `1px solid ${colors.border}`,
                                                        backgroundColor: colors.bgMuted,
                                                    }}
                                                >
                                                    <p
                                                        style={{
                                                            fontSize: '0.68rem',
                                                            fontWeight: 700,
                                                            color: colors.textMuted,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.1em',
                                                            marginBottom: 5,
                                                        }}
                                                    >
                                                        Your Answer
                                                    </p>
                                                    <p
                                                        style={{
                                                            fontSize: '0.82rem',
                                                            color: colors.textSub,
                                                            lineHeight: 1.6,
                                                            margin: 0,
                                                        }}
                                                    >
                                                        {a.userAnswer}
                                                    </p>
                                                </div>
                                            )}

                                            {/* AI feedback */}
                                            {ev?.feedback && (
                                                <div style={{ padding: '0.875rem 1.25rem' }}>
                                                    <p
                                                        style={{
                                                            fontSize: '0.82rem',
                                                            color: colors.textSub,
                                                            lineHeight: 1.6,
                                                            marginBottom: ev?.idealAnswer ? 10 : 0,
                                                        }}
                                                    >
                                                        {ev.feedback}
                                                    </p>
                                                    {ev.idealAnswer && (
                                                        <details>
                                                            <summary
                                                                style={{
                                                                    fontSize: '0.72rem',
                                                                    color: colors.textSub,
                                                                    cursor: 'pointer',
                                                                    fontWeight: 600,
                                                                    userSelect: 'none',
                                                                }}
                                                            >
                                                                View ideal answer
                                                            </summary>
                                                            <p
                                                                style={{
                                                                    fontSize: '0.8rem',
                                                                    color: colors.textSub,
                                                                    lineHeight: 1.65,
                                                                    marginTop: 6,
                                                                    paddingLeft: 10,
                                                                    borderLeft: `2px solid ${colors.border}`,
                                                                }}
                                                            >
                                                                {ev.idealAnswer}
                                                            </p>
                                                        </details>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '0.75rem',
                            marginTop: '2rem',
                            flexWrap: 'wrap',
                            animation: 'fadeUp 0.3s ease 0.2s both',
                        }}
                    >
                        <button
                            onClick={() => {
                                setPhase('setup');
                                setInterview(null);
                                setResult(null);
                                setAnswers([]);
                                setEvaluations([]);
                            }}
                            style={primaryBtn}
                        >
                            <RotateCcw size={14} /> Try Again
                        </button>
                        <button onClick={() => navigate('/dashboard')} style={ghostBtn}>
                            <LayoutDashboard size={13} /> Dashboard
                        </button>
                        <button onClick={() => navigate('/past_interviews')} style={ghostBtn}>
                            <Trophy size={13} /> Past Interviews
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

/* ─────────────────────────────────────────────
   SHARED HELPERS
───────────────────────────────────────────── */
const Divider = ({ colors }) => <div style={{ height: 1, backgroundColor: colors.border }} />;

const FullScreenCenter = ({ colors, font, children }) => (
    <div
        style={{
            minHeight: '100vh',
            backgroundColor: colors.bgPage,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: font.body,
        }}
    >
        <GlobalStyles colors={colors} />
        {children}
    </div>
);

const labelStyle = (colors, font) => ({
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.textSub,
    fontFamily: font.mono,
    display: 'block',
    marginBottom: 8,
});

const inputStyle = (colors, font, radius) => ({
    width: '100%',
    padding: '0.65rem 0.85rem',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    backgroundColor: colors.bgMuted,
    color: colors.textMain,
    fontSize: '0.875rem',
    fontFamily: font.body,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
});

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea::placeholder { color: ${colors?.textMuted}; }
        textarea:focus { border-color: ${colors?.borderFocus} !important; box-shadow: 0 0 0 3px ${colors?.primary}18 !important; }
        input::placeholder { color: ${colors?.textMuted}; }
        input:focus { border-color: ${colors?.borderFocus} !important; }
        .ghost-btn:hover:not(:disabled) { background-color: ${colors?.bgMuted} !important; }
        details summary::-webkit-details-marker { display: none; }
        details summary::marker { display: none; }
    `}</style>
);

export default MockInterviewPage;
