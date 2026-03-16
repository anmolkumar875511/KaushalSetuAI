import React, { useContext, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const Forgetpassw = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    const submitHandler = async (e) => {
        e.preventDefault();
        toast.promise(axiosInstance.post('/user/forgot-password', { email }), {
            loading: 'Checking credentials…',
            success: () => 'Reset link sent to your email',
            error: () => 'Something went wrong. Try again.',
        });
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
                <form onSubmit={submitHandler}>
                    {/* ── ICON + HEADER ── */}
                    <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: radius.md,
                                backgroundColor: `${colors.primary}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem',
                            }}
                        >
                            <KeyRound size={18} style={{ color: colors.primary }} />
                        </div>
                        <h2
                            style={{
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                color: colors.textOnBg,
                                fontFamily: font.display,
                                margin: 0,
                                marginBottom: 6,
                            }}
                        >
                            Forgot Password?
                        </h2>
                        <p
                            style={{
                                fontSize: '0.8rem',
                                color: colors.textSub,
                                lineHeight: 1.6,
                                margin: 0,
                            }}
                        >
                            Enter your registered email and we'll send you a recovery link.
                        </p>
                    </div>

                    {/* ── EMAIL INPUT ── */}
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <Mail
                            size={13}
                            style={{
                                position: 'absolute',
                                left: '0.875rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: colors.textSub,
                                pointerEvents: 'none',
                            }}
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            required
                            style={{
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
                            }}
                        />
                    </div>

                    {/* ── SUBMIT ── */}
                    <button
                        type="submit"
                        className="submit-btn"
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
                        Send Reset Link
                    </button>

                    {/* ── BACK ── */}
                    <div style={{ textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/Login')}
                            className="back-btn"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: colors.secondary,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: font.mono,
                                transition: transition.fast,
                            }}
                        >
                            <ArrowLeft size={12} /> Back to Login
                        </button>
                    </div>
                </form>
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
        .submit-btn:hover { opacity: 0.88 !important; }
        .back-btn:hover   { opacity: 0.65 !important; }
        @media (max-width: 480px) { input { font-size: 16px !important; } }
    `}</style>
);

export default Forgetpassw;
