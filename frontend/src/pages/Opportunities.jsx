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
            console.error('Error fetching opportunities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getOpportunity();
    }, []);

    const SkeletonCard = () => (
        <div className="rounded-3xl border border-slate-200 p-6 animate-pulse">
            <div className="h-4 w-1/3 bg-slate-200 rounded mb-4"></div>
            <div className="h-6 w-2/3 bg-slate-200 rounded mb-3"></div>
            <div className="h-4 w-1/2 bg-slate-200 rounded mb-6"></div>

            <div className="flex gap-2 mb-6">
                <div className="h-6 w-16 bg-slate-200 rounded"></div>
                <div className="h-6 w-16 bg-slate-200 rounded"></div>
            </div>

            <div className="h-10 w-full bg-slate-200 rounded mb-3"></div>
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
                        Career <span style={{ color: colors.primary }}>Opportunities</span>
                    </h1>

                    <p className="text-sm md:text-lg" style={{ color: colors.textMuted }}>
                        Opportunities curated based on your skills
                    </p>
                </div>

                {/* Grid */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading
                        ? Array(6)
                              .fill(0)
                              .map((_, i) => <SkeletonCard key={i} />)
                        : opportunities.map((item, index) => (
                              <div
                                  key={index}
                                  className="group rounded-3xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1"
                              >
                                  <div className="space-y-4">
                                      {/* Title */}

                                      <div>
                                          <p
                                              className="text-xs font-semibold"
                                              style={{ color: colors.textMuted }}
                                          >
                                              {item.company.name}
                                          </p>

                                          <h3
                                              className="text-lg font-bold mt-1"
                                              style={{ color: colors.textMain }}
                                          >
                                              {item.title}
                                          </h3>

                                          <p
                                              className="text-xs mt-1"
                                              style={{ color: colors.primary }}
                                          >
                                              {item.category}
                                          </p>
                                      </div>

                                      {/* Skills */}

                                      <div className="flex flex-wrap gap-2">
                                          {item.requiredSkills?.slice(0, 3).map((skill, i) => (
                                              <span
                                                  key={i}
                                                  className="px-2 py-1 text-xs font-semibold rounded-md"
                                                  style={{
                                                      backgroundColor: `${colors.primary}10`,
                                                      color: colors.primary,
                                                  }}
                                              >
                                                  {skill}
                                              </span>
                                          ))}
                                      </div>

                                      {/* Meta */}

                                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                                          <div className="flex items-center gap-2 text-sm">
                                              <Briefcase size={14} />
                                              <span style={{ color: colors.textMain }}>
                                                  {item.experienceLevel}
                                              </span>
                                          </div>

                                          <div className="flex items-center gap-2 text-sm">
                                              <MapPin size={14} />
                                              <span style={{ color: colors.textMain }}>
                                                  {item.location}
                                              </span>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Buttons */}

                                  <div className="mt-6 space-y-2">
                                      <button
                                          onClick={() => setSelectedOp(item)}
                                          className="w-full py-2.5 rounded-xl font-semibold text-sm border transition-all hover:opacity-90"
                                          style={{
                                              color: colors.primary,
                                              borderColor: `${colors.primary}40`,
                                          }}
                                      >
                                          View Details
                                      </button>

                                      <button
                                          onClick={() => navigate(`/analyze/${item._id}`)}
                                          className="w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                                          style={{ backgroundColor: colors.primary }}
                                      >
                                          Skill Gap Analysis <ChevronRight size={16} />
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
                        className="relative w-full max-w-xl rounded-3xl shadow-xl p-8 space-y-6"
                        style={{ backgroundColor: colors.bgLight }}
                    >
                        <div className="flex justify-between">
                            <div>
                                <h2
                                    className="text-2xl font-bold"
                                    style={{ color: colors.textMain }}
                                >
                                    {selectedOp.title}
                                </h2>

                                <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
                                    {selectedOp.company.name}
                                </p>
                            </div>

                            <button onClick={() => setSelectedOp(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Description */}

                        <div className="max-h-[50vh] overflow-y-auto text-sm leading-relaxed">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: selectedOp.description,
                                }}
                            />
                        </div>

                        {/* Action */}

                        <button
                            onClick={() => navigate(`/analyze/${selectedOp._id}`)}
                            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                            style={{ backgroundColor: colors.primary }}
                        >
                            Analyze Skill Gap
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Opportunities;
