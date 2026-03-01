import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getThemeColors } from '../theme';
import { AuthContext } from '../context/AuthContext';


const Banner = () => {
    const navigate = useNavigate();
    const {user} = useContext(AuthContext)
    const { colors } = getThemeColors(user?.colors || 'light');
    return (
        <section className="w-full ">
            <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
                <div className="flex flex-col items-center text-center">
                    <p
                        className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
                        style={{ color: colors.secondary }}
                    >
                        Kaushal Setu AI
                    </p>
                    <h1
                        className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight max-w-4xl"
                        style={{ color: colors.textMain }}
                    >
                        Empower Your Future <br className="hidden md:block" />
                        <span style={{ color: colors.primary }}>With AI-Driven Skills</span>
                    </h1>

                    {/* Subtext - Balanced font size */}
                    <p
                        className="text-sm md:text-lg max-w-2xl font-normal leading-relaxed mb-10"
                        style={{ color: colors.textMuted }}
                    >
                        Kaushal Setu AI bridges the gap between academic learning and 
                        real-world industry demands by helping students master 
                        practical, job-ready skills.
                    </p>

                    {/* Clean Action Buttons - Standard sizing and subtle styling */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/Login')}
                            className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] text-sm shadow-sm"
                            style={{ backgroundColor: colors.primary }}
                        >
                            Get Started
                        </button>

                        <button
                            onClick={() => navigate('/developer')}
                            className="px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-slate-50 border border-slate-200"
                            style={{ color: colors.textMain }}
                        >
                            View Developer
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;
