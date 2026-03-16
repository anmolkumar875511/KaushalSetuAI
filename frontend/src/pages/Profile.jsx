import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../axiosInstance';
import { toast } from 'sonner';
import assetLogo from '../assets/avatar.svg';
import { Pencil, Key, Save, Camera, Loader2, ChevronDown } from 'lucide-react';
import { getThemeColors } from '../theme';

const INTEREST_CATEGORIES = [
    'tech',
    'medical',
    'law',
    'management',
    'design',
    'finance',
    'education',
    'other',
];

const Profile = () => {
    const { user, fetchUser } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassFields, setShowPassFields] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [interestName, setInterestName] = useState('');
    const [interestCategory, setInterestCategory] = useState('');
    const [interestLoading, setInterestLoading] = useState(false);

    useEffect(() => {
        if (user) setName(user.name || '');
    }, [user]);

    /* ── Handlers ── */
    const handleUpdateProfile = async () => {
        if (!name) return toast.error('Name is required');
        try {
            await axiosInstance.put('/user/profile', { name });
            toast.success('Profile updated');
            await fetchUser?.();
            setIsEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const changePassword = async () => {
        if (!currentPassword || !newPassword) return toast.error('Please fill all fields');
        try {
            await axiosInstance.put('/user/change-password', { currentPassword, newPassword });
            toast.success('Password updated');
            setCurrentPassword('');
            setNewPassword('');
            setShowPassFields(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update password');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('avatar', file);
        const toastId = toast.loading('Uploading…');
        setLoading(true);
        try {
            await axiosInstance.patch('/user/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await fetchUser?.();
            toast.success('Photo updated', { id: toastId });
        } catch {
            toast.error('Upload failed', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const toggleInterest = async (name, category = 'other') => {
        try {
            setInterestLoading(true);
            await axiosInstance.patch('/user/interests', { name, category });
            toast.success('Interest updated');
            await fetchUser?.();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally {
            setInterestLoading(false);
        }
    };

    const handleAddInterest = async () => {
        if (!interestName) return toast.error('Enter interest name');
        await toggleInterest(interestName, interestCategory || 'General');
        setInterestName('');
        setInterestCategory('');
    };

    /* ── Loading guard ── */
    if (!user) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: colors.bgPage,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: font.body,
                }}
            >
                <GlobalStyles colors={colors} font={font} />
                <Loader2
                    size={18}
                    style={{ color: colors.textSub, animation: 'spin 1s linear infinite' }}
                />
            </div>
        );
    }

    /* ── Shared ── */
    const labelStyle = {
        fontSize: 10,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        margin: 0,
        marginBottom: 5,
    };
    const inputStyle = {
        width: '100%',
        padding: '0.65rem 0.875rem',
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
    const sectionDivider = {
        paddingTop: '1.25rem',
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} font={font} />

            <div
                style={{
                    maxWidth: 860,
                    margin: '0 auto',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem',
                }}
            >
                <div
                    style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.xl,
                        backgroundColor: colors.bgCard,
                        overflow: 'hidden',
                        display: 'flex',
                        flexWrap: 'wrap',
                        boxShadow: shadow.sm,
                    }}
                >
                    {/* ══ LEFT ══ */}
                    <div
                        style={{
                            flex: '1 1 300px',
                            padding: 'clamp(1.5rem, 4vw, 2rem)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                        }}
                    >
                        {/* ── NAME / EDIT ── */}
                        {isEditing ? (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem',
                                    animation: 'fadeUp 0.2s ease',
                                }}
                            >
                                <div>
                                    <p style={labelStyle}>Full Name</p>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your name"
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={handleUpdateProfile}
                                        className="primary-btn"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            padding: '0.55rem 1rem',
                                            backgroundColor: colors.primary,
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: radius.md,
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            cursor: 'pointer',
                                            fontFamily: font.mono,
                                        }}
                                    >
                                        <Save size={12} /> Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="ghost-btn"
                                        style={{
                                            padding: '0.55rem 1rem',
                                            backgroundColor: colors.bgMuted,
                                            color: colors.textMain,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: radius.md,
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            fontFamily: font.mono,
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h1
                                    style={{
                                        fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
                                        fontWeight: 700,
                                        color: colors.textOnBg,
                                        fontFamily: font.display,
                                        margin: 0,
                                        marginBottom: 4,
                                    }}
                                >
                                    {user.name}
                                </h1>
                                <p
                                    style={{
                                        fontSize: '0.825rem',
                                        color: colors.textSub,
                                        margin: 0,
                                        marginBottom: 10,
                                    }}
                                >
                                    {user.email}
                                </p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-link"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        color: colors.primary,
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontFamily: font.mono,
                                        padding: 0,
                                    }}
                                >
                                    <Pencil size={11} /> Edit Profile
                                </button>
                            </div>
                        )}

                        {/* ── INTERESTS ── */}
                        <div style={sectionDivider}>
                            <p style={{ ...labelStyle, marginBottom: 0 }}>Areas of Interest</p>

                            {/* Existing tags */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                {!user.areaOfInterest?.length ? (
                                    <p style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                                        No interests added yet
                                    </p>
                                ) : (
                                    user.areaOfInterest.map((item, i) => (
                                        <button
                                            key={i}
                                            disabled={interestLoading}
                                            onClick={() => toggleInterest(item.name, item.category)}
                                            className="interest-tag"
                                            style={{
                                                padding: '0.25rem 0.625rem',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: radius.full,
                                                backgroundColor: colors.bgMuted,
                                                color: colors.textMain,
                                                fontSize: '0.72rem',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                fontFamily: font.body,
                                                transition: transition.fast,
                                            }}
                                        >
                                            {item.name}
                                            <span style={{ color: colors.textSub, marginLeft: 4 }}>
                                                ({item.category})
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Add interest */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <input
                                    type="text"
                                    value={interestName}
                                    onChange={(e) => setInterestName(e.target.value)}
                                    placeholder="New interest"
                                    style={{ ...inputStyle, flex: '1 1 100px', width: 'auto' }}
                                />
                                <div style={{ position: 'relative', flex: '1 1 100px' }}>
                                    <select
                                        value={interestCategory}
                                        onChange={(e) => setInterestCategory(e.target.value)}
                                        style={{
                                            ...inputStyle,
                                            width: '100%',
                                            appearance: 'none',
                                            paddingRight: '1.75rem',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <option value="">Category</option>
                                        {INTEREST_CATEGORIES.map((c) => (
                                            <option key={c} value={c}>
                                                {c.charAt(0).toUpperCase() + c.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={11}
                                        style={{
                                            position: 'absolute',
                                            right: '0.625rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: colors.textSub,
                                            pointerEvents: 'none',
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={handleAddInterest}
                                    disabled={interestLoading}
                                    className="primary-btn"
                                    style={{
                                        padding: '0.65rem 0.875rem',
                                        backgroundColor: colors.primary,
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: radius.md,
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        cursor: interestLoading ? 'not-allowed' : 'pointer',
                                        opacity: interestLoading ? 0.6 : 1,
                                        fontFamily: font.mono,
                                    }}
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* ── PASSWORD ── */}
                        <div style={sectionDivider}>
                            <button
                                onClick={() => setShowPassFields((v) => !v)}
                                className="ghost-btn"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 7,
                                    padding: '0.6rem 1rem',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.md,
                                    backgroundColor: colors.bgMuted,
                                    color: colors.textMain,
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    cursor: 'pointer',
                                    fontFamily: font.mono,
                                    alignSelf: 'flex-start',
                                    transition: transition.fast,
                                }}
                            >
                                <Key size={12} /> {showPassFields ? 'Cancel' : 'Update Password'}
                            </button>

                            {showPassFields && (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem',
                                        padding: '1rem',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: radius.lg,
                                        backgroundColor: colors.bgMuted,
                                        animation: 'fadeUp 0.2s ease',
                                    }}
                                >
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Current password"
                                        style={inputStyle}
                                    />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="New password"
                                        style={inputStyle}
                                    />
                                    <button
                                        onClick={changePassword}
                                        className="primary-btn"
                                        style={{
                                            padding: '0.65rem',
                                            backgroundColor: colors.primary,
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: radius.md,
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            cursor: 'pointer',
                                            fontFamily: font.mono,
                                            transition: transition.fast,
                                        }}
                                    >
                                        Save New Password
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ══ RIGHT: AVATAR ══ */}
                    <div
                        style={{
                            flex: '0 0 220px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem 1.5rem',
                            borderLeft: `1px solid ${colors.border}`,
                            backgroundColor: colors.bgMuted,
                            gap: '0.75rem',
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <div
                                style={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: radius.lg,
                                    overflow: 'hidden',
                                    border: `2px solid ${colors.border}`,
                                    boxShadow: shadow.sm,
                                }}
                            >
                                <img
                                    src={user.avatar?.url || assetLogo}
                                    alt="Profile"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block',
                                    }}
                                />
                            </div>
                            <label
                                className="avatar-upload"
                                style={{
                                    position: 'absolute',
                                    bottom: -8,
                                    right: -8,
                                    width: 32,
                                    height: 32,
                                    borderRadius: radius.sm,
                                    backgroundColor: colors.primary,
                                    border: `2px solid ${colors.bgCard}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: shadow.sm,
                                    transition: transition.fast,
                                }}
                            >
                                {loading ? (
                                    <Loader2
                                        size={13}
                                        style={{
                                            color: '#fff',
                                            animation: 'spin 1s linear infinite',
                                        }}
                                    />
                                ) : (
                                    <Camera size={13} style={{ color: '#fff' }} />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleImageUpload}
                                    disabled={loading}
                                />
                            </label>
                        </div>
                        <p
                            style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.16em',
                                color: colors.textSub,
                                fontFamily: font.mono,
                                opacity: 0.7,
                            }}
                        >
                            Update Photo
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors, font }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder, textarea::placeholder { color: ${colors.textMuted}; }
        input:focus, select:focus { border-color: ${colors.borderFocus} !important; box-shadow: 0 0 0 3px ${colors.primary}18 !important; }
        .primary-btn:hover:not(:disabled) { opacity: 0.88 !important; }
        .ghost-btn:hover   { background-color: ${colors.bgHover} !important; }
        .inline-link:hover { opacity: 0.7; }
        .interest-tag:hover:not(:disabled) { border-color: ${colors.primary} !important; color: ${colors.primary} !important; }
        .avatar-upload:hover { opacity: 0.88 !important; }
        @media (max-width: 480px) { input, select { font-size: 16px !important; } }
        @media (max-width: 600px) {
            .profile-right { border-left: none !important; border-top: 1px solid ${colors.border} !important; flex: 1 1 100% !important; }
        }
    `}</style>
);

export default Profile;
