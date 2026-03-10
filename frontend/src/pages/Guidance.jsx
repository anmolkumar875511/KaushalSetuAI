import React, { useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';
import { TrendingUp, BookOpen, Briefcase, X } from 'lucide-react';

const Guidance = () => {
    const { user } = useContext(AuthContext);
    const { colors } = getThemeColors(user?.theme || 'light');

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
            const res = await axiosInstance.get('/users/interests');

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

            await axiosInstance.post(url, {
                interest: selectedInterest,
            });

            await fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    const Card = ({ title, subtitle, score, onClick }) => (
        <div
            onClick={onClick}
            className="group rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer"
        >
            <div className="space-y-3">
                <h3 className="text-xl font-bold" style={{ color: colors.textMain }}>
                    {title}
                </h3>

                <p className="text-xs uppercase font-bold" style={{ color: colors.textMuted }}>
                    {subtitle}
                </p>

                {score && (
                    <span
                        className="px-3 py-1 text-xs font-bold rounded-full"
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
                        style={{ color: colors.textMain }}
                    >
                        AI <span style={{ color: colors.primary }}>Guidance</span>
                    </h1>

                    <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
                        Personalized career insights based on your interests.
                    </p>
                </div>

                {/* INTEREST DROPDOWN */}

                <div className="flex gap-4 items-center">
                    <select
                        value={selectedInterest}
                        onChange={(e) => setSelectedInterest(e.target.value)}
                        className="p-3 border rounded-xl w-64"
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
                        className="px-4 py-2 rounded-xl text-xs font-bold"
                        style={{
                            backgroundColor: colors.primary,
                            color: '#fff',
                        }}
                    >
                        Generate Job Readiness
                    </button>

                    <button
                        onClick={() => generateGuide('interest')}
                        disabled={generating}
                        className="px-4 py-2 rounded-xl text-xs font-bold"
                        style={{
                            backgroundColor: colors.primary,
                            color: '#fff',
                        }}
                    >
                        Generate Learning Guide
                    </button>

                    <button
                        onClick={() => generateGuide('freelance')}
                        disabled={generating}
                        className="px-4 py-2 rounded-xl text-xs font-bold"
                        style={{
                            backgroundColor: colors.primary,
                            color: '#fff',
                        }}
                    >
                        Generate Freelance Guide
                    </button>
                </div>

                {/* JOB READINESS */}

                <Section
                    title="Job Readiness Reports"
                    icon={<TrendingUp />}
                    data={jobReports}
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

                {/* INTEREST GUIDES */}

                <Section
                    title="Learning Roadmaps"
                    icon={<BookOpen />}
                    data={interestGuides}
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

                {/* FREELANCE GUIDES */}

                <Section
                    title="Freelance Strategies"
                    icon={<Briefcase />}
                    data={freelanceGuides}
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
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setSelectedItem(null)}
                    />

                    <div
                        style={{ backgroundColor: colors.bgLight }}
                        className="relative w-full max-w-2xl rounded-3xl shadow-xl p-8 space-y-6"
                    >
                        <div className="flex justify-between">
                            <h2 className="text-2xl font-bold" style={{ color: colors.textMain }}>
                                {selectedItem.interest}
                            </h2>

                            <button onClick={() => setSelectedItem(null)}>
                                <X />
                            </button>
                        </div>

                        {selectedType === 'job' && (
                            <>
                                <p>Score: {selectedItem.readinessScore}%</p>

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
                                        <h3 className="font-bold">{stage.level}</h3>

                                        <p className="text-sm">Skills: {stage.skills.join(', ')}</p>
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
                                            className="block text-blue-500"
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
            )}
        </div>
    );
};

const Section = ({ title, icon, data, render }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-xl font-bold">{title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.length ? data.map(render) : <p>No data yet</p>}
        </div>
    </div>
);

export default Guidance;
