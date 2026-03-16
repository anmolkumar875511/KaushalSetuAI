import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'sonner';
import { Mail, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { getThemeColors } from '../theme';

const Login = () => {
    const [state, setState] = useState('Login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const navigate = useNavigate();
    const { fetchUser, user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    /* ── Redirect if already logged in ── */
    useEffect(() => {
        if (user)
            navigate(user.role === 'student' ? '/dashboard' : '/adminDashboard', { replace: true });
    }, [user, navigate]);

    /* ── OTP countdown ── */
    useEffect(() => {
        if (state !== 'Middle' || timer <= 0) {
            if (timer === 0) setCanResend(true);
            return;
        }
        const t = setInterval(() => setTimer((p) => p - 1), 1000);
        return () => clearInterval(t);
    }, [state, timer]);

    /* ── Google OAuth ── */
    const handleGoogleLogin = () => {
        window.location.href = 'https://kaushal-setu-ai-yy8y.vercel.app/api/v1/user/auth/google';
    };

    /* ── Resend OTP ── */
    const resendOtp = () => {
        toast.promise(axiosInstance.post('/user/resend-otp', { email }), {
            loading: 'Resending OTP…',
            success: () => {
                setTimer(60);
                setCanResend(false);
                return 'OTP resent';
            },
            error: () => 'Failed to resend OTP',
        });
    };

    /* ── Verify email ── */
    const verifyEmail = (e) => {
        e.preventDefault();
        toast.promise(axiosInstance.post('/user/verify-email', { email, otp }), {
            loading: 'Verifying…',
            success: () => {
                fetchUser();
                navigate('/dashboard');
                setState('Login');
                return 'Verified!';
            },
            error: () => 'Invalid OTP',
        });
    };

    /* ── Login / Signup ── */
    const submitHandler = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Processing…');
        try {
            if (state === 'Sign Up') {
                await axiosInstance.post('/user/register', { name, email, password });
                setState('Middle');
                toast.success('OTP sent to your email', { id: toastId });
            } else {
                const res = await axiosInstance.post(
                    '/user/login',
                    { email, password },
                    { withCredentials: true }
                );
                const loggedIn = res.data.data.user;
                await fetchUser();
                toast.success('Logged in', { id: toastId, duration: 1000 });
                navigate(loggedIn.role === 'student' ? '/dashboard' : '/adminDashboard');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong', { id: toastId });
        }
    };

    /* ── Shared ── */
    const inputStyle = {
        width: '100%',
        padding: '0.7rem 0.875rem 0.7rem 2.25rem',
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        backgroundColor: colors.bgMuted,
        color: colors.textMain,
        fontSize: '0.875rem',
        outline: 'none',
        fontFamily: font.body,
        boxSizing: 'border-box',
        transition: transition.fast,
    };

    const iconStyle = {
        position: 'absolute',
        left: '0.875rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: colors.textSub,
        pointerEvents: 'none',
    };

    const labelStyle = {
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        margin: 0,
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: colors.bgPage,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                fontFamily: font.body,
            }}
        >
            <GlobalStyles colors={colors} font={font} />

            <div
                style={{
                    width: '100%',
                    maxWidth: 380,
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.xl,
                    backgroundColor: colors.bgCard,
                    padding: 'clamp(1.5rem, 5vw, 2rem)',
                    boxShadow: shadow.sm,
                    animation: 'fadeUp 0.3s ease',
                }}
            >
                {state !== 'Middle' ? (
                    /* ════════════════════════════
                       LOGIN / SIGNUP FORM
                    ════════════════════════════ */
                    <form onSubmit={submitHandler}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                            <h2
                                style={{
                                    fontSize: '1.2rem',
                                    fontWeight: 700,
                                    color: colors.textOnBg,
                                    fontFamily: font.display,
                                    margin: 0,
                                    marginBottom: 5,
                                }}
                            >
                                {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
                            </h2>
                            <p style={{ ...labelStyle, opacity: 0.6 }}>
                                {state === 'Sign Up'
                                    ? 'Bridge to your success'
                                    : 'Access your dashboard'}
                            </p>
                        </div>

                        {/* Fields */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.625rem',
                                marginBottom: '1rem',
                            }}
                        >
                            {state === 'Sign Up' && (
                                <div style={{ position: 'relative' }}>
                                    <User size={13} style={iconStyle} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Full name"
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                            )}
                            <div style={{ position: 'relative' }}>
                                <Mail size={13} style={iconStyle} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={13} style={iconStyle} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                                {state === 'Login' && (
                                    <div style={{ textAlign: 'right', marginTop: 5 }}>
                                        <span
                                            onClick={() => navigate('/forgetpassword')}
                                            style={{
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                color: colors.primary,
                                                cursor: 'pointer',
                                                fontFamily: font.mono,
                                            }}
                                            className="forgot-link"
                                        >
                                            Forgot password?
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="primary-btn"
                            style={{
                                width: '100%',
                                padding: '0.7rem',
                                backgroundColor: colors.primary,
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: radius.md,
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                                transition: transition.fast,
                                fontFamily: font.body,
                                marginBottom: '1rem',
                            }}
                        >
                            {state === 'Sign Up' ? 'Get Started' : 'Login'}
                        </button>

                        {/* Divider */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '0.875rem',
                            }}
                        >
                            <div style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                            <span
                                style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    color: colors.textSub,
                                    fontFamily: font.mono,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                or
                            </span>
                            <div style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                        </div>

                        {/* Google */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="google-btn"
                            style={{
                                width: '100%',
                                padding: '0.7rem',
                                backgroundColor: colors.bgMuted,
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.md,
                                color: colors.textMain,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                transition: transition.fast,
                                fontFamily: font.body,
                                marginBottom: '1.25rem',
                            }}
                        >
                            <img
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt="Google"
                                style={{ width: 15, height: 15 }}
                            />
                            Continue with Google
                        </button>

                        {/* Toggle */}
                        <p
                            style={{
                                textAlign: 'center',
                                fontSize: '0.775rem',
                                color: colors.textSub,
                                margin: 0,
                            }}
                        >
                            {state === 'Sign Up' ? 'Already a member?' : 'New to the platform?'}
                            <span
                                onClick={() => setState(state === 'Sign Up' ? 'Login' : 'Sign Up')}
                                className="toggle-link"
                                style={{
                                    marginLeft: 6,
                                    fontWeight: 700,
                                    color: colors.secondary,
                                    cursor: 'pointer',
                                }}
                            >
                                {state === 'Sign Up' ? 'Login' : 'Sign Up'}
                            </span>
                        </p>
                    </form>
                ) : (
                    /* ════════════════════════════
                       OTP VERIFICATION
                    ════════════════════════════ */
                    <form onSubmit={verifyEmail}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '50%',
                                    backgroundColor: `${colors.primary}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                }}
                            >
                                <ShieldCheck size={18} style={{ color: colors.primary }} />
                            </div>
                            <h2
                                style={{
                                    fontSize: '1.2rem',
                                    fontWeight: 700,
                                    color: colors.textOnBg,
                                    fontFamily: font.display,
                                    margin: 0,
                                    marginBottom: 5,
                                }}
                            >
                                Verify Email
                            </h2>
                            <p style={{ fontSize: '0.8rem', color: colors.textSub, margin: 0 }}>
                                Enter the 6-digit code sent to your inbox
                            </p>
                        </div>

                        {/* OTP Input */}
                        <input
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="000000"
                            required
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.md,
                                backgroundColor: colors.bgMuted,
                                color: colors.primary,
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                textAlign: 'center',
                                letterSpacing: '0.45em',
                                outline: 'none',
                                fontFamily: font.mono,
                                boxSizing: 'border-box',
                                transition: transition.fast,
                                marginBottom: '1rem',
                            }}
                        />

                        {/* Verify */}
                        <button
                            type="submit"
                            className="primary-btn"
                            style={{
                                width: '100%',
                                padding: '0.7rem',
                                backgroundColor: colors.secondary,
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: radius.md,
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                                transition: transition.fast,
                                fontFamily: font.body,
                                marginBottom: '0.875rem',
                            }}
                        >
                            Complete Registration
                        </button>

                        {/* Resend */}
                        <div style={{ textAlign: 'center' }}>
                            <button
                                type="button"
                                onClick={resendOtp}
                                disabled={!canResend}
                                style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    color: canResend ? colors.primary : colors.textSub,
                                    background: 'none',
                                    border: 'none',
                                    cursor: canResend ? 'pointer' : 'default',
                                    fontFamily: font.mono,
                                    transition: transition.fast,
                                }}
                            >
                                {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors, font }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: ${colors.textMuted}; }
        input:focus { border-color: ${colors.borderFocus} !important; box-shadow: 0 0 0 3px ${colors.primary}18 !important; }
        .primary-btn:hover  { opacity: 0.88 !important; }
        .google-btn:hover   { background-color: ${colors.bgHover} !important; }
        .forgot-link:hover  { opacity: 0.7; }
        .toggle-link:hover  { text-decoration: underline; }
        @media (max-width: 480px) { input { font-size: 16px !important; } }
    `}</style>
);

export default Login;
