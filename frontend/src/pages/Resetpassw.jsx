import React, { useContext, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getThemeColors } from '../theme';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Resetpassw = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confPassword, setConfPassword] = useState('');

    const { token } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    const submitHandler = async (e) => {
        e.preventDefault();
        if (newPassword !== confPassword) return toast.error('Passwords do not match');

        toast.promise(axiosInstance.post(`/user/reset-password/${token}`, { newPassword }), {
            loading: 'Updating password…',
            success: () => {
                setTimeout(() => navigate('/login'), 1500);
                return 'Password updated — please log in again';
            },
            error: (err) => err?.response?.data?.message || 'Something went wrong',
        });
    };

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
                            <ShieldCheck size={18} style={{ color: colors.primary }} />
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
                            Reset Password
                        </h2>
                        <p
                            style={{
                                fontSize: '0.8rem',
                                color: colors.textSub,
                                margin: 0,
                                lineHeight: 1.6,
                            }}
                        >
                            Secure your account with a{' '}
                            <span style={{ color: colors.secondary, fontWeight: 600 }}>
                                new password
                            </span>
                            .
                        </p>
                    </div>

                    {/* ── INPUTS ── */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.625rem',
                            marginBottom: '1rem',
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <Lock size={13} style={iconStyle} />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password"
                                required
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Lock size={13} style={iconStyle} />
                            <input
                                type="password"
                                value={confPassword}
                                onChange={(e) => setConfPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                style={inputStyle}
                            />
                        </div>
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
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 7,
                            cursor: 'pointer',
                            transition: transition.fast,
                            fontFamily: font.body,
                        }}
                    >
                        Update Password <ArrowRight size={13} />
                    </button>
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
        @media (max-width: 480px) { input { font-size: 16px !important; } }
    `}</style>
);

export default Resetpassw;
