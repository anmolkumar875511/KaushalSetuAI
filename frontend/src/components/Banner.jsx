import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getThemeColors } from '../theme';
import { AuthContext } from '../context/AuthContext';

const Banner = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { colors, font, radius, transition } = getThemeColors(user?.theme || 'light');

    return (
        <section style={{ width: '100%', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} />

            <div
                style={{
                    maxWidth: 860,
                    margin: '0 auto',
                    padding: 'clamp(3rem, 8vw, 5rem) 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                {/* Eyebrow */}
                <p
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.22em',
                        color: colors.secondary,
                        fontFamily: font.mono,
                        margin: 0,
                        marginBottom: '1rem',
                    }}
                >
                    Kaushal Setu AI
                </p>

                {/* Heading */}
                <h1
                    style={{
                        fontSize: 'clamp(1.75rem, 5vw, 3rem)',
                        fontWeight: 700,
                        color: colors.textOnBg,
                        fontFamily: font.display,
                        lineHeight: 1.2,
                        margin: 0,
                        marginBottom: '1.25rem',
                        maxWidth: 680,
                    }}
                >
                    Empower Your Future{' '}
                    <span style={{ color: colors.primary }}>With AI-Driven Skills</span>
                </h1>

                {/* Subtext */}
                <p
                    style={{
                        fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                        color: colors.textSub,
                        lineHeight: 1.75,
                        margin: 0,
                        marginBottom: '2.25rem',
                        maxWidth: 520,
                    }}
                >
                    Kaushal Setu AI bridges the gap between academic learning and real-world
                    industry demands by helping students master practical, job-ready skills.
                </p>

                {/* CTAs */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.625rem',
                    }}
                >
                    <button
                        onClick={() => navigate('/login')}
                        className="banner-primary"
                        style={{
                            padding: '0.7rem 1.5rem',
                            borderRadius: radius.md,
                            backgroundColor: colors.primary,
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            letterSpacing: '0.02em',
                            transition: transition.fast,
                            fontFamily: font.body,
                        }}
                    >
                        Get Started
                    </button>

                    <button
                        onClick={() => navigate('/developer')}
                        className="banner-ghost"
                        style={{
                            padding: '0.7rem 1.5rem',
                            borderRadius: radius.md,
                            backgroundColor: colors.bgCard,
                            color: colors.textMain,
                            border: `1px solid ${colors.border}`,
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: transition.fast,
                            fontFamily: font.body,
                        }}
                    >
                        View Developer
                    </button>
                </div>
            </div>
        </section>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .banner-primary:hover { opacity: 0.88 !important; }
        .banner-ghost:hover   { background-color: ${colors.bgHover} !important; }
    `}</style>
);

export default Banner;
