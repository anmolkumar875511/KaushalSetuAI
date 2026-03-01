import React, { useContext, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getThemeColors } from '../theme';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Resetpassw = () => {
    const [newPassword, setPassword] = useState('');
    const [confpassword, setConfPassword] = useState('');
    const { token } = useParams();
    const {user} = useContext(AuthContext)
    const { colors } = getThemeColors(user?.theme || 'light');
    const navigate = useNavigate();

    const submithandler = async (e) => {
        e.preventDefault();
        if (newPassword === confpassword) {
            toast.promise(axiosInstance.post(`/user/reset-password/${token}`, { newPassword }), {
                loading: 'Processing...',
                success: () => {
                    setTimeout(() => {
                        navigate('/login');
                    }, 1500);

                    return 'Password changed successfully. Please login again.';
                },
                error: (err) => {
                    console.error(err);
                    return err?.response?.data?.message || 'Something went wrong';
                },
            });
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ backgroundColor: colors.bgLight }}
        >
            <div className="w-full max-w-100 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 z-10 animate-fade-in">
                <form className="space-y-6" onSubmit={submithandler}>
                    {/* Icon & Header - Clean & Centered */}
                    <div className="text-center space-y-2">
                        <div
                            className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-4"
                            style={{ backgroundColor: `${colors.primary}10` }}
                        >
                            <ShieldCheck size={24} style={{ color: colors.primary }} />
                        </div>

                        <h2
                            className="text-2xl font-bold tracking-tight"
                            style={{ color: colors.textMain }}
                        >
                            Reset Password
                        </h2>
                        <p
                            className="text-xs font-medium leading-relaxed opacity-60"
                            style={{ color: colors.textMuted }}
                        >
                            Secure your account with a{' '}
                            <span style={{ color: colors.secondary }}>new password</span>.
                        </p>
                    </div>

                    {/* Input Group */}
                    <div className="space-y-3">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New Password"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-sm"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                            <input
                                type="password"
                                value={confpassword}
                                onChange={(e) => setConfPassword(e.target.value)}
                                placeholder="Confirm New Password"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Action Button - Standardized */}
                    <button
                        type="submit"
                        className="w-full py-3 text-white font-bold rounded-xl transition-all shadow-sm hover:opacity-95 active:scale-[0.98] text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                        style={{ backgroundColor: colors.primary }}
                    >
                        Update Password
                        <ArrowRight size={16} />
                    </button>
                </form>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @keyframes fade-in { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
            `,
                }}
            />
        </div>
    );
};

export default Resetpassw;
