import React, { useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { ResumeContext } from '../context/ResumeContext';
import { Code2, Briefcase, GraduationCap, Laptop, Check, Pencil } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const ConfirmResume = () => {
    const [isEdit, setIsEdit] = useState(false);
    const [skills, setSkills] = useState([]);
    const [education, setEducation] = useState([]);
    const [experience, setExperience] = useState([]);
    const [projects, setProjects] = useState([]);
    const [id, setId] = useState('');

    const { user } = useContext(AuthContext);
    const { colors, font, radius, shadow, transition } = getThemeColors(user?.theme || 'light');

    const { resume, fetchResume } = useContext(ResumeContext);

    useEffect(() => {
        fetchResume();
    }, []);

    useEffect(() => {
        if (resume && Object.keys(resume).length > 0) {
            setSkills(resume.skills || []);
            setEducation(resume.education || []);
            setExperience(resume.experience || []);
            setProjects(resume.projects || []);
            setId(resume._id || '');
        }
    }, [resume]);

    const updateData = async () => {
        try {
            await axiosInstance.put(`/resume/${id}`, { skills, education, experience, projects });
            await fetchResume();
            setIsEdit(false);
        } catch (err) {
            console.error(err);
        }
    };

    /* ── SHARED ── */
    const labelStyle = {
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: colors.textSub,
        fontFamily: font.mono,
        margin: 0,
    };

    const sectionStyle = {
        border: `1px solid ${colors.border}`,
        borderRadius: radius.lg,
        backgroundColor: colors.bgCard,
        padding: '1.25rem',
        boxShadow: shadow.sm,
    };

    const inputStyle = {
        width: '100%',
        padding: '0.5rem 0.625rem',
        border: `1px solid ${colors.border}`,
        borderRadius: radius.sm,
        backgroundColor: colors.bgMuted,
        color: colors.textMain,
        fontSize: '0.8rem',
        outline: 'none',
        fontFamily: font.body,
        boxSizing: 'border-box',
        transition: transition.fast,
    };

    const sectionHeaderStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: '1rem',
    };

    const sectionTitleStyle = {
        fontSize: '0.875rem',
        fontWeight: 700,
        color: colors.textMain,
        margin: 0,
    };

    /* ════════════════════════════════════════
       RENDER
    ════════════════════════════════════════ */
    return (
        <div
            style={{
                width: '100%',
                maxWidth: 1080,
                margin: '0 auto',
                paddingBottom: '5rem',
                fontFamily: font.body,
                animation: 'fadeUp 0.3s ease',
            }}
        >
            <GlobalStyles colors={colors} font={font} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* ══ SKILLS ══ */}
                <section style={sectionStyle}>
                    <div style={sectionHeaderStyle}>
                        <Code2 size={15} style={{ color: colors.primary }} />
                        <h3 style={sectionTitleStyle}>Technical Skills</h3>
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                            gap: '0.5rem',
                            maxHeight: 240,
                            overflowY: 'auto',
                            paddingRight: 4,
                        }}
                        className="custom-scrollbar"
                    >
                        {skills.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '0.625rem 0.75rem',
                                    borderRadius: radius.md,
                                    backgroundColor: colors.bgMuted,
                                    border: `1px solid ${colors.border}`,
                                }}
                            >
                                {isEdit ? (
                                    <div
                                        style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                                    >
                                        <input
                                            style={inputStyle}
                                            value={item.name}
                                            placeholder="Skill name"
                                            onChange={(e) =>
                                                setSkills((prev) =>
                                                    prev.map((s, i) =>
                                                        i === index
                                                            ? { ...s, name: e.target.value }
                                                            : s
                                                    )
                                                )
                                            }
                                        />
                                        <input
                                            style={{ ...inputStyle, fontSize: '0.7rem' }}
                                            value={item.level}
                                            placeholder="Level"
                                            onChange={(e) =>
                                                setSkills((prev) =>
                                                    prev.map((s, i) =>
                                                        i === index
                                                            ? { ...s, level: e.target.value }
                                                            : s
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <p
                                            style={{
                                                ...labelStyle,
                                                color: colors.secondary,
                                                marginBottom: 3,
                                            }}
                                        >
                                            {item.level}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                color: colors.textMain,
                                                margin: 0,
                                            }}
                                        >
                                            {item.name}
                                        </p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══ PROJECTS + EXPERIENCE + EDUCATION ══ */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '0.75rem',
                    }}
                >
                    {/* ── PROJECTS ── */}
                    <section style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <Laptop size={15} style={{ color: colors.primary }} />
                            <h3 style={sectionTitleStyle}>Key Projects</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {projects.map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: radius.md,
                                        border: `1px solid ${colors.border}`,
                                        backgroundColor: colors.bgMuted,
                                    }}
                                >
                                    {isEdit ? (
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 6,
                                            }}
                                        >
                                            <input
                                                style={inputStyle}
                                                value={item.title}
                                                placeholder="Project title"
                                                onChange={(e) =>
                                                    setProjects((prev) =>
                                                        prev.map((p, i) =>
                                                            i === index
                                                                ? { ...p, title: e.target.value }
                                                                : p
                                                        )
                                                    )
                                                }
                                            />
                                            <textarea
                                                style={{
                                                    ...inputStyle,
                                                    height: 72,
                                                    resize: 'none',
                                                    lineHeight: 1.5,
                                                }}
                                                value={item.description}
                                                placeholder="Description"
                                                onChange={(e) =>
                                                    setProjects((prev) =>
                                                        prev.map((p, i) =>
                                                            i === index
                                                                ? {
                                                                      ...p,
                                                                      description: e.target.value,
                                                                  }
                                                                : p
                                                        )
                                                    )
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <p
                                                style={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    color: colors.textMain,
                                                    margin: 0,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {item.title}
                                            </p>
                                            <p
                                                style={{
                                                    fontSize: '0.75rem',
                                                    color: colors.textSub,
                                                    lineHeight: 1.55,
                                                    margin: 0,
                                                }}
                                            >
                                                {item.description}
                                            </p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── EXPERIENCE + EDUCATION stacked ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* ── EXPERIENCE ── */}
                        <section style={sectionStyle}>
                            <div style={sectionHeaderStyle}>
                                <Briefcase size={15} style={{ color: colors.primary }} />
                                <h3 style={sectionTitleStyle}>Professional Experience</h3>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.625rem',
                                }}
                            >
                                {experience.map((item, index) => (
                                    <div key={index}>
                                        {isEdit ? (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 4,
                                                }}
                                            >
                                                <input
                                                    style={inputStyle}
                                                    value={item.role}
                                                    placeholder="Role"
                                                    onChange={(e) =>
                                                        setExperience((prev) =>
                                                            prev.map((ex, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...ex,
                                                                          role: e.target.value,
                                                                      }
                                                                    : ex
                                                            )
                                                        )
                                                    }
                                                />
                                                <input
                                                    style={inputStyle}
                                                    value={item.company}
                                                    placeholder="Company"
                                                    onChange={(e) =>
                                                        setExperience((prev) =>
                                                            prev.map((ex, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...ex,
                                                                          company: e.target.value,
                                                                      }
                                                                    : ex
                                                            )
                                                        )
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 2,
                                                    paddingBottom: '0.5rem',
                                                    borderBottom: `1px solid ${colors.border}`,
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        fontSize: '0.825rem',
                                                        fontWeight: 600,
                                                        color: colors.textMain,
                                                        margin: 0,
                                                    }}
                                                >
                                                    {item.role}
                                                </p>
                                                <p
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        color: colors.primary,
                                                        margin: 0,
                                                    }}
                                                >
                                                    {item.company}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ── EDUCATION ── */}
                        <section style={sectionStyle}>
                            <div style={sectionHeaderStyle}>
                                <GraduationCap size={15} style={{ color: colors.primary }} />
                                <h3 style={sectionTitleStyle}>Academic Background</h3>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.625rem',
                                }}
                            >
                                {education.map((item, index) => (
                                    <div key={index}>
                                        {isEdit ? (
                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: 6,
                                                }}
                                            >
                                                <input
                                                    style={inputStyle}
                                                    value={item.degree}
                                                    placeholder="Degree"
                                                    onChange={(e) =>
                                                        setEducation((prev) =>
                                                            prev.map((ed, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...ed,
                                                                          degree: e.target.value,
                                                                      }
                                                                    : ed
                                                            )
                                                        )
                                                    }
                                                />
                                                <input
                                                    style={inputStyle}
                                                    value={item.institute}
                                                    placeholder="Institute"
                                                    onChange={(e) =>
                                                        setEducation((prev) =>
                                                            prev.map((ed, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...ed,
                                                                          institute: e.target.value,
                                                                      }
                                                                    : ed
                                                            )
                                                        )
                                                    }
                                                />
                                                <input
                                                    style={{ ...inputStyle, gridColumn: '1 / -1' }}
                                                    value={item.year}
                                                    placeholder="Year"
                                                    onChange={(e) =>
                                                        setEducation((prev) =>
                                                            prev.map((ed, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...ed,
                                                                          year: e.target.value,
                                                                      }
                                                                    : ed
                                                            )
                                                        )
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '0.75rem',
                                                    paddingBottom: '0.5rem',
                                                    borderBottom: `1px solid ${colors.border}`,
                                                }}
                                            >
                                                <div>
                                                    <p
                                                        style={{
                                                            fontSize: '0.825rem',
                                                            fontWeight: 600,
                                                            color: colors.textMain,
                                                            margin: 0,
                                                            marginBottom: 2,
                                                        }}
                                                    >
                                                        {item.degree}
                                                    </p>
                                                    <p
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            color: colors.primary,
                                                            margin: 0,
                                                        }}
                                                    >
                                                        {item.institute}
                                                    </p>
                                                </div>
                                                <span
                                                    style={{
                                                        padding: '0.2rem 0.5rem',
                                                        borderRadius: radius.sm,
                                                        backgroundColor: `${colors.primary}15`,
                                                        color: colors.primary,
                                                        fontSize: '0.65rem',
                                                        fontWeight: 600,
                                                        fontFamily: font.mono,
                                                        whiteSpace: 'nowrap',
                                                        letterSpacing: '0.06em',
                                                    }}
                                                >
                                                    {item.year}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* ── FLOATING ACTION BUTTON ── */}
            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50 }}>
                <button
                    onClick={() => (isEdit ? updateData() : setIsEdit(true))}
                    className="fab-btn"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '0.7rem 1.25rem',
                        borderRadius: radius.md,
                        border: 'none',
                        backgroundColor: isEdit ? colors.success : colors.primary,
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        boxShadow: shadow.md,
                        transition: transition.fast,
                        fontFamily: font.body,
                    }}
                >
                    {isEdit ? (
                        <>
                            <Check size={14} /> Save Changes
                        </>
                    ) : (
                        <>
                            <Pencil size={14} /> Edit Profile
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

/* ── GLOBAL STYLES ── */
const GlobalStyles = ({ colors, font }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder, textarea::placeholder { color: ${colors.textMuted}; }
        input:focus, textarea:focus { border-color: ${colors.borderFocus} !important; box-shadow: 0 0 0 3px ${colors.primary}18 !important; }
        .fab-btn:hover { opacity: 0.88 !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 10px; }
        @media (max-width: 480px) { input, textarea { font-size: 16px !important; } }
    `}</style>
);

export default ConfirmResume;
