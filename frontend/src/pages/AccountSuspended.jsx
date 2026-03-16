import React, { useContext, useMemo } from 'react';
import { ShieldAlert, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const AccountSuspended = () => {
    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    // stable reference ID — won't change on re-render
    const refId = useMemo(() => Math.random().toString(36).substring(7).toUpperCase(), []);

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: colors.bgPage,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1.25rem',
                fontFamily: font.body,
                textAlign: 'center',
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                .susp-primary:hover  { opacity: 0.88 !important; }
                .susp-ghost:hover    { background-color: ${colors.bgMuted} !important; }
            `}</style>

            {/* Icon */}
            <div
                style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    backgroundColor: colors.dangerBg,
                    border: `1px solid ${colors.danger}28`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    animation: 'fadeUp 0.35s ease',
                }}
            >
                <ShieldAlert size={32} style={{ color: colors.danger }} />
            </div>

            {/* Heading */}
            <h1
                style={{
                    fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
                    fontWeight: 700,
                    color: colors.textOnBg,
                    fontFamily: font.display,
                    marginBottom: '0.75rem',
                    animation: 'fadeUp 0.35s ease 0.05s both',
                }}
            >
                Account Suspended
            </h1>

            {/* Body */}
            <p
                style={{
                    color: colors.textSub,
                    fontSize: '0.875rem',
                    lineHeight: 1.7,
                    maxWidth: 400,
                    marginBottom: '2rem',
                    animation: 'fadeUp 0.35s ease 0.1s both',
                }}
            >
                Your account has been deactivated due to a violation of our community guidelines or
                terms of service. If you believe this is a mistake, please reach out to our support
                team.
            </p>

            {/* Actions */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.625rem',
                    justifyContent: 'center',
                    animation: 'fadeUp 0.35s ease 0.15s both',
                }}
            >
                <Link
                    to="/contact"
                    className="susp-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        padding: '0.65rem 1.25rem',
                        backgroundColor: colors.danger,
                        color: '#ffffff',
                        borderRadius: radius.md,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: transition.fast,
                        letterSpacing: '0.01em',
                    }}
                >
                    <Mail size={15} />
                    Contact Support
                </Link>

                <Link
                    to="/"
                    className="susp-ghost"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        padding: '0.65rem 1.25rem',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: colors.bgCard,
                        color: colors.textMain,
                        borderRadius: radius.md,
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: transition.fast,
                    }}
                >
                    <ArrowLeft size={15} />
                    Back to Home
                </Link>
            </div>

            {/* Reference ID */}
            <p
                style={{
                    marginTop: '2.5rem',
                    fontSize: '0.7rem',
                    color: colors.textMuted,
                    fontFamily: font.mono,
                    letterSpacing: '0.08em',
                    animation: 'fadeUp 0.35s ease 0.2s both',
                }}
            >
                REF · {refId}
            </p>
        </div>
    );
};

export default AccountSuspended;
