import React, { useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Search, ChevronRight, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const Opportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [selectedOp, setSelectedOp] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // 1. Add loading state
    const navigate = useNavigate();
    const {user} = useContext(AuthContext)
    const { colors } = getThemeColors(user?.theme || 'light');

    const getOpportunity = async () => {
        try {
            setIsLoading(true);
            const res = await axiosInstance.get('/opportunity/');
            setOpportunities(res.data.data || []);
        } catch (error) {
            console.error('Error fetching opportunities:', error);
        } finally {
            setIsLoading(false); // 2. Turn off loader
        }
    };

    useEffect(() => {
        getOpportunity();
    }, []);

    // 3. Skeleton Loader Component
    const SkeletonCard = () => (
        <div className=" rounded-3xl border border-slate-100 p-8 flex flex-col justify-between animate-pulse">
            <div className="space-y-4">
                <div className="flex justify-between">
                    <div className="h-3 w-20 bg-slate-100 rounded"></div>
                    <div className="h-5 w-14 bg-slate-100 rounded-full"></div>
                </div>
                <div className="h-6 w-full bg-slate-100 rounded"></div>
                <div className="h-4 w-1/2 bg-slate-50 rounded"></div>
                <div className="flex gap-2 pt-4">
                    <div className="h-6 w-16 bg-slate-50 rounded-lg"></div>
                    <div className="h-6 w-16 bg-slate-50 rounded-lg"></div>
                </div>
            </div>
            <div className="mt-8 space-y-3">
                <div className="h-10 w-full bg-slate-50 rounded-xl"></div>
                <div className="h-10 w-full bg-slate-100 rounded-xl"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Section - Uniform Style */}
                <div
                    className="relative pl-5 border-l-4"
                    style={{ borderColor: colors.secondary }}
                >
                    <h1
                        className="text-3xl md:text-4xl font-bold tracking-tight"
                        style={{ color: colors.textMain }}
                    >
                        Career <span style={{ color: colors.primary }}>Opportunities</span>
                    </h1>
                    <p
                        className="mt-2 text-sm md:text-lg font-medium"
                        style={{ color: colors.textMuted }}
                    >
                        Find the <span style={{ color: colors.textMain }}>Best Match</span>{' '}
                        opportunities curated for your skill set.
                    </p>
                </div>

                {/* Opportunity Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading
                        ? Array(6)
                              .fill(0)
                              .map((_, i) => <SkeletonCard key={i} />)
                        : opportunities.map((item, index) => (
                              <div
                                  key={index}
                                  className="group  rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative overflow-hidden"
                              >
                                  {/* Type Badge - Decent Styling */}

                                  <div className="space-y-5">
                                      <div className="space-y-1">
                                          <p
                                              className="text-[10px] font-bold uppercase tracking-widest"
                                              style={{ color: colors.textMuted }}
                                          >
                                              {item.company.name}
                                          </p>
                                          <h3
                                              className="text-xl font-bold leading-tight transition-colors"
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

                                      {/* Skills Preview */}
                                      <div className="space-y-3">
                                          <p
                                              className="text-[9px] font-bold uppercase tracking-widest opacity-60"
                                              style={{ color: colors.textMuted }}
                                          >
                                              Required Skills
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                              {item.requiredSkills
                                                  .slice(0, 3)
                                                  .map((skill, sIndex) => (
                                                      <span
                                                          key={sIndex}
                                                          className="px-3 py-1 text-[10px] font-bold rounded-lg border transition-colors"
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
                                      </div>

                                      {/* Meta Info - Professional Layout */}
                                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                          <div className="flex items-center gap-2">
                                              <Briefcase size={14} className="opacity-40" />
                                              <div>
                                                  <p
                                                      className="text-xs font-bold"
                                                      style={{ color: colors.textMain }}
                                                  >
                                                      {item.experienceLevel}
                                                  </p>
                                              </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                              <MapPin size={14} className="opacity-40" />
                                              <div>
                                                  <p
                                                      className="text-xs font-bold"
                                                      style={{ color: colors.textMain }}
                                                  >
                                                      {item.location}
                                                  </p>
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="mt-8 flex flex-col gap-3">
                                      <button
                                          onClick={() => setSelectedOp(item)}
                                          className="w-full py-3 rounded-xl font-bold text-[11px] tracking-widest border-2 transition-all hover:bg-slate-50"
                                          style={{
                                              color: colors.primary,
                                              borderColor: `${colors.primary}20`,
                                          }}
                                      >
                                          VIEW DETAILS
                                      </button>
                                      <button
                                          onClick={() => navigate(`/analyze/${item._id}`)}
                                          className="w-full py-3 rounded-xl font-bold text-[11px] text-white tracking-widest shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                                          style={{ backgroundColor: colors.primary }}
                                      >
                                          GENERATE SKILL GAP <ChevronRight size={14} />
                                      </button>
                                  </div>
                              </div>
                          ))}
                </div>
            </div>

            {/* REFINED MODAL */}
            {selectedOp && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                        onClick={() => setSelectedOp(null)}
                    />
                    <div style={{backgroundColor:colors.bgLight}} className="relative w-full max-w-2xl  rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 pb-4 flex justify-between items-start">
                            <div>
                                <h2
                                    className="text-2xl font-bold tracking-tight"
                                    style={{ color: colors.textMain }}
                                >
                                    {selectedOp.title}
                                </h2>
                                <p
                                    className="font-bold uppercase text-[10px] tracking-[0.2em] mt-1"
                                    style={{ color: colors.secondary }}
                                >
                                    {selectedOp.company.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOp(null)}
                                className="p-2 hover:bg-red-300 rounded-full transition-colors"
                            >
                                <X size={20} className='text-red-600' />
                            </button>
                        </div>
                       {/* Description Section */}
{/* Main Container with Glass Effect */}
<div style={{backgroundColor:colors.bgLight}} className="mx-4 mb-6 overflow-hidden rounded-3xl border border-black/5 dark:border-white/10  dark:bg-zinc-900/40 backdrop-blur-md shadow-xl">
    
    {/* Scrollable Description Area */}
    <div className="p-8 pt-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
        <div
            dangerouslySetInnerHTML={{ __html: selectedOp.description }}
            className="prose prose-sm max-w-none 
                       text-slate-800 dark:text-slate-200 
                       prose-headings:text-black dark:prose-headings:text-white
                       prose-strong:text-black dark:prose-strong:text-white
                       prose-ul:my-4 leading-relaxed"
        />
    </div>

    {/* Footer Action Area - Distinct but matching */}
    <div className="p-6 bg-black/3 dark:bg-white/3 border-t border-black/5 dark:border-white/5">
        <button
            onClick={() => navigate(`/analyze/${selectedOp._id}`)}
            className="w-full py-4 rounded-2xl font-black text-white tracking-[0.25em] text-[11px] uppercase
                       shadow-2xl transition-all duration-300
                       hover:scale-[1.02] active:scale-[0.98]
                       flex items-center justify-center gap-3"
            style={{ 
                backgroundColor: colors.primary,
                boxShadow: `0 10px 30px -10px ${colors.primary}66` // Dynamic shadow matching your brand
            }}
        >
            Analyze Skill Gap Now
        </button>
    </div>
</div>
                    </div>
                </div>
            )}

            <style
                dangerouslySetInnerHTML={{
                    __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `,
                }}
            />
        </div>
    );
};

export default Opportunities;
