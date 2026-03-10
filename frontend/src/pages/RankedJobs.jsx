import React, { useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { MapPin, X, TrendingUp } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const RankedJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [roadmapLoading, setRoadmapLoading] = useState(false);

    const { user } = useContext(AuthContext);
    const { colors } = getThemeColors(user?.theme || 'light');

    const fetchRankedJobs = async () => {
        try {
            setIsLoading(true);

            const res = await axiosInstance.get('/opportunity/ranked');

            setJobs(res.data.data || []);
        } catch (error) {
            console.error('Error fetching ranked jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRankedJobs();
    }, []);

    const handleGenerateRoadmap = async (job) => {
        try {
            setRoadmapLoading(true);

            const payload = {
                jobTitle: job.title,
                category: job.category || 'All Categories',
                missingSkills: job.missingSkills,
                opportunityId: job.jobId,
            };

            const res = await axiosInstance.post('/roadmap/generate-ranked-job-roadmap', payload);

            const roadmapId = res.data.data._id;

            window.location.href = `/roadmap/${roadmapId}`;
        } catch (error) {
            console.error('Roadmap generation failed:', error);
        } finally {
            setRoadmapLoading(false);
        }
    };

    const SkeletonCard = () => (
        <div className="rounded-3xl border border-slate-100 p-8 animate-pulse">
            <div className="h-5 w-2/3 bg-slate-100 rounded mb-3" />
            <div className="h-4 w-1/2 bg-slate-50 rounded mb-6" />
            <div className="h-8 w-full bg-slate-50 rounded" />
        </div>
    );

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}

                <div className="relative pl-5 border-l-4" style={{ borderColor: colors.secondary }}>
                    <h1
                        className="text-3xl md:text-4xl font-bold"
                        style={{ color: colors.textMain }}
                    >
                        AI Ranked <span style={{ color: colors.primary }}>Jobs</span>
                    </h1>

                    <p className="mt-2 text-sm md:text-lg" style={{ color: colors.textMuted }}>
                        Opportunities ranked by your{' '}
                        <span style={{ color: colors.textMain }}>skill match</span>.
                    </p>
                </div>

                {/* Jobs Grid */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading
                        ? Array(6)
                              .fill(0)
                              .map((_, i) => <SkeletonCard key={i} />)
                        : jobs.map((job, index) => (
                              <div
                                  key={index}
                                  className="group rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-1"
                              >
                                  <div className="space-y-5">
                                      {/* Match Score */}

                                      <div className="flex justify-between items-center">
                                          <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                                              Match Score
                                          </p>

                                          <span
                                              className="px-3 py-1 text-xs font-bold rounded-full"
                                              style={{
                                                  backgroundColor: `${colors.primary}15`,
                                                  color: colors.primary,
                                              }}
                                          >
                                              {job.weightedScore}%
                                          </span>
                                      </div>

                                      {/* Title */}

                                      <div>
                                          <h3
                                              className="text-xl font-bold"
                                              style={{ color: colors.textMain }}
                                          >
                                              {job.title || 'Untitled Job'}
                                          </h3>

                                          <p
                                              className="text-xs font-bold uppercase mt-1"
                                              style={{ color: colors.textMuted }}
                                          >
                                              {job.company?.name}
                                          </p>
                                      </div>

                                      {/* Matched Skills */}

                                      <div>
                                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                                              Matched Skills
                                          </p>

                                          <div className="flex flex-wrap gap-2 mt-2">
                                              {job.matchedSkills?.slice(0, 3).map((skill, i) => (
                                                  <span
                                                      key={i}
                                                      className="px-3 py-1 text-[10px] font-bold rounded-lg"
                                                      style={{
                                                          backgroundColor: `${colors.primary}10`,
                                                          color: colors.primary,
                                                      }}
                                                  >
                                                      {skill}
                                                  </span>
                                              ))}
                                          </div>
                                      </div>

                                      {/* Location */}

                                      <div className="flex items-center gap-2 pt-3">
                                          <MapPin size={14} />

                                          <p
                                              className="text-xs font-bold"
                                              style={{ color: colors.textMain }}
                                          >
                                              {job.location}
                                          </p>
                                      </div>
                                  </div>

                                  <div className="mt-8">
                                      <button
                                          onClick={() => setSelectedJob(job)}
                                          className="w-full py-3 rounded-xl font-bold text-[11px] tracking-widest border-2 transition-all"
                                          style={{
                                              color: colors.primary,
                                              borderColor: `${colors.primary}20`,
                                          }}
                                      >
                                          VIEW ANALYSIS
                                      </button>
                                  </div>
                              </div>
                          ))}
                </div>
            </div>

            {/* MODAL */}

            {selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setSelectedJob(null)}
                    />

                    <div
                        style={{ backgroundColor: colors.bgLight }}
                        className="relative w-full max-w-2xl rounded-3xl shadow-xl p-8 space-y-6"
                    >
                        {/* Header */}

                        <div className="flex justify-between">
                            <div>
                                <h2
                                    className="text-2xl font-bold"
                                    style={{ color: colors.textMain }}
                                >
                                    {selectedJob.title}
                                </h2>

                                <p
                                    className="text-xs uppercase font-bold"
                                    style={{ color: colors.textMuted }}
                                >
                                    {selectedJob.company?.name}
                                </p>
                            </div>

                            <button onClick={() => setSelectedJob(null)}>
                                <X />
                            </button>
                        </div>

                        {/* Score */}

                        <div className="flex items-center gap-3">
                            <TrendingUp size={18} color={colors.primary} />

                            <span className="font-bold text-lg" style={{ color: colors.primary }}>
                                {selectedJob.weightedScore}% Match
                            </span>
                        </div>

                        {/* Skill Coverage */}

                        {selectedJob.skillCoverage && (
                            <p className="text-xs opacity-70">
                                Skill Coverage: {(selectedJob.skillCoverage * 100).toFixed(0)}%
                            </p>
                        )}

                        {/* Required Skills */}

                        {selectedJob.requiredSkills && (
                            <div>
                                <p className="text-xs font-bold uppercase opacity-60 mb-2">
                                    Required Skills
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {selectedJob.requiredSkills.slice(0, 6).map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 text-[10px] rounded-lg border"
                                            style={{
                                                borderColor: `${colors.primary}30`,
                                                color: colors.textMain,
                                            }}
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Missing Skills */}

                        <div>
                            <p className="text-xs font-bold uppercase opacity-60 mb-2">
                                Missing Skills
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {selectedJob.missingSkills?.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 text-[10px] rounded-lg border"
                                        style={{
                                            borderColor: `${colors.primary}30`,
                                            color: colors.textMain,
                                        }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            {/* Generate Roadmap */}

                            {selectedJob.missingSkills?.length > 0 && (
                                <button
                                    onClick={() => handleGenerateRoadmap(selectedJob)}
                                    disabled={roadmapLoading}
                                    className="mt-4 w-full py-3 rounded-xl font-bold text-[11px] tracking-widest border-2 transition-all"
                                    style={{
                                        color: colors.primary,
                                        borderColor: `${colors.primary}20`,
                                    }}
                                >
                                    {roadmapLoading
                                        ? 'GENERATING ROADMAP...'
                                        : 'GENERATE ROADMAP FOR MISSING SKILLS'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RankedJobs;
