import React, { useState, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { Target, Sparkles, Plus, X, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const SetTarget = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        targetRole: '',
        category: 'tech',
        specificSkills: [],
    });
    const [skillInput, setSkillInput] = useState('');
    const {user} = useContext(AuthContext)
    const { colors } = getThemeColors(user?.theme || 'light');

    const handleAddSkill = (e) => {
        e.preventDefault();
        if (skillInput.trim() && !formData.specificSkills.includes(skillInput.trim())) {
            setFormData({
                ...formData,
                specificSkills: [...formData.specificSkills, skillInput.trim()],
            });
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData({
            ...formData,
            specificSkills: formData.specificSkills.filter((s) => s !== skillToRemove),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.specificSkills.length === 0) return alert('Please add at least one skill');

        setLoading(true);
        try {
            const res = await axiosInstance.post('/roadmap/custom-target', formData);
            const newRoadmapId = res.data.data.roadmap._id;
            navigate(`/roadmap/${newRoadmapId}`);
        } catch (error) {
            console.error('Failed to generate target roadmap', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: colors.bgLight }}>
            <div className="max-w-2xl mx-auto">
                <header className="mb-10 text-center">
                    <div className="w-16 h-16  rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4  ">
                        <Target size={32} style={{ color: colors.primary }} />
                    </div>
                    <h1 className="text-3xl font-bold" style={{ color: colors.textMain }}>
                        Set Your Target
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Define your goal, and we'll build the path to get there.
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className=" p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6"
                >
                    {/* Role Input */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">
                            Target Role / Goal
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Senior Frontend Developer"
                            className="w-full p-4  border border-slate-100 rounded-xl focus:outline-none focus:ring-2 transition-all"
                            style={{ '--tw-ring-color': colors.primary, color: colors.textMain }}
                            value={formData.targetRole}
                            onChange={(e) =>
                                setFormData({ ...formData, targetRole: e.target.value })
                            }
                        />
                    </div>

                    {/* Category Select */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">
                            Category
                        </label>
                        <select
                            className="w-full p-4  border border-slate-100 rounded-xl focus:outline-none focus:ring-2"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            style={{color: colors.textMain}}
                        >
                            <option value="tech">Technology</option>
                            <option value="medical">Medical</option>
                            <option value="law">Law</option>
                            <option value="finance">Finance</option>
                            <option value="education">Education</option>
                            <option value="design">Design</option>
                            <option value="management">Management</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Skills Input */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">
                            Skills to Master
                        </label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                placeholder="e.g. React, Docker, System Design"
                                className="flex-1 p-4 border border-slate-100 rounded-xl focus:outline-none"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                style={{color: colors.textMain}}
                            />
                            <button
                                type="button"
                                onClick={handleAddSkill}
                                className="p-4 rounded-xl text-white transition-transform active:scale-95"
                                style={{ backgroundColor: colors.textMain }}
                            >
                                <Plus size={24} />
                            </button>
                        </div>

                        {/* Skill Tags */}
                        <div className="flex flex-wrap gap-2">
                            {formData.specificSkills.map((skill) => (
                                <span
                                    key={skill}
                                    className="flex items-center gap-2 px-3 py-2  rounded-lg text-xs font-bold text-slate-600"
                                >
                                    {skill}
                                    <X
                                        size={14}
                                        className="cursor-pointer hover:text-red-500"
                                        onClick={() => removeSkill(skill)}
                                    />
                                </span>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-2xl text-white font-bold text-sm uppercase tracking-[0.2em] shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        style={{ backgroundColor: colors.primary }}
                    >
                        {loading ? 'Generating Roadmap...' : 'Generate Personalized Path'}
                        {!loading && <Sparkles size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetTarget;
