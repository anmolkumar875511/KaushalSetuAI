import React, { useContext } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const Contact = () => {
    const {user}= useContext(AuthContext)
    const { colors } = getThemeColors(user?.theme || 'light');
    const contactInfo = [
        {
            label: 'Email Us',
            value: 'anmolkumar875511@gmail.com',
            link: 'mailto:anmolkumar875511@gmail.com',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                </svg>
            ),
        },
        {
            label: 'Call Us',
            value: '+91 8755671186',
            link: 'tel:+91 8755671186',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                </svg>
            ),
        },
        {
            label: 'Visit Us',
            value: 'MNNIT Allahabad, Prayagraj,Uttar Pradesh, India',
            link: '#',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen py-16 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Section Header - Clean & Balanced */}
                <div className="text-center space-y-3">
                    <p
                        className="text-[11px] font-bold uppercase tracking-[0.2em]"
                        style={{ color: colors.secondary }}
                    >
                        Contact Us
                    </p>
                    <h1
                        className="text-3xl md:text-5xl font-bold tracking-tight"
                        style={{ color: colors.textMain }}
                    >
                        Get in <span style={{ color: colors.primary }}>Touch</span>
                    </h1>
                    <p
                        className="text-sm md:text-lg max-w-2xl mx-auto font-medium leading-relaxed"
                        style={{ color: colors.textMuted }}
                    >
                        We’d love to hear from you. Connect with us through any of these
                        platforms!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left: Contact Info Cards */}
                    <div className="space-y-4">
                        {contactInfo.map((info, index) => (
                            <a
                                href={info.link}
                                key={index}
                                className="group flex items-center p-5  border border-slate-200 rounded-2xl shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                                    style={{
                                        backgroundColor: `${colors.primary}10`,
                                        color: colors.primary,
                                    }}
                                >
                                    {info.icon}
                                </div>
                                <div className="ml-5">
                                    <p
                                        className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1"
                                        style={{ color: colors.textMuted }}
                                    >
                                        {info.label}
                                    </p>
                                    <p
                                        className="text-base font-bold transition-colors group-hover:text-blue-600"
                                        style={{ color: colors.textMain }}
                                    >
                                        {info.value}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Right: Social Connect Section */}
                    <div className=" border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm flex flex-col justify-between min-h-85">
                        <div>
                            <h3
                                className="text-xl font-bold mb-2"
                                style={{ color: colors.textMain }}
                            >
                                Follow Our Journey
                            </h3>
                            <p
                                className="text-sm font-medium"
                                style={{ color: colors.textMuted }}
                            >
                                Stay updated with our latest milestones and student stories.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 py-8">
                            {/* Instagram */}
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noreferrer"
                                className="p-4 bg-slate-50 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100 group"
                            >
                                <Instagram size={24} />
                            </a>

                            {/* Facebook */}
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noreferrer"
                                className="p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 group"
                            >
                                <Facebook size={24} />
                            </a>

                            {/* LinkedIn */}
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noreferrer"
                                className="p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 group"
                            >
                                <Linkedin size={24} />
                            </a>
                        </div>

                        {/* Bottom Graphic Detail - Simplified */}
                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                            <span
                                className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30"
                                style={{ color: colors.textMain }}
                            >
                                KaushalSetuAI Global
                            </span>
                            <div className="flex gap-1.5">
                                <div
                                    className="h-1.5 w-6 rounded-full"
                                    style={{ backgroundColor: colors.primary }}
                                />
                                <div
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: colors.secondary }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Contact;
