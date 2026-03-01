import React, { useContext, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const Forgetpassw = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const {user} = useContext(AuthContext)
    const { colors } = getThemeColors(user?.theme || 'light');
    const submithandler = async (e) => {
        e.preventDefault();
        toast.promise(axiosInstance.post('/user/forgot-password', { email }), {
            loading: 'Checking Crendentials...',
            success: (res) => {
                return 'Reset Password Link Sent To Your Email';
            },
            error: (err) => {
                return 'Error Occured';
            },
        });
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ backgroundColor: colors.bgLight }}
        >
            <div className="w-full max-w-100  rounded-3xl p-8 shadow-sm border border-slate-100 z-10 animate-fade-in">
                <form onSubmit={submithandler} className="space-y-6">
                    {/* Icon & Header - Professional & Centered */}
                    <div className="text-center space-y-2">
                        <div
                            className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-4"
                            style={{ backgroundColor: `${colors.primary}10` }}
                        >
                            <KeyRound size={24} style={{ color: colors.primary }} />
                        </div>

                        <h2
                            className="text-2xl font-bold tracking-tight"
                            style={{ color: colors.textMain }}
                        >
                            Forgot Password?
                        </h2>
                        <p
                            className="text-xs font-medium leading-relaxed opacity-60"
                            style={{ color: colors.textMuted }}
                        >
                            Enter your registered email and we’ll send you a recovery link.
                        </p>
                    </div>

                    {/* Input Field - Standardized with Icon */}
                    <div className="space-y-1.5">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Action Button - Matching Login Style */}
                    <div className="space-y-4">
                        <button
                            type="submit"
                            className="w-full py-3 text-white font-bold rounded-xl transition-all shadow-sm hover:opacity-95 active:scale-[0.98] text-sm uppercase tracking-wider"
                            style={{ backgroundColor: colors.primary }}
                        >
                            Send Reset Link
                        </button>

                        {/* Back to Login link */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/Login')}
                                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                                style={{ color: colors.secondary }}
                            >
                                <ArrowLeft size={14} /> Back to Login
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
        @keyframes fade-in { 
            from { opacity: 0; transform: translateY(10px); } 
            to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `,
                }}
            />
        </div>
    );
};

export default Forgetpassw;
