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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const menuRef = useRef(null);

    const { colors } = getThemeColors(user?.theme || 'light');

    const toggleTheme = async () => {
        if (!user) return toast.error("Please login to switch themes");
        const newTheme = user.theme === 'light' ? 'dark' : 'light';
        try {
            await axiosInstance.patch('/user/theme', { theme: newTheme });
            setUser({ ...user, theme: newTheme });
            toast.success(`Switched to ${newTheme} mode`);
        } catch (error) {
            toast.error("Failed to update theme preference");
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/user/logout');
        } catch (error) {
            console.warn('Logout handled locally:', error);
        } finally {
            setUser(null);
            setIsMenuOpen(false);
            setIsMobileNavOpen(false);
            navigate('/');
        }
    };

    // Shared Link Logic
    const mainLinks = [
        ...(user?.role === 'admin'
            ? [
                  { name: 'ADMIN PANEL', path: '/adminDashboard' },
                  { name: 'SYSTEM LOGS', path: '/logger' },
                  { name: 'ALL USERS', path: '/users' },
              ]
            : [
                  { name: user ? 'DASHBOARD' : 'HOME', path: user ? '/dashboard' : '/' },
                  { name: user ? 'RESUME' : 'DEVELOPER', path: user ? '/resume' : '/developer' },
                  ...(user ? [{ name: 'OPPORTUNITIES', path: '/opportunities' }] : []),
                  ...(!user ? [{ name: 'CONTACT US', path: '/contact' }] : []),
              ]),
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!colors) return null;

    return (
        <nav
            className="fixed top-0 left-0 right-0 w-full z-50 h-20 backdrop-blur-md border-b transition-all duration-300"
            style={{ 
                backgroundColor: `${colors.bgLight}E6`, 
                borderColor: colors.border 
            }}
        >
            <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
                
                {/* 1. Hamburger Toggle (Mobile Only) */}
                <div className="md:hidden flex-1">
                    <button 
                        onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                        className="p-2 -ml-2 transition-transform active:scale-90"
                        style={{ color: colors.textMain }}
                    >
                        {isMobileNavOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* 2. Logo */}
                <div className="flex-1 flex justify-center md:justify-start">
                    <img
                        className="h-9 md:h-11 w-auto cursor-pointer object-contain transition-transform active:scale-95"
                        onClick={() => {
                            navigate(user?.role === 'admin' ? '/adminDashboard' : user ? '/dashboard' : '/');
                            setIsMobileNavOpen(false);
                        }}
                        src={logo}
                        alt="KaushalSetuAI"
                    />
                </div>

                {/* 3. Main Links (Desktop Only) */}
                <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
                    {mainLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `relative px-4 py-2 text-[10px] font-bold tracking-[0.2em] transition-all duration-300
                                ${isActive ? '' : 'hover:opacity-100 opacity-60'}`
                            }
                            style={({ isActive }) => ({
                                color: isActive ? colors.primary : colors.textMain
                            })}
                        >
                            {({ isActive }) => (
                                <>
                                    {link.name}
                                    <span
                                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300
                                        ${isActive ? 'w-4' : 'w-0'}`}
                                        style={{ backgroundColor: colors.secondary }}
                                    />
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* 4. Actions (Theme & Profile) */}
                <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
                    <button 
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                        style={{ 
                            color: colors.textMuted,
                            backgroundColor: `${colors.textMuted}15` 
                        }}
                    >
                        {user?.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {user ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all hover:shadow-lg"
                                style={{ borderColor: colors.border }}
                            >
                                <img src={user.avatar?.url || avatar} alt="Profile" className="w-full h-full object-cover" />
                            </button>

                            {/* Profile Dropdown (Desktop) */}
                            {isMenuOpen && (
                                <div
                                    className="absolute right-0 mt-4 w-64 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-200"
                                    style={{ backgroundColor: colors.bgLight, borderColor: colors.border }}
                                >
                                    <div className="px-4 py-3 border-b mb-1" style={{ borderColor: `${colors.textMuted}20` }}>
                                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-60" style={{ color: colors.textMain }}>Signed in as</p>
                                        <p className="text-xs font-bold truncate" style={{ color: colors.primary }}>{user.name || user.email}</p>
                                    </div>
                                    <DropdownLink onClick={() => {navigate('/Profile'); setIsMenuOpen(false);}} icon={<User size={14} />} label="My Profile" colors={colors} />
                                    {user.role === 'student' && <DropdownLink onClick={() => {navigate('/complete_roadmap'); setIsMenuOpen(false);}} icon={<CheckCircle size={14} />} label="Roadmaps" colors={colors} />}
                                    <DropdownLink onClick={() => {navigate('/contact'); setIsMenuOpen(false);}} icon={<Phone size={14} />} label="Contact Us" colors={colors} />
                                    <div className="my-1 border-t opacity-10" style={{ borderColor: colors.textMain }} />
                                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors uppercase tracking-widest">
                                        <LogOut size={14} /> Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="px-5 py-2.5 rounded-xl font-bold text-[10px] text-white shadow-lg active:scale-95 transition-all"
                            style={{ backgroundColor: colors.primary }}
                        >
                            GET STARTED
                        </button>
                    )}
                </div>
            </div>

            {/* 5. Full Mobile Menu Drawer */}
            {isMobileNavOpen && (
                <div 
                    className="md:hidden absolute top-20 left-0 w-full h-screen animate-in slide-in-from-top duration-300 z-40"
                    style={{ backgroundColor: colors.bgLight }}
                >
                    <div className="flex flex-col p-6 gap-2">
                        <p className="text-[10px] font-black tracking-widest opacity-30 mb-2 uppercase" style={{ color: colors.textMain }}>Navigation</p>
                        {mainLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileNavOpen(false)}
                                className="py-4 border-b text-[11px] font-bold tracking-[0.2em] uppercase"
                                style={({ isActive }) => ({ 
                                    color: isActive ? colors.primary : colors.textMain,
                                    borderColor: `${colors.textMuted}10`
                                })}
                            >
                                {link.name}
                            </NavLink>
                        ))}

                        {/* Mobile Specific Profile Actions */}
                        {user && (
                            <>
                                <p className="text-[10px] font-black tracking-widest opacity-30 mt-6 mb-2 uppercase" style={{ color: colors.textMain }}>Account</p>
                                <MobileActionLink onClick={() => {navigate('/Profile'); setIsMobileNavOpen(false);}} icon={<User size={16} />} label="My Profile" colors={colors} />
                                {user.role === 'student' && <MobileActionLink onClick={() => {navigate('/complete_roadmap'); setIsMobileNavOpen(false);}} icon={<CheckCircle size={16} />} label="Completed Roadmaps" colors={colors} />}
                                <MobileActionLink onClick={() => {navigate('/contact'); setIsMobileNavOpen(false);}} icon={<Phone size={16} />} label="Contact Support" colors={colors} />
                                
                                <button onClick={logout} className="mt-4 flex items-center gap-4 py-4 px-2 text-rose-500 font-bold text-xs uppercase tracking-widest">
                                    <LogOut size={18} /> Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

// Helper for Profile links in Desktop Dropdown
const DropdownLink = ({ onClick, icon, label, colors }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-opacity-10 rounded-xl transition-all"
        style={{ color: colors.textMain, '--hover-bg': `${colors.primary}15` }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${colors.primary}15`}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
        <span className="opacity-40">{icon}</span>
        {label}
    </button>
);

// Helper for Profile links in Mobile Drawer
const MobileActionLink = ({ onClick, icon, label, colors }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-4 py-4 px-2 text-[11px] font-bold uppercase tracking-widest border-b"
        style={{ color: colors.textMain, borderColor: `${colors.textMuted}10` }}
    >
        <span style={{ color: colors.primary }}>{icon}</span>
        {label}
    </button>
);

export default Navbar;