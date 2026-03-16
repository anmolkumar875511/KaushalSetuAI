import React, { useContext } from 'react';
import logo from '../assets/logo.png';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';
import { useNavigate } from 'react-router-dom';

const COMPANY_LINKS = [
    { label: 'Home', path: '/' },
    { label: 'Developer', path: '/developer' },
    { label: 'Contact Us', path: '/contact' },
];

const CONTACT_INFO = [
    { label: '+91 8755671186', href: 'tel:+918755671186' },
    { label: 'anmolkumar875511@gmail.com', href: 'mailto:anmolkumar875511@gmail.com' },
];

const Footer = () => {
    const { user } = useContext(AuthContext);
    const { colors, font, transition } = getThemeColors(user?.theme || 'light');
    const navigate = useNavigate();

    const colTitleStyle = {
        fontSize: '0.65rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        color: colors.textMain,
        fontFamily: font.mono,
        margin: 0,
        marginBottom: '0.875rem',
    };

    return (
        <footer
            style={{
                width: '100%',
                backgroundColor: colors.bgPage,
                borderTop: `1px solid ${colors.border}`,
                fontFamily: font.body,
            }}
        >
            <GlobalStyles colors={colors} />

            <div
                style={{
                    maxWidth: 1080,
                    margin: '0 auto',
                    padding: 'clamp(2rem, 5vw, 3rem) 1.25rem',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '2.5rem',
                        justifyContent: 'space-between',
                    }}
                >
                    {/* ── BRAND ── */}
                    <div
                        style={{
                            maxWidth: 280,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.875rem',
                        }}
                    >
                        <img
                            src={logo}
                            alt="KaushalSetuAI"
                            style={{ height: 40, width: 'auto', objectFit: 'contain' }}
                        />
                        <p
                            style={{
                                fontSize: '0.825rem',
                                lineHeight: 1.7,
                                color: colors.textSub,
                                margin: 0,
                            }}
                        >
                            Kaushal Setu AI bridges the gap between academic learning and real-world
                            industry skills using intelligent AI-powered solutions.
                        </p>
                    </div>

                    {/* ── LINKS ── */}
                    <div
                        style={{ display: 'flex', gap: 'clamp(2rem, 6vw, 4rem)', flexWrap: 'wrap' }}
                    >
                        {/* Company */}
                        <div>
                            <p style={colTitleStyle}>Company</p>
                            <ul
                                style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                }}
                            >
                                {COMPANY_LINKS.map(({ label, path }) => (
                                    <li key={label}>
                                        <button
                                            onClick={() => navigate(path)}
                                            className="footer-link"
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: 0,
                                                cursor: 'pointer',
                                                fontSize: '0.825rem',
                                                color: colors.textSub,
                                                fontFamily: font.body,
                                                transition: transition.fast,
                                            }}
                                        >
                                            {label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <p style={colTitleStyle}>Get In Touch</p>
                            <ul
                                style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                }}
                            >
                                {CONTACT_INFO.map(({ label, href }) => (
                                    <li key={label}>
                                        <a
                                            href={href}
                                            className="footer-link"
                                            style={{
                                                fontSize: '0.825rem',
                                                color: colors.textSub,
                                                textDecoration: 'none',
                                                fontFamily: font.body,
                                                transition: transition.fast,
                                            }}
                                        >
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ── COPYRIGHT ── */}
                <div
                    style={{
                        marginTop: '2rem',
                        paddingTop: '1.25rem',
                        borderTop: `1px solid ${colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                    }}
                >
                    <p
                        style={{
                            fontSize: '0.7rem',
                            color: colors.textMuted,
                            fontFamily: font.mono,
                            letterSpacing: '0.06em',
                            margin: 0,
                        }}
                    >
                        © 2026 KaushalSetuAI. All Rights Reserved.
                    </p>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <div
                            style={{
                                height: 2,
                                width: 16,
                                borderRadius: 2,
                                backgroundColor: colors.primary,
                            }}
                        />
                        <div
                            style={{
                                height: 2,
                                width: 5,
                                borderRadius: 2,
                                backgroundColor: colors.secondary,
                            }}
                        />
                    </div>
                </div>
            </div>
        </footer>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        .footer-link:hover { color: ${colors.primary} !important; }
    `}</style>
);

export default Footer;
