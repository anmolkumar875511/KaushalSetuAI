import React, { useContext, useEffect, useState } from 'react';
import { Users, ShieldCheck, ShieldAlert, Mail, Search, User as UserIcon } from 'lucide-react';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/admin/users');
            setUsers(res.data.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleBlacklist = async (userId) => {
        try {
            await axiosInstance.patch(`/admin/blacklist/${userId}`);
            await fetchData();
        } catch (err) {
            console.error('Toggle failed:', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredUsers = users.filter(
        (u) =>
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /* ── Loading ── */
    if (loading && users.length === 0) {
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
                <GlobalStyles colors={colors} />
                <p
                    style={{
                        color: colors.textSub,
                        fontSize: '0.7rem',
                        fontFamily: font.mono,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                    }}
                >
                    Loading…
                </p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bgPage, fontFamily: font.body }}>
            <GlobalStyles colors={colors} />

            <div
                style={{
                    maxWidth: 1080,
                    margin: '0 auto',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem',
                }}
            >
                {/* ── HEADER ── */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        marginBottom: '1.75rem',
                        animation: 'fadeUp 0.3s ease',
                    }}
                >
                    <div>
                        <p
                            style={{
                                fontSize: 10,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                color: colors.textSub,
                                fontFamily: font.mono,
                                marginBottom: 4,
                            }}
                        >
                            Admin · Users
                        </p>
                        <h1
                            style={{
                                fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                                fontWeight: 700,
                                color: colors.textOnBg,
                                fontFamily: font.display,
                                margin: 0,
                            }}
                        >
                            User Management
                        </h1>
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', width: 'min(100%, 280px)' }}>
                        <Search
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
                            type="text"
                            placeholder="Search name or email…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.6rem 0.875rem 0.6rem 2.25rem',
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.md,
                                backgroundColor: colors.bgMuted,
                                color: colors.textMain,
                                fontSize: '0.8rem',
                                outline: 'none',
                                fontFamily: font.body,
                                boxSizing: 'border-box',
                                transition: transition.fast,
                            }}
                        />
                    </div>
                </div>

                {/* ── TABLE ── */}
                <div
                    style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.lg,
                        backgroundColor: colors.bgCard,
                        overflow: 'hidden',
                        boxShadow: shadow.sm,
                    }}
                >
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                                    {['User', 'Status', 'Access'].map((h, i) => (
                                        <th
                                            key={h}
                                            style={{
                                                padding: '0.75rem 1.25rem',
                                                fontSize: '0.6rem',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.16em',
                                                color: colors.textSub,
                                                fontFamily: font.mono,
                                                textAlign:
                                                    i === 0 ? 'left' : i === 1 ? 'center' : 'right',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u, i) => (
                                    <tr
                                        key={u._id}
                                        className="user-row"
                                        style={{
                                            borderTop: `1px solid ${colors.border}`,
                                            animation: `fadeUp 0.25s ease ${i * 0.025}s both`,
                                        }}
                                    >
                                        {/* User details */}
                                        <td style={{ padding: '0.875rem 1.25rem' }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                }}
                                            >
                                                {/* Avatar */}
                                                <div
                                                    style={{
                                                        width: 34,
                                                        height: 34,
                                                        borderRadius: radius.sm,
                                                        backgroundColor: colors.bgMuted,
                                                        border: `1px solid ${colors.border}`,
                                                        overflow: 'hidden',
                                                        flexShrink: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    {u.avatar?.url ? (
                                                        <img
                                                            src={u.avatar.url}
                                                            alt=""
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                filter: u.isBlacklisted
                                                                    ? 'grayscale(1) opacity(0.5)'
                                                                    : 'none',
                                                            }}
                                                        />
                                                    ) : (
                                                        <UserIcon
                                                            size={15}
                                                            style={{ color: colors.textSub }}
                                                        />
                                                    )}
                                                </div>

                                                <div>
                                                    <p
                                                        style={{
                                                            fontSize: '0.825rem',
                                                            fontWeight: 600,
                                                            color: colors.textMain,
                                                            margin: 0,
                                                            marginBottom: 2,
                                                        }}
                                                    >
                                                        {u.name || 'Anonymous User'}
                                                    </p>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 4,
                                                            color: colors.textSub,
                                                        }}
                                                    >
                                                        <Mail size={11} />
                                                        <span
                                                            style={{
                                                                fontSize: '0.72rem',
                                                                fontFamily: font.mono,
                                                            }}
                                                        >
                                                            {u.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status badge */}
                                        <td
                                            style={{
                                                padding: '0.875rem 1.25rem',
                                                textAlign: 'center',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 5,
                                                    padding: '0.25rem 0.625rem',
                                                    borderRadius: radius.sm,
                                                    fontSize: '0.6rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                    fontFamily: font.mono,
                                                    backgroundColor: u.isBlacklisted
                                                        ? colors.dangerBg
                                                        : colors.successBg,
                                                    color: u.isBlacklisted
                                                        ? colors.danger
                                                        : colors.success,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        width: 5,
                                                        height: 5,
                                                        borderRadius: '50%',
                                                        backgroundColor: u.isBlacklisted
                                                            ? colors.danger
                                                            : colors.success,
                                                        display: 'inline-block',
                                                    }}
                                                />
                                                {u.isBlacklisted ? 'Suspended' : 'Active'}
                                            </span>
                                        </td>

                                        {/* Action button */}
                                        <td
                                            style={{
                                                padding: '0.875rem 1.25rem',
                                                textAlign: 'right',
                                            }}
                                        >
                                            <button
                                                onClick={() => toggleBlacklist(u._id)}
                                                className="access-btn"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    padding: '0.45rem 0.875rem',
                                                    border: 'none',
                                                    borderRadius: radius.sm,
                                                    fontSize: '0.65rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                    cursor: 'pointer',
                                                    fontFamily: font.mono,
                                                    backgroundColor: u.isBlacklisted
                                                        ? colors.successBg
                                                        : colors.dangerBg,
                                                    color: u.isBlacklisted
                                                        ? colors.success
                                                        : colors.danger,
                                                    transition: transition.fast,
                                                }}
                                            >
                                                {u.isBlacklisted ? (
                                                    <>
                                                        <ShieldCheck size={11} /> Unblock
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldAlert size={11} /> Restrict
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty state */}
                    {filteredUsers.length === 0 && (
                        <div
                            style={{
                                padding: '3rem 1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.75rem',
                            }}
                        >
                            <Users size={32} style={{ color: colors.textMuted }} />
                            <p
                                style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.16em',
                                    color: colors.textMuted,
                                    fontFamily: font.mono,
                                }}
                            >
                                No Users Found
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer count */}
                {filteredUsers.length > 0 && (
                    <p
                        style={{
                            marginTop: '0.875rem',
                            fontSize: '0.7rem',
                            color: colors.textSub,
                            fontFamily: font.mono,
                            letterSpacing: '0.06em',
                        }}
                    >
                        {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                        {searchTerm && ` matching "${searchTerm}"`}
                    </p>
                )}
            </div>
        </div>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: ${colors.textMuted}; }
        input:focus { border-color: ${colors.borderFocus} !important; box-shadow: 0 0 0 3px ${colors.primary}18 !important; }
        .user-row:hover { background-color: ${colors.bgHover} !important; }
        .access-btn:hover { filter: brightness(1.06); }
        @media (max-width: 480px) { input { font-size: 16px !important; } }
    `}</style>
);

export default AllUsers;
