import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../axiosInstance';
import { toast } from 'sonner';
import assetLogo from '../assets/avatar.svg';
import { Pencil, Key, Save, X, Camera } from 'lucide-react';
import { getThemeColors } from '../theme';

const Profile = () => {
    const { user, fetchUser } = useContext(AuthContext);
    const { colors } = getThemeColors(user?.theme || 'light');

    // States for Password and UI
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassFields, setShowPassFields] = useState(false);

    // States for Editing Profile
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // Sync local input state when user data is available
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleUpdateProfile = async () => {
        if (!name || !email) return toast.error('Name and Email are required');

        try {
            await axiosInstance.put('/user/profile', { name });
            toast.success('Profile updated successfully!');
            if (fetchUser) await fetchUser(); // Refresh global context
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const changePassword = async () => {
        if (!currentPassword || !newPassword) return toast.error('Please fill all fields');
        try {
            await axiosInstance.put('/user/change-password', {
                currentPassword,
                newPassword,
            });
            toast.success('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setShowPassFields(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        const toastId = toast.loading('Uploading image...');
        setLoading(true);
        try {
            await axiosInstance.patch('/user/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (fetchUser) await fetchUser();
            toast.success('Profile picture updated!', { id: toastId });
        } catch (error) {
            toast.error('Upload failed', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div
                    className="animate-spin rounded-full h-10 w-10 border-t-2"
                    style={{ borderColor: colors.primary }}
                ></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div
                className="max-w-4xl mx-auto  rounded-3xl shadow-sm border overflow-hidden flex flex-col md:flex-row"
                style={{ borderColor: colors.border }}
            >
                {/* Left Side: Info & Actions */}
                <div className="flex-1 p-8 md:p-12 space-y-8">
                    <div className="space-y-6">
                        {isEditing ? (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="space-y-1">
                                    <label
                                        className="text-[10px] font-bold uppercase tracking-widest opacity-50"
                                        style={{ color: colors.textMain }}
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full text-xl font-bold p-3  border rounded-xl outline-none transition-all focus:border-blue-500"
                                        placeholder="Your Name"
                                        style={{ color: colors.textMain }}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleUpdateProfile}
                                        className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-all active:scale-95"
                                        style={{ backgroundColor: colors.primary }}
                                    >
                                        <Save size={14} /> Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-2.5  rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                                        style={{ color: colors.textMain }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <h1
                                    className="text-3xl md:text-4xl font-bold tracking-tight"
                                    style={{ color: colors.textMain }}
                                >
                                    {user?.name}
                                </h1>
                                <p
                                    className="text-base font-medium"
                                    style={{ color: colors.textMuted }}
                                >
                                    {user?.email}
                                </p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all hover:opacity-70"
                                    style={{ color: colors.primary }}
                                >
                                    <Pencil size={14} /> Edit Profile Info
                                </button>
                            </div>
                        )}
                    </div>

                    <div
                        className="space-y-4 pt-8 border-t"
                        style={{ borderColor: colors.border }}
                    >
                        <button
                            onClick={() => setShowPassFields(!showPassFields)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border shadow-sm"
                            style={{
                                color: colors.textMain,
                                
                                borderColor: colors.border,
                            }}
                        >
                            <Key size={14} /> {showPassFields ? 'Cancel Change' : 'Update Password'}
                        </button>

                        {showPassFields && (
                            <div
                                className="space-y-3 p-6  rounded-2xl border animate-in fade-in slide-in-from-top-4 duration-300"
                                style={{ borderColor: colors.border }}
                            >
                                <input
                                    type="password"
                                    value={currentPassword}
                                    style={{color: colors.textMain}}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border  outline-none focus:border-blue-500 transition-all text-sm"
                                    placeholder="Current Password"
                                />
                                <input
                                    type="password"
                                    value={newPassword}
                                    style={{color: colors.textMain}}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border  outline-none focus:border-blue-500 transition-all text-sm"
                                    placeholder="New Password"
                                />
                                <button
                                    onClick={changePassword}
                                    className="w-full py-3 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-95"
                                    style={{ backgroundColor: colors.primary }}
                                >
                                    Save New Password
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Profile Picture - Minimalist Style */}
                <div
                    className="w-full md:w-2/5 flex flex-col items-center justify-center p-12 border-l"
                    style={{
                        backgroundColor: colors.bgLight,
                        borderColor: colors.border,
                    }}
                >
                    <div className="relative group">
                        <div className="w-44 h-44 rounded-3xl overflow-hidden border-4 e shadow-lg">
                            <img
                                src={user?.avatar?.url || assetLogo}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <label
                            className="absolute -bottom-3 -right-3 p-3 rounded-2xl shadow-lg cursor-pointer transition-all active:scale-90 border-2  group"
                            style={{ backgroundColor: colors.primary }}
                        >
                            <Camera
                                size={18}
                                className="text-white transition-transform group-hover:rotate-12"
                            />
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={loading}
                            />
                        </label>
                    </div>
                    <p
                        className="mt-6 text-[10px] font-bold uppercase tracking-widest opacity-40"
                        style={{ color: colors.textMain }}
                    >
                        Update Photo
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
