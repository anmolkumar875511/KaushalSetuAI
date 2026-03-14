import React, { useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';
import { TrendingUp, BookOpen, Briefcase, X } from 'lucide-react';

const Guidance = () => {
    const { user } = useContext(AuthContext);
    const { colors } = getThemeColors(user?.theme || 'light');

    const cardBg = user?.theme === 'dark' ? '#000000' : '#ffffff';

    const [jobReports, setJobReports] = useState([]);
    const [interestGuides, setInterestGuides] = useState([]);
    const [freelanceGuides, setFreelanceGuides] = useState([]);

    const [interests, setInterests] = useState([]);
    const [selectedInterest, setSelectedInterest] = useState('');

    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedType, setSelectedType] = useState(null);

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [jr, ig, fg] = await Promise.all([
                axiosInstance.get('/guidance/job-readiness'),
                axiosInstance.get('/guidance/interest-guide'),
                axiosInstance.get('/guidance/freelance-guide'),
            ]);

            setJobReports(jr.data.data || []);
            setInterestGuides(ig.data.data || []);
            setFreelanceGuides(fg.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInterests = async () => {
        try {
            const res = await axiosInstance.get('/user/interests');
            const data = res.data.data || [];

            setInterests(data);
            if (data.length) setSelectedInterest(data[0].name);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
        fetchInterests();
    }, []);

    const generateGuide = async (type) => {
        if (!selectedInterest) return;

        try {
            setGenerating(true);

            let url = '';
            if (type === 'job') url = '/guidance/job-readiness';
            if (type === 'interest') url = '/guidance/interest-guide';
            if (type === 'freelance') url = '/guidance/freelance-guide';

            await axiosInstance.post(url, { interest: selectedInterest });

            await fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    const SkeletonCard = () => (
        <div
            className="rounded-3xl border p-8 animate-pulse"
            style={{ borderColor: colors.border, backgroundColor: cardBg }}
        >
            <div className="space-y-4">
                <div className="h-5 w-1/2 rounded" style={{ backgroundColor: colors.border }} />
                <div className="h-4 w-1/3 rounded" style={{ backgroundColor: colors.border }} />
                <div className="h-6 w-20 rounded" style={{ backgroundColor: colors.border }} />
            </div>
        </div>
    );

    const Card = ({ title, subtitle, score, onClick }) => (
        <div
            onClick={onClick}
            className="rounded-3xl border p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            style={{
                borderColor: colors.border,
                backgroundColor: cardBg,
            }}
        >
            <div className="space-y-4">
                <h3 className="text-xl font-bold" style={{ color: colors.textMain }}>
                    {title}
                </h3>

                <p
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: colors.textMuted }}
                >
                    {subtitle}
                </p>

                {score && (
                    <span
                        className="px-3 py-1 text-xs font-bold rounded-lg inline-block"
                        style={{
                            backgroundColor: `${colors.primary}15`,
                            color: colors.primary,
                        }}
                    >
                        {score}%
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-7xl mx-auto space-y-12">
                {/* HEADER */}

                <div className="relative pl-5 border-l-4" style={{ borderColor: colors.secondary }}>
                    <h1
                        className="text-3xl md:text-4xl font-bold"
                        style={{ color: colors.textOnBg }}
                    >
                        AI <span style={{ color: colors.primary }}>Guidance</span>
                    </h1>

                    <p className="mt-2 text-sm md:text-lg" style={{ color: colors.textMuted }}>
                        Personalized career insights based on your interests
                    </p>
                </div>

                {/* CONTROLS */}

                <div className="flex flex-wrap gap-4">
                    <select
                        value={selectedInterest}
                        onChange={(e) => setSelectedInterest(e.target.value)}
                        className="px-4 py-3 rounded-xl border text-sm"
                        style={{
                            borderColor: colors.border,
                            backgroundColor: cardBg,
                            color: colors.textMain,
                        }}
                    >
                        {interests.map((item, index) => (
                            <option key={index} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => generateGuide('job')}
                        disabled={generating}
                        className="px-5 py-3 rounded-xl font-bold text-xs text-white"
                        style={{ backgroundColor: colors.primary }}
                    >
                        Generate Job Readiness
                    </button>

                    <button
                        onClick={() => generateGuide('interest')}
                        disabled={generating}
                        className="px-5 py-3 rounded-xl font-bold text-xs text-white"
                        style={{ backgroundColor: colors.primary }}
                    >
                        Generate Learning Guide
                    </button>

                    <button
                        onClick={() => generateGuide('freelance')}
                        disabled={generating}
                        className="px-5 py-3 rounded-xl font-bold text-xs text-white"
                        style={{ backgroundColor: colors.primary }}
                    >
                        Generate Freelance Guide
                    </button>
                </div>

                {/* JOB READINESS */}

                <Section
                    title="Job Readiness Reports"
                    icon={<TrendingUp size={20} color={colors.primary} />}
                    data={jobReports}
                    loading={loading}
                    colors={colors}
                    SkeletonCard={SkeletonCard}
                    render={(item, i) => (
                        <Card
                            key={i}
                            title={item.interest}
                            subtitle="Readiness Score"
                            score={item.readinessScore}
                            onClick={() => {
                                setSelectedItem(item);
                                setSelectedType('job');
                            }}
                        />
                    )}
                />

                {/* LEARNING ROADMAP */}

                <Section
                    title="Learning Roadmaps"
                    icon={<BookOpen size={20} color={colors.primary} />}
                    data={interestGuides}
                    loading={loading}
                    colors={colors}
                    SkeletonCard={SkeletonCard}
                    render={(item, i) => (
                        <Card
                            key={i}
                            title={item.interest}
                            subtitle={item.estimatedDuration}
                            onClick={() => {
                                setSelectedItem(item);
                                setSelectedType('interest');
                            }}
                        />
                    )}
                />

                {/* FREELANCE */}

                <Section
                    title="Freelance Strategies"
                    icon={<Briefcase size={20} color={colors.primary} />}
                    data={freelanceGuides}
                    loading={loading}
                    colors={colors}
                    SkeletonCard={SkeletonCard}
                    render={(item, i) => (
                        <Card
                            key={i}
                            title={item.interest}
                            subtitle="Freelance Strategy"
                            onClick={() => {
                                setSelectedItem(item);
                                setSelectedType('freelance');
                            }}
                        />
                    )}
                />
            </div>

            {/* MODAL */}

            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)}
                    />

                    <div
                        className="relative w-full max-w-2xl rounded-3xl shadow-xl"
                        style={{ backgroundColor: cardBg }}
                    >
                        <div className="p-8 flex justify-between">
                            <h2 className="text-2xl font-bold" style={{ color: colors.textMain }}>
                                {selectedItem.interest}
                            </h2>

                            <button onClick={() => setSelectedItem(null)}>
                                <X color={colors.textMain} />
                            </button>
                        </div>

                        <div
                            className="px-8 pb-8 max-h-[55vh] overflow-y-auto space-y-4"
                            style={{ color: colors.textMain }}
                        >
                            {selectedType === 'job' && (
                                <>
                                    <p style={{ color: colors.primary }}>
                                        Readiness Score: {selectedItem.readinessScore}%
                                    </p>

                                    <div>
                                        <p className="font-bold">Strengths</p>
                                        {selectedItem.strengths?.map((s, i) => (
                                            <p key={i}>{s}</p>
                                        ))}
                                    </div>

                                    <div>
                                        <p className="font-bold">Missing Skills</p>
                                        {selectedItem.missingSkills?.map((s, i) => (
                                            <p key={i}>{s}</p>
                                        ))}
                                    </div>
                                </>
                            )}

                            {selectedType === 'interest' && (
                                <>
                                    <p>{selectedItem.description}</p>

                                    {selectedItem.roadmap?.map((stage, i) => (
                                        <div key={i}>
                                            <p className="font-bold">{stage.level}</p>
                                            <p className="text-sm">
                                                Skills: {stage.skills.join(', ')}
                                            </p>
                                        </div>
                                    ))}
                                </>
                            )}

                            {selectedType === 'freelance' && (
                                <>
                                    <div>
                                        <p className="font-bold">Platforms</p>

                                        {selectedItem.platforms?.map((p, i) => (
                                            <a
                                                key={i}
                                                href={p.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{ color: colors.primary }}
                                                className="block"
                                            >
                                                {p.name}
                                            </a>
                                        ))}
                                    </div>

                                    <div>
                                        <p className="font-bold">Services</p>

                                        {selectedItem.servicesToOffer?.slice(0, 6).map((s, i) => (
                                            <p key={i}>{s}</p>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Section = ({ title, icon, data, render, loading, SkeletonCard, colors }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-xl font-bold" style={{ color: colors.textMain }}>
                {title}
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : data?.length ? (
                data.map(render)
            ) : (
                <p style={{ color: colors.textMuted }}>No reports generated yet</p>
            )}
        </div>
    </div>
);

export default Guidance;
