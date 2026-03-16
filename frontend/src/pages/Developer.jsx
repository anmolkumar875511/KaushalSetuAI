import React, { useContext } from 'react';
import { Github, Linkedin, Instagram, Code2, GraduationCap } from 'lucide-react';
import Anmol from '../assets/Anmol.png';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const DEVELOPER = {
    name: 'Anmol Kumar',
    image: Anmol,
    role: 'Creator & Lead Developer – KaushalSetuAI',
    description:
        'Solo developer and architect behind KaushalSetuAI, an AI-driven workforce intelligence platform. Designed and built the entire system including AI assessment engines, resume intelligence, skill-gap analysis, job matching algorithms, and scalable backend infrastructure using Node.js and modern web technologies.',
    education: [
        { degree: 'BS in Data Science and Applications', institute: 'IIT Madras' },
        { degree: 'B.Tech in Biotechnology', institute: 'NIT Allahabad' },
    ],
    socials: {
        github: 'https://github.com/anmolkumar875511',
        linkedin: 'https://www.linkedin.com/in/anmolkumar8755/',
        instagram: 'https://www.instagram.com/anmol_kumar_shaharwal',
    },
};

const Developer = () => {
    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    if (!colors) return null;

    const labelStyle = {
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        margin: 0,
    };

    const socialLinks = [
        { href: DEVELOPER.socials.github, icon: <Github size={16} />, color: colors.textMain },
        { href: DEVELOPER.socials.linkedin, icon: <Linkedin size={16} />, color: colors.primary },
        {
            href: DEVELOPER.socials.instagram,
            icon: <Instagram size={16} />,
            color: colors.secondary,
        },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} />

            <div
                style={{
                    maxWidth: 860,
                    margin: '0 auto',
                    padding: 'clamp(2rem, 5vw, 3.5rem) 1.25rem',
                }}
            >
                {/* ── HEADER ── */}
                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: '2.5rem',
                        animation: 'fadeUp 0.3s ease',
                    }}
                >
                    <p style={{ ...labelStyle, color: colors.secondary, marginBottom: 8 }}>
                        KaushalSetuAI
                    </p>
                    <h1
                        style={{
                            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                            fontWeight: 700,
                            color: colors.textOnBg,
                            fontFamily: font.display,
                            margin: 0,
                            marginBottom: 10,
                        }}
                    >
                        Meet the Developer
                    </h1>
                    <p
                        style={{
                            fontSize: '0.875rem',
                            color: colors.textSub,
                            maxWidth: 400,
                            margin: '0 auto',
                            lineHeight: 1.7,
                        }}
                    >
                        The mind behind KaushalSetuAI's intelligent career ecosystem.
                    </p>
                </div>

                {/* ── CARD ── */}
                <div
                    className="dev-card"
                    style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.xl,
                        backgroundColor: colors.bgCard,
                        padding: 'clamp(1.25rem, 4vw, 2rem)',
                        boxShadow: shadow.sm,
                        transition: transition.normal,
                        animation: 'fadeUp 0.35s ease 0.08s both',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '1.75rem',
                            alignItems: 'flex-start',
                        }}
                    >
                        {/* ── AVATAR ── */}
                        <div
                            style={{
                                width: 110,
                                height: 110,
                                borderRadius: radius.lg,
                                overflow: 'hidden',
                                border: `1px solid ${colors.border}`,
                                flexShrink: 0,
                                margin: '0 auto',
                            }}
                        >
                            <img
                                src={DEVELOPER.image}
                                alt={DEVELOPER.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block',
                                }}
                            />
                        </div>

                        {/* ── CONTENT ── */}
                        <div style={{ flex: 1, minWidth: 220 }}>
                            {/* Name + socials */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.75rem',
                                    marginBottom: '0.5rem',
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: '1.2rem',
                                        fontWeight: 700,
                                        color: colors.textOnBg,
                                        fontFamily: font.display,
                                        margin: 0,
                                    }}
                                >
                                    {DEVELOPER.name}
                                </h3>
                                <div style={{ display: 'flex', gap: '0.625rem' }}>
                                    {socialLinks.map(({ href, icon, color }) => (
                                        <a
                                            key={href}
                                            href={href}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="social-icon"
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: radius.sm,
                                                border: `1px solid ${colors.border}`,
                                                backgroundColor: colors.bgMuted,
                                                color: colors.textSub,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                textDecoration: 'none',
                                                transition: transition.fast,
                                            }}
                                            data-color={color}
                                        >
                                            {icon}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Role */}
                            <p
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                    color: colors.primary,
                                    fontFamily: font.mono,
                                    margin: 0,
                                    marginBottom: '0.875rem',
                                }}
                            >
                                <Code2 size={13} /> {DEVELOPER.role}
                            </p>

                            {/* Description */}
                            <p
                                style={{
                                    fontSize: '0.85rem',
                                    lineHeight: 1.7,
                                    color: colors.textSub,
                                    margin: 0,
                                    marginBottom: '1.25rem',
                                }}
                            >
                                {DEVELOPER.description}
                            </p>

                            {/* Education */}
                            <div
                                style={{
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.md,
                                    backgroundColor: colors.bgMuted,
                                    padding: '1rem',
                                }}
                            >
                                <p
                                    style={{
                                        ...labelStyle,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        marginBottom: '0.75rem',
                                    }}
                                >
                                    <GraduationCap size={12} /> Academic Background
                                </p>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.625rem',
                                    }}
                                >
                                    {DEVELOPER.education.map((edu, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                paddingBottom:
                                                    i < DEVELOPER.education.length - 1
                                                        ? '0.625rem'
                                                        : 0,
                                                borderBottom:
                                                    i < DEVELOPER.education.length - 1
                                                        ? `1px solid ${colors.border}`
                                                        : 'none',
                                            }}
                                        >
                                            <p
                                                style={{
                                                    fontSize: '0.825rem',
                                                    fontWeight: 600,
                                                    color: colors.textMain,
                                                    margin: 0,
                                                    marginBottom: 2,
                                                }}
                                            >
                                                {edu.degree}
                                            </p>
                                            <p
                                                style={{
                                                    fontSize: '0.75rem',
                                                    color: colors.primary,
                                                    margin: 0,
                                                }}
                                            >
                                                {edu.institute}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .dev-card:hover   { box-shadow: 0 6px 24px rgba(0,0,0,0.09) !important; }
        .social-icon:hover { border-color: ${colors.primary} !important; color: ${colors.primary} !important; background-color: ${colors.bgHover} !important; }
    `}</style>
);

export default Developer;
