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
        <div className="rounded-3xl border border-slate-200 p-6 animate-pulse">
            <div className="h-4 w-1/3 bg-slate-200 rounded mb-4"></div>
            <div className="h-5 w-2/3 bg-slate-200 rounded mb-3"></div>
            <div className="h-4 w-1/2 bg-slate-200 rounded mb-6"></div>
            <div className="flex gap-2 mb-6">
                <div className="h-6 w-16 bg-slate-200 rounded"></div>
                <div className="h-6 w-16 bg-slate-200 rounded"></div>
            </div>
            <div className="h-10 w-full bg-slate-200 rounded"></div>
        </div>
    );

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}

                <div className="space-y-2">
                    <h1
                        className="text-3xl md:text-4xl font-bold"
                        style={{ color: colors.textMain }}
                    >
                        AI Ranked <span style={{ color: colors.primary }}>Jobs</span>
                    </h1>

                    <p className="text-sm md:text-lg" style={{ color: colors.textMuted }}>
                        Opportunities ranked based on your skill match
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
                                  className="group rounded-3xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1"
                              >
                                  <div className="space-y-4">
                                      {/* Match Score */}

                                      <div className="flex justify-between items-center">
                                          <span className="text-xs font-semibold opacity-70">
                                              Match Score
                                          </span>

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
                                              className="text-lg font-bold"
                                              style={{ color: colors.textMain }}
                                          >
                                              {job.title || 'Untitled Job'}
                                          </h3>

                                          <p
                                              className="text-xs mt-1"
                                              style={{ color: colors.textMuted }}
                                          >
                                              {job.company?.name}
                                          </p>
                                      </div>

                                      {/* Skills */}

                                      <div className="flex flex-wrap gap-2">
                                          {job.matchedSkills?.slice(0, 3).map((skill, i) => (
                                              <span
                                                  key={i}
                                                  className="px-2 py-1 text-[11px] font-semibold rounded-md"
                                                  style={{
                                                      backgroundColor: `${colors.primary}10`,
                                                      color: colors.primary,
                                                  }}
                                              >
                                                  {skill}
                                              </span>
                                          ))}
                                      </div>

                                      {/* Location */}

                                      <div className="flex items-center gap-2 text-sm">
                                          <MapPin size={14} />

                                          <span style={{ color: colors.textMain }}>
                                              {job.location}
                                          </span>
                                      </div>
                                  </div>

                                  {/* Button */}

                                  <button
                                      onClick={() => setSelectedJob(job)}
                                      className="mt-6 w-full py-2.5 rounded-xl font-semibold text-sm border transition-all hover:opacity-90"
                                      style={{
                                          color: colors.primary,
                                          borderColor: `${colors.primary}40`,
                                      }}
                                  >
                                      View Analysis
                                  </button>
                              </div>
                          ))}
                </div>
            </div>

            {/* Modal */}

            {selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}

                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setSelectedJob(null)}
                    />

                    {/* Modal */}

                    <div
                        className="relative w-full max-w-xl rounded-3xl shadow-xl p-8 space-y-6"
                        style={{ backgroundColor: colors.bgLight }}
                    >
                        {/* Header */}

                        <div className="flex justify-between items-start">
                            <div>
                                <h2
                                    className="text-2xl font-bold"
                                    style={{ color: colors.textMain }}
                                >
                                    {selectedJob.title}
                                </h2>

                                <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
                                    {selectedJob.company?.name}
                                </p>
                            </div>

                            <button onClick={() => setSelectedJob(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Score */}

                        <div className="flex items-center gap-2">
                            <TrendingUp size={18} color={colors.primary} />

                            <span className="font-bold text-lg" style={{ color: colors.primary }}>
                                {selectedJob.weightedScore}% Match
                            </span>
                        </div>

                        {/* Skill Coverage */}

                        {selectedJob.skillCoverage && (
                            <p className="text-sm opacity-70">
                                Skill Coverage: {(selectedJob.skillCoverage * 100).toFixed(0)}%
                            </p>
                        )}

                        {/* Required Skills */}

                        {selectedJob.requiredSkills && (
                            <div>
                                <p className="text-sm font-semibold mb-2">Required Skills</p>

                                <div className="flex flex-wrap gap-2">
                                    {selectedJob.requiredSkills.slice(0, 6).map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 text-xs rounded-md border"
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
                            <p className="text-sm font-semibold mb-2">Missing Skills</p>

                            <div className="flex flex-wrap gap-2">
                                {selectedJob.missingSkills?.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 text-xs rounded-md border"
                                        style={{
                                            borderColor: `${colors.primary}30`,
                                            color: colors.textMain,
                                        }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            {selectedJob.missingSkills?.length > 0 && (
                                <button
                                    onClick={() => handleGenerateRoadmap(selectedJob)}
                                    disabled={roadmapLoading}
                                    className="mt-5 w-full py-3 rounded-xl font-semibold text-sm border transition-all hover:opacity-90"
                                    style={{
                                        color: colors.primary,
                                        borderColor: `${colors.primary}40`,
                                    }}
                                >
                                    {roadmapLoading ? 'Generating Roadmap...' : 'Generate Roadmap'}
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
