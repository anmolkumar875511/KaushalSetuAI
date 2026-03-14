import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../context/AuthContext.jsx';
import { getThemeColors } from '../theme';
import { ClipboardList, Clock, ChevronRight } from 'lucide-react';

const PastAssessments = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const { user } = useContext(AuthContext);
    const { colors } = getThemeColors(user?.theme || 'light');

    const cardBg = user?.theme === 'dark' ? '#000000' : '#ffffff';

    const fetchAssessments = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/assessment');
            setAssessments(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssessments();
    }, []);

    const SkeletonCard = () => (
        <div
            className="rounded-3xl border p-8 animate-pulse"
            style={{
                borderColor: colors.border,
                backgroundColor: cardBg,
            }}
        >
            <div className="space-y-4">
                <div className="h-6 w-2/3 rounded" style={{ backgroundColor: colors.border }} />
                <div className="h-4 w-1/3 rounded" style={{ backgroundColor: colors.border }} />
                <div className="h-4 w-1/2 rounded" style={{ backgroundColor: colors.border }} />
                <div className="h-4 w-1/2 rounded" style={{ backgroundColor: colors.border }} />
                <div className="h-10 rounded-xl mt-4" style={{ backgroundColor: colors.border }} />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-7xl mx-auto space-y-10">
                {/* HEADER */}

                <div className="relative pl-5 border-l-4" style={{ borderColor: colors.secondary }}>
                    <h1
                        className="text-3xl md:text-4xl font-bold"
                        style={{ color: colors.textOnBg }}
                    >
                        Past <span style={{ color: colors.primary }}>Assessments</span>
                    </h1>

                    <p className="mt-2 text-sm md:text-lg" style={{ color: colors.textMuted }}>
                        Review your previous assessment attempts and performance
                    </p>
                </div>

                {/* EMPTY STATE */}

                {!loading && assessments.length === 0 && (
                    <div
                        className="flex flex-col items-center justify-center py-24 border rounded-3xl"
                        style={{
                            borderColor: colors.border,
                            backgroundColor: cardBg,
                        }}
                    >
                        <ClipboardList size={48} color={colors.textMuted} />

                        <p
                            className="mt-5 text-sm font-semibold"
                            style={{ color: colors.textMuted }}
                        >
                            No assessments attempted yet
                        </p>
                    </div>
                )}

                {/* GRID */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                        : assessments.map((a) => (
                              <div
                                  key={a._id}
                                  className="rounded-3xl border p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                                  style={{
                                      borderColor: colors.border,
                                      backgroundColor: cardBg,
                                  }}
                              >
                                  {/* TOP INFO */}

                                  <div className="space-y-5">
                                      <div>
                                          <h2
                                              className="text-xl font-bold"
                                              style={{ color: colors.textMain }}
                                          >
                                              {a.topic}
                                          </h2>

                                          <p
                                              className="text-xs font-semibold italic"
                                              style={{ color: colors.primary }}
                                          >
                                              Assessment
                                          </p>
                                      </div>

                                      {/* SCORE */}

                                      <div
                                          className="text-sm font-bold"
                                          style={{ color: colors.primary }}
                                      >
                                          Score: {a.score}/100
                                      </div>

                                      {/* DETAILS */}

                                      <div
                                          className="pt-4 border-t text-xs space-y-2"
                                          style={{
                                              borderColor: colors.border,
                                              color: colors.textMuted,
                                          }}
                                      >
                                          <p>Start: {new Date(a.timeStarted).toLocaleString()}</p>

                                          <p>End: {new Date(a.timeCompleted).toLocaleString()}</p>

                                          <div className="flex items-center gap-2">
                                              <Clock size={14} />
                                              <span>Duration: {a.duration}s</span>
                                          </div>
                                      </div>
                                  </div>

                                  {/* BUTTON */}

                                  <button
                                      onClick={() => navigate(`/assessment/${a._id}`)}
                                      className="mt-8 w-full py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                                      style={{
                                          backgroundColor: colors.primary,
                                      }}
                                  >
                                      View Assessment <ChevronRight size={14} />
                                  </button>
                              </div>
                          ))}
                </div>
            </div>
        </div>
    );
};

export default PastAssessments;
