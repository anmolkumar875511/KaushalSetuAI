import React, { useContext } from 'react';
import { Github, Linkedin, Instagram, Code2, GraduationCap } from 'lucide-react';
import Anmol from '../assets/Anmol.png';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const Developer = () => {
    const { user } = useContext(AuthContext);
    const { colors } = getThemeColors(user?.theme || 'light');

    const developer = [
        {
            name: 'Anmol Kumar',
            image: Anmol,
            skills: 'Backend Architect & Node.js Specialist',
            description:
                'A logic-driven developer focused on building scalable, high-performance server-side architectures. Expert in Node.js, Express, and Database Design.',
            education: [
                { degree: 'BS in Data Science and Applicaations', institute: 'IIT Madras' },
                { degree: 'B.Tech in Biotechnology', institute: 'NIT Allahabad' },
            ],
            socials: {
                github: 'https://github.com/anmolkumar875511',
                linkedin: 'https://www.linkedin.com/in/anmolkumar8755/',
                instagram:
                    'https://www.instagram.com/anmol_kumar_shaharwal',
            },
        }
    ];

    if (!colors) return null;

    return (
        <div
            className="min-h-screen py-20 px-6"
            style={{ backgroundColor: colors.bgLight }}
        >
            <div className="max-w-6xl mx-auto">
                
                {/* Section Header */}
                <div className="text-center mb-20">
                    <p
                        className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3"
                        style={{ color: colors.secondary }}
                    >
                        KaushalSetuAI
                    </p>

                    <h1
                        className="text-3xl md:text-5xl font-bold tracking-tight"
                        style={{ color: colors.textMain }}
                    >
                        Meet the <span style={{ color: colors.primary }}>Developer</span>
                    </h1>

                    <p
                        className="mt-4 text-sm md:text-lg font-medium"
                        style={{ color: colors.textMuted }}
                    >
                        The mind behind KaushalSetuAI’s intelligent career ecosystem.
                    </p>
                </div>

                {/* Single Centered Card */}
                <div className="flex justify-center">
                    {developer.map((member, index) => (
                        <div
                            key={index}
                            className="w-full max-w-3xl rounded-3xl p-10 border transition-all duration-300 shadow-sm hover:shadow-md"
                            style={{ borderColor: colors.border }}
                        >
                            <div className="flex flex-col md:flex-row gap-10 items-start">
                                
                                {/* Profile Image */}
                                <div className="relative shrink-0 mx-auto md:mx-0">
                                    <div
                                        className="w-32 h-32 rounded-2xl overflow-hidden border-2"
                                        style={{ borderColor: colors.border }}
                                    >
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 w-full">

                                    {/* Name + Socials */}
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                                        <h3
                                            className="text-2xl font-bold"
                                            style={{ color: colors.textMain }}
                                        >
                                            {member.name}
                                        </h3>

                                        <div className="flex gap-5">
                                            <a
                                                href={member.socials.github}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="opacity-40 hover:opacity-100 transition-opacity"
                                                style={{ color: colors.textMain }}
                                            >
                                                <Github size={20} />
                                            </a>

                                            <a
                                                href={member.socials.linkedin}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="opacity-40 hover:opacity-100 transition-opacity"
                                                style={{ color: colors.primary }}
                                            >
                                                <Linkedin size={20} />
                                            </a>

                                            <a
                                                href={member.socials.instagram}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="opacity-40 hover:opacity-100 transition-opacity"
                                                style={{ color: colors.secondary }}
                                            >
                                                <Instagram size={20} />
                                            </a>
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <p
                                        className="font-bold text-xs uppercase tracking-wider mb-5 flex items-center gap-2"
                                        style={{ color: colors.primary }}
                                    >
                                        <Code2 size={16} /> {member.skills}
                                    </p>

                                    {/* Description */}
                                    <p
                                        className="text-sm leading-relaxed mb-8"
                                        style={{ color: colors.textMuted }}
                                    >
                                        {member.description}
                                    </p>

                                    {/* Education */}
                                    <div
                                        className="space-y-4 p-6 rounded-2xl border"
                                        style={{
                                            backgroundColor: colors.bgLight,
                                            borderColor: colors.border,
                                        }}
                                    >
                                        <h4
                                            className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 opacity-60"
                                            style={{ color: colors.textMain }}
                                        >
                                            <GraduationCap size={16} /> Academic Background
                                        </h4>

                                        {member.education.map((edu, idx) => (
                                            <div key={idx} className="flex flex-col">
                                                <span
                                                    className="text-sm font-bold"
                                                    style={{ color: colors.textMain }}
                                                >
                                                    {edu.degree}
                                                </span>
                                                <span
                                                    className="text-xs font-medium"
                                                    style={{ color: colors.textMuted }}
                                                >
                                                    {edu.institute}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Developer;