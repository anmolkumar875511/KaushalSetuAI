import React, { useContext } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const CONTACT_INFO = [
    {
        label: 'Email',
        value: 'anmolkumar875511@gmail.com',
        link: 'mailto:anmolkumar875511@gmail.com',
        icon: <Mail size={16} />,
    },
    {
        label: 'Phone',
        value: '+91 8755671186',
        link: 'tel:+918755671186',
        icon: <Phone size={16} />,
    },
    {
        label: 'Location',
        value: 'MNNIT Allahabad, Prayagraj, UP, India',
        link: '#',
        icon: <MapPin size={16} />,
    },
];

const SOCIALS = [
    { href: 'https://instagram.com', icon: <Instagram size={16} />, label: 'Instagram' },
    { href: 'https://facebook.com', icon: <Facebook size={16} />, label: 'Facebook' },
    { href: 'https://linkedin.com', icon: <Linkedin size={16} />, label: 'LinkedIn' },
];

const Contact = () => {
    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

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
            <GlobalStyles colors={colors} />

            <div
                style={{
                    maxWidth: 1000,
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
                        Contact
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
                        Get in Touch
                    </h1>
                    <p
                        style={{
                            fontSize: '0.875rem',
                            color: colors.textSub,
                            maxWidth: 420,
                            margin: '0 auto',
                            lineHeight: 1.7,
                        }}
                    >
                        We'd love to hear from you. Connect with us through any of these platforms.
                    </p>
                </div>

                {/* ── BODY ── */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '0.75rem',
                        alignItems: 'start',
                    }}
                >
                    {/* ── LEFT: contact cards ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {CONTACT_INFO.map((info, i) => (
                            <a
                                key={i}
                                href={info.link}
                                className="contact-row"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.875rem',
                                    padding: '0.875rem 1.125rem',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.lg,
                                    backgroundColor: colors.bgCard,
                                    textDecoration: 'none',
                                    boxShadow: shadow.sm,
                                    transition: transition.fast,
                                    animation: `fadeUp 0.3s ease ${i * 0.06}s both`,
                                }}
                            >
                                <div
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: radius.sm,
                                        backgroundColor: `${colors.primary}15`,
                                        color: colors.primary,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    {info.icon}
                                </div>
                                <div>
                                    <p style={{ ...labelStyle, marginBottom: 3 }}>{info.label}</p>
                                    <p
                                        style={{
                                            fontSize: '0.825rem',
                                            fontWeight: 600,
                                            color: colors.textMain,
                                            margin: 0,
                                        }}
                                    >
                                        {info.value}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* ── RIGHT: social panel ── */}
                    <div
                        style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.lg,
                            backgroundColor: colors.bgCard,
                            padding: '1.5rem',
                            boxShadow: shadow.sm,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem',
                            animation: 'fadeUp 0.3s ease 0.15s both',
                        }}
                    >
                        <div>
                            <p style={{ ...labelStyle, marginBottom: 6 }}>Socials</p>
                            <h3
                                style={{
                                    fontSize: '0.925rem',
                                    fontWeight: 700,
                                    color: colors.textMain,
                                    margin: 0,
                                    marginBottom: 4,
                                }}
                            >
                                Follow Our Journey
                            </h3>
                            <p
                                style={{
                                    fontSize: '0.8rem',
                                    color: colors.textSub,
                                    lineHeight: 1.6,
                                    margin: 0,
                                }}
                            >
                                Stay updated with our latest milestones and student stories.
                            </p>
                        </div>

                        {/* Social icons */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {SOCIALS.map(({ href, icon, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={label}
                                    className="social-btn"
                                    style={{
                                        width: 38,
                                        height: 38,
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
                                >
                                    {icon}
                                </a>
                            ))}
                        </div>

                        {/* Footer strip */}
                        <div
                            style={{
                                paddingTop: '1rem',
                                borderTop: `1px solid ${colors.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <span style={{ ...labelStyle, opacity: 0.4 }}>
                                KaushalSetuAI Global
                            </span>
                            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                <div
                                    style={{
                                        height: 3,
                                        width: 20,
                                        borderRadius: 2,
                                        backgroundColor: colors.primary,
                                    }}
                                />
                                <div
                                    style={{
                                        height: 3,
                                        width: 6,
                                        borderRadius: 2,
                                        backgroundColor: colors.secondary,
                                    }}
                                />
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
        .contact-row:hover { border-color: ${colors.primary} !important; background-color: ${colors.bgHover} !important; }
        .social-btn:hover  { border-color: ${colors.primary} !important; color: ${colors.primary} !important; background-color: ${colors.bgHover} !important; }
    `}</style>
);

export default Contact;
