import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { Target, Sparkles, Plus, X, Loader2, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';
import { toast } from 'sonner';

const CATEGORIES = [
    { value: 'tech', label: 'Technology' },
    { value: 'medical', label: 'Medical' },
    { value: 'law', label: 'Law' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'design', label: 'Design' },
    { value: 'management', label: 'Management' },
    { value: 'other', label: 'Other' },
];

const SetTarget = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    const [loading, setLoading] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [formData, setFormData] = useState({
        targetRole: '',
        category: 'tech',
        specificSkills: [],
    });

    const handleAddSkill = (e) => {
        e?.preventDefault();
        const trimmed = skillInput.trim();
        if (trimmed && !formData.specificSkills.includes(trimmed)) {
            setFormData((p) => ({ ...p, specificSkills: [...p.specificSkills, trimmed] }));
            setSkillInput('');
        }
    };

    const removeSkill = (skill) =>
        setFormData((p) => ({ ...p, specificSkills: p.specificSkills.filter((s) => s !== skill) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.specificSkills.length === 0)
            return toast.warning('Please add at least one skill');
        setLoading(true);
        try {
            const res = await axiosInstance.post('/roadmap/custom-target', formData);
            const newRoadmapId = res.data.data.roadmap._id;
            navigate(`/roadmap/${newRoadmapId}`);
        } catch (err) {
            console.error('Failed to generate target roadmap', err);
            toast.error('Failed to generate roadmap — please try again');
        } finally {
            setLoading(false);
        }
    };

    /* ── Shared ── */
    const labelStyle = {
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        display: 'block',
        marginBottom: 6,
    };

    const inputStyle = {
        width: '100%',
        padding: '0.7rem 0.875rem',
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        backgroundColor: colors.bgMuted,
        color: colors.textMain,
        fontSize: '0.875rem',
        outline: 'none',
        fontFamily: font.body,
        boxSizing: 'border-box',
        transition: transition.fast,
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: colors.bgPage,
                fontFamily: font.body,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1.25rem',
            }}
        >
            <GlobalStyles colors={colors} font={font} />

            <div style={{ width: '100%', maxWidth: 520 }}>
                {/* ── HEADER ── */}
                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: '2rem',
                        animation: 'fadeUp 0.3s ease',
                    }}
                >
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: radius.md,
                            backgroundColor: `${colors.primary}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                        }}
                    >
                        <Target size={20} style={{ color: colors.primary }} />
                    </div>
                    <h1
                        style={{
                            fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
                            fontWeight: 700,
                            color: colors.textOnBg,
                            fontFamily: font.display,
                            margin: 0,
                            marginBottom: 6,
                        }}
                    >
                        Set Your Target
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: colors.textSub, margin: 0 }}>
                        Define your goal, and we'll build the path to get there.
                    </p>
                </div>

                {/* ── FORM ── */}
                <form
                    onSubmit={handleSubmit}
                    style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.lg,
                        backgroundColor: colors.bgCard,
                        padding: 'clamp(1.5rem, 4vw, 2rem)',
                        boxShadow: shadow.sm,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                        animation: 'fadeUp 0.3s ease 0.06s both',
                    }}
                >
                    {/* Target Role */}
                    <div>
                        <label style={labelStyle}>Target Role / Goal</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Senior Frontend Developer"
                            value={formData.targetRole}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, targetRole: e.target.value }))
                            }
                            style={inputStyle}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label style={labelStyle}>Category</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData((p) => ({ ...p, category: e.target.value }))
                                }
                                style={{
                                    ...inputStyle,
                                    appearance: 'none',
                                    paddingRight: '2rem',
                                    cursor: 'pointer',
                                }}
                            >
                                {CATEGORIES.map(({ value, label }) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={12}
                                style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: colors.textSub,
                                    pointerEvents: 'none',
                                }}
                            />
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <label style={labelStyle}>Skills to Master</label>

                        {/* Input row */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                            <input
                                type="text"
                                placeholder="e.g. React, Docker, System Design"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                style={{ ...inputStyle, flex: 1, width: 'auto' }}
                            />
                            <button
                                type="button"
                                onClick={handleAddSkill}
                                className="add-skill-btn"
                                style={{
                                    width: 38,
                                    height: 38,
                                    flexShrink: 0,
                                    backgroundColor: colors.primary,
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: radius.md,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: transition.fast,
                                }}
                            >
                                <Plus size={15} />
                            </button>
                        </div>

                        {/* Skill tags */}
                        {formData.specificSkills.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                {formData.specificSkills.map((skill) => (
                                    <span
                                        key={skill}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            padding: '0.25rem 0.625rem',
                                            borderRadius: radius.full,
                                            border: `1px solid ${colors.border}`,
                                            backgroundColor: colors.bgMuted,
                                            color: colors.textMain,
                                            fontSize: '0.72rem',
                                            fontWeight: 500,
                                            fontFamily: font.body,
                                        }}
                                    >
                                        {skill}
                                        <X
                                            size={11}
                                            onClick={() => removeSkill(skill)}
                                            className="skill-remove"
                                            style={{
                                                cursor: 'pointer',
                                                color: colors.textSub,
                                                flexShrink: 0,
                                            }}
                                        />
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-btn"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: loading ? colors.border : colors.primary,
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: radius.md,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: transition.fast,
                            fontFamily: font.body,
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={14}
                                    style={{ animation: 'spin 1s linear infinite' }}
                                />{' '}
                                Generating…
                            </>
                        ) : (
                            <>
                                Generate Personalized Path <Sparkles size={14} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors, font }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: ${colors.textMuted}; }
        input:focus, select:focus { border-color: ${colors.borderFocus} !important; box-shadow: 0 0 0 3px ${colors.primary}18 !important; }
        .add-skill-btn:hover  { opacity: 0.88 !important; }
        .skill-remove:hover   { color: ${colors.danger} !important; }
        .submit-btn:hover:not(:disabled) { opacity: 0.88 !important; }
        @media (max-width: 480px) { input, select { font-size: 16px !important; } }
    `}</style>
);

export default SetTarget;
