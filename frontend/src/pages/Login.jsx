import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'sonner';
import { Mail, Lock, User, ShieldCheck, ArrowRight, Chrome } from 'lucide-react'; // Clean, modern icons
import { getThemeColors } from '../theme';

const Login = () => {
    const [state, setState] = useState('Login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // New Loading State
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const { fetchUser, user } = useContext(AuthContext);

    const { colors } = getThemeColors(user?.theme || 'light');

    // Google OAuth Handler
    const handleGoogleLogin = () => {
        // Manually set to 5000 to match your running server
        window.location.href = `https://skillbridge-server-zeta.vercel.app/api/v1/user/auth/google`;
    };
    useEffect(() => {
        // If the context updates and we have a user, leave this page immediately
        if (user) {
            if (user.role === 'student') {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/adminDashboard', { replace: true });
            }
        }
    }, [user, navigate]);

    useEffect(() => {
        let interval;
        if (state === 'Middle' && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [state, timer]);

    const resendotp = async () => {
        toast.promise(axiosInstance.post('/user/resend-otp', { email }), {
            loading: 'OTP Resending....',
            success: (res) => {
                setTimer(60);
                setCanResend(false);
                return 'OTP Resent Successfully';
            },
            error: (err) => {
                return 'Failed to resend OTP';
            },
        });
    };

    const verifyemail = async (e) => {
        e.preventDefault();
        toast.promise(axiosInstance.post('/user/verify-email', { email, otp }), {
            loading: 'Verifying Credential...',
            success: (res) => {
                fetchUser();
                navigate(`/dashboard`);
                setState('login');
                return 'Verification Successful';
            },
            error: (err) => {
                return 'Invalid OTP';
            },
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Processing...');
        try {
            if (state === 'Sign Up') {
                await axiosInstance.post('/user/register', { name, email, password });
                setState('Middle');
                toast.success('OTP Sent To your Email', { id: toastId });
            } else {
                const response = await axiosInstance.post(
                    '/user/login',
                    { email, password },
                    { withCredentials: true }
                );
                const loggedInuser = response.data.data.user;
                await fetchUser();
                toast.success('Login Successfully', { id: toastId, duration: 1000 });

                if (loggedInuser.role === 'student') {
                    navigate(`/dashboard`);
                } else {
                    navigate('/adminDashboard');
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Something Went Wrong', {
                id: toastId,
            });
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 px-4 mt-[-12]"
            style={{ backgroundColor: colors.bgLight }}
        >
            <div className="w-full max-w-100 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 z-10 -mt-8 md:-mt-16 lg:-mt-20">
                {state !== 'Middle' ? (
                    <form onSubmit={submitHandler} className="space-y-5">
                        <div className="text-center space-y-1">
                            <h2
                                className="text-2xl font-bold tracking-tight"
                                style={{ color: colors.textMain }}
                            >
                                {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
                            </h2>
                            <p
                                className="text-[10px] font-bold uppercase tracking-widest opacity-50"
                                style={{ color: colors.textMuted }}
                            >
                                {state === 'Sign Up'
                                    ? 'Bridge to your success'
                                    : 'Access your dashboard'}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {state === 'Sign Up' && (
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Full Name"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-sm"
                                        required
                                    />
                                </div>
                            )}

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

                            <div className="space-y-1">
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-sm"
                                        required
                                    />
                                </div>
                                {state === 'Login' && (
                                    <div className="flex justify-end">
                                        <span
                                            onClick={() => navigate('/forgetpassword')}
                                            className="text-[11px] font-bold cursor-pointer hover:underline opacity-70 transition-opacity"
                                            style={{ color: colors.primary }}
                                        >
                                            Forgot Password?
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 text-white font-bold rounded-xl transition-all shadow-sm hover:opacity-95 active:scale-[0.98] text-sm uppercase tracking-wider"
                            style={{ backgroundColor: colors.primary }}
                        >
                            {state === 'Sign Up' ? 'Get Started' : 'Login Now'}
                        </button>

                        <div className="space-y-3">
                            <div className="relative flex items-center justify-center py-1">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-100"></span>
                                </div>
                                <span className="relative px-3 text-[9px] font-bold text-slate-400 bg-white uppercase tracking-widest">
                                    or
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl transition-all hover:bg-slate-50 flex items-center justify-center gap-3 text-xs shadow-sm"
                            >
                                <img
                                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                    alt="Google"
                                    className="w-4 h-4"
                                />
                                CONTINUE WITH GOOGLE
                            </button>
                        </div>

                        <div className="text-center pt-1">
                            <p
                                className="text-xs font-medium"
                                style={{ color: colors.textMuted }}
                            >
                                {state === 'Sign Up' ? 'Already a member?' : 'New to the platform?'}
                                <span
                                    onClick={() =>
                                        setState(state === 'Sign Up' ? 'Login' : 'Sign Up')
                                    }
                                    className="ml-2 font-bold cursor-pointer hover:underline"
                                    style={{ color: colors.secondary }}
                                >
                                    {state === 'Sign Up' ? 'Login' : 'Sign Up'}
                                </span>
                            </p>
                        </div>
                    </form>
                ) : (
                    /* ... OTP code same as before ... */
                    /* VERIFICATION (MIDDLE) STATE */
                    <form onSubmit={verifyemail} className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center bg-blue-50">
                                <ShieldCheck
                                    className="w-6 h-6"
                                    style={{ color: colors.primary }}
                                />
                            </div>
                            <h2
                                className="text-2xl font-bold"
                                style={{ color: colors.textMain }}
                            >
                                Verify Email
                            </h2>
                            <p className="text-xs" style={{ color: colors.textMuted }}>
                                Enter the 6-digit code sent to your inbox
                            </p>
                        </div>

                        <input
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="000 000"
                            className="w-full py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-center text-3xl font-bold tracking-[0.4rem]"
                            style={{ color: colors.primary }}
                            required
                        />

                        <button
                            type="submit"
                            className="w-full py-3 text-white font-bold rounded-xl shadow-sm uppercase tracking-wider text-sm"
                            style={{ backgroundColor: colors.secondary }}
                        >
                            Complete Registration
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={resendotp}
                                disabled={!canResend}
                                className="text-[10px] font-bold uppercase tracking-widest transition-all opacity-60 hover:opacity-100"
                                style={{ color: colors.primary }}
                            >
                                {timer > 0 ? `Resend available in ${timer}s` : 'Resend OTP'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
