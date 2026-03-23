import React, { useContext, useEffect, useState, useRef } from 'react';
import logo from '../assets/logo.png';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../axiosInstance';
import avatar from '../assets/avatar.svg';
import { getThemeColors } from '../theme';
import { User, LogOut, Phone, CheckCircle, Sun, Moon, Menu, X } from 'lucide-react';
import { toast } from 'sonner';

function Navbar() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);
    const { colors, font, radius, transition } = getThemeColors(user?.theme || 'light');

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const menuRef = useRef(null);

    /* ── Theme toggle ── */
    const toggleTheme = async () => {
        if (!user) return toast.error('Please login to switch themes');
        const newTheme = user.theme === 'light' ? 'dark' : 'light';
        try {
            await axiosInstance.patch('/user/theme', { theme: newTheme });
            setUser({ ...user, theme: newTheme });
            toast.success(`Switched to ${newTheme} mode`);
        } catch {
            toast.error('Failed to update theme');
        }
    };

    /* ── Logout ── */
    const logout = async () => {
        try {
            await axiosInstance.post('/user/logout');
        } catch {
        } finally {
            setUser(null);
            setIsMenuOpen(false);
            setIsMobileNavOpen(false);
            navigate('/');
        }
    };

    /* ── Click outside ── */
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── Nav links ── */
    const mainLinks =
        user?.role === 'admin'
            ? [
                  { name: 'Admin Panel', path: '/adminDashboard' },
                  { name: 'System Logs', path: '/logger' },
                  { name: 'All Users', path: '/users' },
              ]
            : [
                  { name: user ? 'Dashboard' : 'Home', path: user ? '/dashboard' : '/' },
                  { name: user ? 'Resume' : 'Developer', path: user ? '/resume' : '/developer' },
                  ...(user
                      ? [
                            { name: 'Opportunities', path: '/opportunities' },
                            { name: 'Ranked Jobs', path: '/ranked-jobs' },
                            { name: 'Guidance', path: '/guidance' },
                            { name: 'Assessment', path: '/assessment' },
                            { name: 'Mock Interviews', path: '/mock-interview' },
                        ]
                      : [{ name: 'Contact', path: '/contact' }]),
              ];

    if (!colors) return null;

    const logoTarget = user?.role === 'admin' ? '/adminDashboard' : user ? '/dashboard' : '/';

    return (
        <>
            <GlobalStyles colors={colors} font={font} />

            <nav
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    height: 60,
                    backgroundColor: `${colors.bgPage}EE`,
                    borderBottom: `1px solid ${colors.border}`,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    transition: transition.normal,
                    fontFamily: font.body,
                }}
            >
                <div
                    style={{
                        maxWidth: 1160,
                        margin: '0 auto',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 1.25rem',
                        gap: '1rem',
                    }}
                >
                    {/* ── HAMBURGER (mobile) ── */}
                    <button
                        onClick={() => setIsMobileNavOpen((v) => !v)}
                        className="mobile-only nav-icon-btn"
                        style={{
                            color: colors.textMain,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'none',
                            padding: 6,
                            borderRadius: radius.sm,
                        }}
                    >
                        {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {/* ── LOGO ── */}
                    <img
                        src={logo}
                        alt="KaushalSetuAI"
                        onClick={() => {
                            navigate(logoTarget);
                            setIsMobileNavOpen(false);
                        }}
                        style={{
                            height: 36,
                            width: 'auto',
                            objectFit: 'contain',
                            cursor: 'pointer',
                            flexShrink: 0,
                        }}
                        className="logo-img"
                    />

                    {/* ── DESKTOP LINKS ── */}
                    <div
                        className="desktop-links"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            flex: 1,
                            justifyContent: 'center',
                        }}
                    >
                        {mainLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                style={({ isActive }) => ({
                                    position: 'relative',
                                    padding: '0.4rem 0.625rem',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.14em',
                                    textTransform: 'uppercase',
                                    textDecoration: 'none',
                                    color: isActive ? colors.primary : colors.textMain,
                                    opacity: isActive ? 1 : 0.55,
                                    transition: 'opacity 0.15s, color 0.15s',
                                    fontFamily: font.mono,
                                    whiteSpace: 'nowrap',
                                })}
                                className="nav-link"
                            >
                                {({ isActive }) => (
                                    <>
                                        {link.name}
                                        <span
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                height: 2,
                                                borderRadius: 2,
                                                backgroundColor: colors.secondary,
                                                width: isActive ? 14 : 0,
                                                transition: 'width 0.25s ease',
                                                display: 'block',
                                            }}
                                        />
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    {/* ── ACTIONS ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="nav-icon-btn"
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: radius.sm,
                                border: `1px solid ${colors.border}`,
                                backgroundColor: colors.bgMuted,
                                color: colors.textSub,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                flexShrink: 0,
                                transition: transition.fast,
                            }}
                        >
                            {user?.theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                        </button>

                        {user ? (
                            <div style={{ position: 'relative' }} ref={menuRef}>
                                {/* Avatar */}
                                <button
                                    onClick={() => setIsMenuOpen((v) => !v)}
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: '50%',
                                        border: `2px solid ${colors.border}`,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        background: 'none',
                                        padding: 0,
                                        flexShrink: 0,
                                        transition: transition.fast,
                                    }}
                                    className="avatar-btn"
                                >
                                    <img
                                        src={user.avatar?.url || avatar}
                                        alt="Profile"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block',
                                        }}
                                    />
                                </button>

                                {/* Dropdown */}
                                {isMenuOpen && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            right: 0,
                                            top: 'calc(100% + 8px)',
                                            width: 220,
                                            borderRadius: radius.lg,
                                            backgroundColor: colors.bgCard,
                                            border: `1px solid ${colors.border}`,
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                            overflow: 'hidden',
                                            animation: 'fadeUp 0.2s ease',
                                            zIndex: 60,
                                        }}
                                    >
                                        {/* User info */}
                                        <div
                                            style={{
                                                padding: '0.875rem 1rem',
                                                borderBottom: `1px solid ${colors.border}`,
                                            }}
                                        >
                                            <p
                                                style={{
                                                    fontSize: '0.6rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.14em',
                                                    color: colors.textSub,
                                                    fontFamily: font.mono,
                                                    margin: 0,
                                                    marginBottom: 3,
                                                }}
                                            >
                                                Signed in as
                                            </p>
                                            <p
                                                style={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    color: colors.primary,
                                                    margin: 0,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {user.name || user.email}
                                            </p>
                                        </div>

                                        {/* Links */}
                                        <div style={{ padding: '0.25rem 0' }}>
                                            <DropdownLink
                                                onClick={() => {
                                                    navigate('/profile');
                                                    setIsMenuOpen(false);
                                                }}
                                                icon={<User size={13} />}
                                                label="My Profile"
                                                colors={colors}
                                                font={font}
                                                radius={radius}
                                            />
                                            {user.role === 'student' && (
                                                <>
                                                    <DropdownLink
                                                        onClick={() => {
                                                            navigate('/complete_roadmap');
                                                            setIsMenuOpen(false);
                                                        }}
                                                        icon={<CheckCircle size={13} />}
                                                        label="Completed Roadmaps"
                                                        colors={colors}
                                                        font={font}
                                                        radius={radius}
                                                    />
                                                    <DropdownLink //past_interviews
                                                        onClick={() => {
                                                            navigate('/past_assessment');
                                                            setIsMenuOpen(false);
                                                        }}
                                                        icon={<CheckCircle size={13} />}
                                                        label="Past Assessments"
                                                        colors={colors}
                                                        font={font}
                                                        radius={radius}
                                                    />
                                                    <DropdownLink
                                                        onClick={() => {
                                                            navigate('/past_interviews');
                                                            setIsMenuOpen(false);
                                                        }}
                                                        icon={<CheckCircle size={13} />}
                                                        label="Past Interviews"
                                                        colors={colors}
                                                        font={font}
                                                        radius={radius}
                                                    />
                                                </>
                                            )}
                                            <DropdownLink
                                                onClick={() => {
                                                    navigate('/contact');
                                                    setIsMenuOpen(false);
                                                }}
                                                icon={<Phone size={13} />}
                                                label="Contact Us"
                                                colors={colors}
                                                font={font}
                                                radius={radius}
                                            />
                                        </div>

                                        <div
                                            style={{ height: 1, backgroundColor: colors.border }}
                                        />

                                        {/* Logout */}
                                        <button
                                            onClick={logout}
                                            className="logout-btn"
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                padding: '0.75rem 1rem',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: colors.danger,
                                                fontSize: '0.65rem',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                fontFamily: font.mono,
                                                transition: transition.fast,
                                            }}
                                        >
                                            <LogOut size={13} /> Log Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="cta-btn"
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: radius.md,
                                    backgroundColor: colors.primary,
                                    color: '#ffffff',
                                    border: 'none',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    cursor: 'pointer',
                                    transition: transition.fast,
                                    fontFamily: font.mono,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Get Started
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* ── MOBILE DRAWER ── */}
            {isMobileNavOpen && (
                <div
                    className="mobile-only"
                    style={{
                        position: 'fixed',
                        top: 60,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: colors.bgPage,
                        zIndex: 40,
                        overflowY: 'auto',
                        padding: '1.25rem',
                        animation: 'fadeUp 0.2s ease',
                        fontFamily: font.body,
                    }}
                >
                    {/* Nav links */}
                    <p
                        style={{
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.18em',
                            color: colors.textSub,
                            fontFamily: font.mono,
                            marginBottom: '0.625rem',
                        }}
                    >
                        Navigation
                    </p>
                    <div
                        style={{ display: 'flex', flexDirection: 'column', marginBottom: '1.5rem' }}
                    >
                        {mainLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileNavOpen(false)}
                                style={({ isActive }) => ({
                                    padding: '0.875rem 0',
                                    borderBottom: `1px solid ${colors.border}`,
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    textDecoration: 'none',
                                    color: isActive ? colors.primary : colors.textMain,
                                    fontFamily: font.mono,
                                })}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* Account section */}
                    {user && (
                        <>
                            <p
                                style={{
                                    fontSize: '0.6rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.18em',
                                    color: colors.textSub,
                                    fontFamily: font.mono,
                                    marginBottom: '0.625rem',
                                }}
                            >
                                Account
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <MobileLink
                                    onClick={() => {
                                        navigate('/profile');
                                        setIsMobileNavOpen(false);
                                    }}
                                    icon={<User size={15} />}
                                    label="My Profile"
                                    colors={colors}
                                    font={font}
                                />
                                {user.role === 'student' && (
                                    <>
                                        <MobileLink
                                            onClick={() => {
                                                navigate('/complete_roadmap');
                                                setIsMobileNavOpen(false);
                                            }}
                                            icon={<CheckCircle size={15} />}
                                            label="Completed Roadmaps"
                                            colors={colors}
                                            font={font}
                                        />
                                        <MobileLink
                                            onClick={() => {
                                                navigate('/past_assessment');
                                                setIsMobileNavOpen(false);
                                            }}
                                            icon={<CheckCircle size={15} />}
                                            label="Past Assessments"
                                            colors={colors}
                                            font={font}
                                        />
                                        <MobileLink
                                            onClick={() => {
                                                navigate('/past_interview');
                                                setIsMobileNavOpen(false);
                                            }}
                                            icon={<CheckCircle size={15} />}
                                            label="Past Interviews"
                                            colors={colors}
                                            font={font}
                                        />
                                    </>
                                )}
                                <MobileLink
                                    onClick={() => {
                                        navigate('/contact');
                                        setIsMobileNavOpen(false);
                                    }}
                                    icon={<Phone size={15} />}
                                    label="Contact Support"
                                    colors={colors}
                                    font={font}
                                />

                                <button
                                    onClick={logout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '0.875rem 0',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: colors.danger,
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        fontFamily: font.mono,
                                        marginTop: 4,
                                    }}
                                >
                                    <LogOut size={15} /> Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}

/* ── DROPDOWN LINK ── */
const DropdownLink = ({ onClick, icon, label, colors, font, radius }) => (
    <button
        onClick={onClick}
        className="dropdown-link"
        style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0.625rem 1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: colors.textMain,
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: font.mono,
            transition: 'background-color 0.12s',
        }}
    >
        <span style={{ color: colors.textSub, flexShrink: 0 }}>{icon}</span>
        {label}
    </button>
);

/* ── MOBILE LINK ── */
const MobileLink = ({ onClick, icon, label, colors, font }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0.875rem 0',
            background: 'none',
            border: 'none',
            borderBottom: `1px solid ${colors.border}`,
            cursor: 'pointer',
            color: colors.textMain,
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: font.mono,
            width: '100%',
            textAlign: 'left',
        }}
    >
        <span style={{ color: colors.primary, flexShrink: 0 }}>{icon}</span>
        {label}
    </button>
);

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors, font }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { padding-top: 60px; }
        .nav-link:hover   { opacity: 1 !important; }
        .nav-icon-btn:hover { background-color: ${colors.bgHover} !important; }
        .avatar-btn:hover   { border-color: ${colors.primary} !important; }
        .dropdown-link:hover { background-color: ${colors.bgHover} !important; }
        .logout-btn:hover   { background-color: ${colors.dangerBg} !important; }
        .cta-btn:hover      { opacity: 0.88 !important; }
        .logo-img:hover     { opacity: 0.85; }
        @media (max-width: 768px) {
            .desktop-links { display: none !important; }
            .mobile-only   { display: flex !important; }
        }
        @media (min-width: 769px) {
            .mobile-only { display: none !important; }
        }
    `}</style>
);

export default Navbar;
