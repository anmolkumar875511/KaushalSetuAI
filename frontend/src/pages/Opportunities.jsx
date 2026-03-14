import React, { useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, ChevronRight, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const Opportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [selectedOp, setSelectedOp] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    const { user } = useContext(AuthContext);
    const { colors } = getThemeColors(user?.theme || 'light');

    const getOpportunity = async () => {
        try {
            setIsLoading(true);
            const res = await axiosInstance.get('/opportunity/');
            setOpportunities(res.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getOpportunity();
    }, []);

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}

                <div className="relative pl-5 border-l-4" style={{ borderColor: colors.secondary }}>
                    <h1
                        className="text-3xl md:text-4xl font-bold"
                        style={{ color: colors.textOnBg }}
                    >
                        Career <span style={{ color: colors.primary }}>Opportunities</span>
                    </h1>

                    <p className="mt-2 text-sm md:text-lg" style={{ color: colors.textMuted }}>
                        Find the best opportunities curated for your skill set
                    </p>
                </div>

                {/* Grid */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map((item) => (
                        <div
                            key={item._id}
                            className="rounded-3xl border shadow-sm p-8 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            style={{
                                borderColor: colors.border,
                                backgroundColor: colors.white,
                            }}
                        >
                            <div className="space-y-5">
                                <div>
                                    <p
                                        className="text-[10px] font-bold uppercase tracking-widest"
                                        style={{ color: colors.textMuted }}
                                    >
                                        {item.company.name}
                                    </p>

                                    <h3
                                        className="text-xl font-bold"
                                        style={{ color: colors.textMain }}
                                    >
                                        {item.title}
                                    </h3>

                                    <p
                                        className="text-xs font-semibold italic"
                                        style={{ color: colors.primary }}
                                    >
                                        {item.category}
                                    </p>
                                </div>

                                {/* Skills */}

                                <div className="flex flex-wrap gap-2">
                                    {item.requiredSkills.slice(0, 3).map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 text-[10px] font-bold rounded-lg border"
                                            style={{
                                                backgroundColor: `${colors.primary}08`,
                                                color: colors.primary,
                                                borderColor: `${colors.primary}15`,
                                            }}
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                {/* Meta */}

                                <div
                                    className="grid grid-cols-2 gap-4 pt-4 border-t"
                                    style={{ borderColor: colors.border }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={14} />
                                        <p
                                            style={{ color: colors.textMain }}
                                            className="text-xs font-bold"
                                        >
                                            {item.experienceLevel}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} />
                                        <p
                                            style={{ color: colors.textMain }}
                                            className="text-xs font-bold"
                                        >
                                            {item.location}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}

                            <div className="mt-8 flex flex-col gap-3">
                                <button
                                    onClick={() => setSelectedOp(item)}
                                    className="w-full py-3 rounded-xl font-bold text-[11px] border-2 transition-all"
                                    style={{
                                        color: colors.primary,
                                        borderColor: `${colors.primary}20`,
                                    }}
                                >
                                    VIEW DETAILS
                                </button>

                                <button
                                    onClick={() => navigate(`/analyze/${item._id}`)}
                                    className="w-full py-3 rounded-xl font-bold text-[11px] text-white flex items-center justify-center gap-2"
                                    style={{ backgroundColor: colors.primary }}
                                >
                                    GENERATE SKILL GAP <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}

            {selectedOp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setSelectedOp(null)}
                    />

                    <div
                        className="relative w-full max-w-2xl rounded-3xl shadow-xl"
                        style={{ backgroundColor: colors.white }}
                    >
                        <div className="p-8 flex justify-between">
                            <div>
                                <h2
                                    style={{ color: colors.textMain }}
                                    className="text-2xl font-bold"
                                >
                                    {selectedOp.title}
                                </h2>

                                <p
                                    style={{ color: colors.secondary }}
                                    className="text-xs font-bold uppercase"
                                >
                                    {selectedOp.company.name}
                                </p>
                            </div>

                            <button onClick={() => setSelectedOp(null)}>
                                <X />
                            </button>
                        </div>

                        {/* Description */}

                        <div
                            className="px-8 pb-8 max-h-[50vh] overflow-y-auto"
                            style={{ color: colors.textMain }}
                            dangerouslySetInnerHTML={{ __html: selectedOp.description }}
                        />

                        <div className="p-6 border-t" style={{ borderColor: colors.border }}>
                            <button
                                onClick={() => navigate(`/analyze/${selectedOp._id}`)}
                                className="w-full py-4 rounded-2xl text-white font-bold tracking-widest"
                                style={{ backgroundColor: colors.primary }}
                            >
                                Analyze Skill Gap Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Opportunities;
