import React, { useContext, useEffect, useState } from 'react';
import { Users, ShieldCheck, ShieldAlert, Mail, Search, User as UserIcon } from 'lucide-react';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';


const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const {user} =  useContext(AuthContext)
    const { colors } = getThemeColors(user?.theme || 'light');

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/admin/users');
            // Assuming res.data.data is the array of users
            setUsers(res.data.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleBlacklist = async (userId) => {
        try {
            await axiosInstance.patch(`/admin/blacklist/${userId}`);
            // Re-fetch to sync UI with database
            await fetchData();
        } catch (error) {
            console.error('Toggle failed:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter users based on search
    const filteredUsers = users.filter(
        (u) =>
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div
                    className="w-10 h-10 border-2 rounded-full animate-spin"
                    style={{
                        borderColor: colors.primary,
                        borderTopColor: 'transparent',
                    }}
                ></div>
                <p
                    className="text-xs font-bold tracking-widest uppercase opacity-50"
                    style={{ color: colors.textMuted }}
                >
                    Loading Directory...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in space-y-8">
            {/* Header & Search Section - Clean & Decent */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div
                    className="relative pl-5 border-l-4"
                    style={{ borderColor: colors.secondary }}
                >
                    <h1
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: colors.textMain }}
                    >
                        User <span style={{ color: colors.primary }}>Management</span>
                    </h1>
                    <p
                        className="mt-1 text-sm font-medium"
                        style={{ color: colors.textMuted }}
                    >
                        Review and manage platform accessibility.
                    </p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"
                        size={16}
                        style={{color: colors.textMain}}
                    />
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border outline-none transition-all text-sm font-medium"
                        style={{
                            color: colors.textMain,
                            borderColor: colors.border,
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Users Table */}
            <div
                className=" rounded-3xl border shadow-sm overflow-hidden"
                style={{ borderColor: colors.border }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr
                                className="border-b"
                                style={{ borderColor: colors.border }}
                            >
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    User Details
                                </th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                    Status
                                </th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                                    Access Control
                                </th>
                            </tr>
                        </thead>
                        <tbody className="" >
                            {filteredUsers.map((u) => (
                                <tr
                                    key={u._id}
                                    className="group  transition-colors"
                                >
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden "
                                                style={{
                                                    backgroundColor: colors.textMuted,
                                                }}
                                            >
                                                {u.avatar?.url ? (
                                                    <img
                                                        src={u.avatar.url}
                                                        alt=""
                                                        className={`w-full h-full object-cover ${u.isBlacklisted ? 'grayscale opacity-50' : ''}`}
                                                    />
                                                ) : (
                                                    <UserIcon size={18}  className="opacity-30" />
                                                )}
                                            </div>
                                            <div>
                                                <p
                                                    className="font-bold text-sm"
                                                    style={{ color: colors.textMain }}
                                                >
                                                    {u.name || 'Anonymous User'}
                                                </p>
                                                <div style={{color: colors.textMain}} className="flex items-center gap-1.5 opacity-60">
                                                    <Mail size={12} />
                                                    <span className="text-xs font-medium tracking-tight">
                                                        {u.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-8 py-5 text-center">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                                                u.isBlacklisted
                                                    ? ' text-rose-600 border-rose-100'
                                                    : ' text-emerald-600 border-emerald-100'
                                            }`}
                                        >
                                            {u.isBlacklisted ? 'Suspended' : 'Active'}
                                        </span>
                                    </td>

                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => toggleBlacklist(u._id)}
                                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-sm ${
                                                u.isBlacklisted
                                                    ? 'bg-emerald-600 text-white hover:opacity-90'
                                                    : 'bg-rose-600 text-white hover:opacity-90'
                                            }`}
                                        >
                                            {u.isBlacklisted ? (
                                                <>
                                                    <ShieldCheck size={14} /> Unblock
                                                </>
                                            ) : (
                                                <>
                                                    <ShieldAlert size={14} /> Restrict
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center opacity-30">
                        <Users size={48} style={{color: colors.textMain}} className="mb-4" />
                        <p style={{color: colors.textMain}} className="text-xs font-bold uppercase tracking-[0.2em]">
                            No Users Found
                        </p>
                    </div>
                )}
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `,
                }}
            />
        </div>
    );
};

export default AllUsers;
