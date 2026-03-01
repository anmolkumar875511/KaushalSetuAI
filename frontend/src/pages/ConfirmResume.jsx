import React, { useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { ResumeContext } from '../context/ResumeContext';
import { Code2, Briefcase, GraduationCap, Laptop, Check, Pencil } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const ConfirmResume = ({}) => {
    const [isEdit, setIsEdit] = useState(false);
    const [skills, setSkills] = useState([]);
    const [education, setEducation] = useState([]);
    const [experience, setExperience] = useState([]);
    const [projects, setProjects] = useState([]);
    const [id, setId] = useState('');
    const {user} = useContext(AuthContext)
    const { colors } = getThemeColors(user?.theme || 'light');

    const { resume, fetchResume } = useContext(ResumeContext);

    // const fetchData = async () => {
    //   // const res = await axiosInstance.get(`/resume/${resumeId}`);
    //   // console.log(res.data);
    //   console.log(Resume)
    //   setSkills(Resume.skills);
    //   setEducation(Resume.education);
    //   setExperience(Resume.experience);
    //   setProjects(Resume.projects);
    //   console.log("Data Fetched Succesfully");
    // };

    useEffect(() => {
        fetchResume();
    }, []);

    const updateData = async () => {
        try {
            const res = await axiosInstance.put(`/resume/${id}`, {
                skills,
                education,
                experience,
                projects,
            });
            await fetchResume();
            setIsEdit(false);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (resume && Object.keys(resume).length > 0) {
            setSkills(resume.skills || []);
            setEducation(resume.education || []);
            setExperience(resume.experience || []);
            setProjects(resume.projects || []);
            setId(resume._id || '');
        }
    }, [resume]);

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* SKILLS SECTION - Clean Grid */}
            <section
                className=" border rounded-3xl p-8 shadow-sm"
                style={{ borderColor: colors.border }}
                
            >
                <div className="flex items-center gap-3 mb-6">
                    <Code2 size={20} style={{ color: colors.textMain }} />
                    <h3 className="text-xl font-bold" style={{ color: colors.textMain }}>
                        Technical Skills
                    </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                    {skills.map((item, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-xl  transition-all `}
                        >
                            {isEdit ? (
                                <div className="space-y-2">
                                    <input
                                        className="w-full  border rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:ring-1 focus:ring-orange-400"
                                        style={{color:colors.textMain}}
                                        value={item.name}
                                        onChange={(e) =>
                                            setSkills((prev) =>
                                                prev.map((s, i) =>
                                                    i === index ? { ...s, name: e.target.value } : s
                                                )
                                            )
                                        }
                                    />
                                    <input
                                        className="w-full  border rounded-lg px-2 py-1 text-[10px] outline-none"
                                        style={{color:colors.textMain}}
                                        value={item.level}
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
                                        className="text-[9px] font-bold uppercase tracking-wider mb-1"
                                        style={{ color: colors.secondary }}
                                    >
                                        {item.level}
                                    </p>
                                    <p
                                        className="text-sm font-bold"
                                        style={{ color: colors.textMain }}
                                    >
                                        {item.name}
                                    </p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* PROJECTS SECTION - Professional Blue Card */}
                <div
                    className="rounded-3xl p-8 text-white shadow-sm"
                    style={{ backgroundColor: colors.bgLight, color: colors.textMain }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Laptop size={20} className="opacity-80" />
                        <h3 className="text-lg font-bold">Key Projects</h3>
                    </div>
                    <div className="space-y-4">
                        {projects.map((item, index) => (
                            <div
                                key={index}
                                className="p-5 bg-white/10 rounded-2xl  "
                            >
                                {isEdit ? (
                                    <div className="space-y-3">
                                        <input
                                            className="w-full  rounded-lg p-2 outline-none border text-sm "
                                            style={{color: colors.textMain}}
                                            value={item.title}
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
                                            className="w-full bg-white/20 rounded-lg p-2 outline-none border   text-xs h-20 resize-none"
                                            value={item.description}
                                            style={{color: colors.textMain}}
                                            onChange={(e) =>
                                                setProjects((prev) =>
                                                    prev.map((p, i) =>
                                                        i === index
                                                            ? { ...p, description: e.target.value }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h4
                                            className="text-sm font-bold mb-2"
                                            style={{ color: colors.textMain }}
                                        >
                                            {item.title}
                                        </h4>
                                        <p
                                            className="text-xs leading-relaxed opacity-80"
                                            style={{ color: colors.primary }}
                                        >
                                            {item.description}
                                        </p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>


                <div className="space-y-8">
                    {/* EXPERIENCE SECTION - Decent & Muted */}
                    <div
                        className=" rounded-3xl p-8  shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Briefcase size={20} style={{ color: colors.textMain }} />
                            <h3
                                className="text-lg font-bold"
                                style={{ color: colors.textMain }}
                            >
                                Professional Experience
                            </h3>
                        </div>
                        <div className="space-y-5">
                            {experience.map((item, index) => (
                                <div
                                    key={index}
                                    
                                    
                                >
                                    {isEdit ? (
                                        <div className="space-y-2">
                                            <input
                                                className="w-full border rounded-lg p-2 text-xs"
                                                style={{ color: colors.textMain }}
                                                value={item.role}
                                                onChange={(e) =>
                                                    setExperience((prev) =>
                                                        prev.map((ex, i) =>
                                                            i === index
                                                                ? { ...ex, role: e.target.value }
                                                                : ex
                                                        )
                                                    )
                                                }
                                            />
                                            <input
                                                className="w-full border rounded-lg p-2 text-xs "
                                                value={item.company}
                                                style={{ color: colors.textMain }}
                                                onChange={(e) =>
                                                    setExperience((prev) =>
                                                        prev.map((ex, i) =>
                                                            i === index
                                                                ? { ...ex, company: e.target.value }
                                                                : ex
                                                        )
                                                    )
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <p
                                                className="text-sm font-bold"
                                                style={{ color: colors.textMain }}
                                            >
                                                {item.role}
                                            </p>
                                            <p
                                                className="text-xs "
                                                style={{ color: colors.primary }}
                                            >
                                                {item.company}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* EDUCATION SECTION - Balanced Orange Accent */}
                    <div
    className="rounded-3xl p-8 shadow-sm"
    style={{ backgroundColor: colors.bgLight, color: colors.textMain }}
>
    <div className="flex items-center gap-3 mb-6">
        <GraduationCap size={20} className="opacity-80" />
        <h3 className="text-lg font-bold">Academic Background</h3>
    </div>

    {/* Added space-y-4 to separate multiple education entries */}
    <div className="space-y-6">
        {education.map((item, index) => (
            <div key={index} className="w-full">
                {isEdit ? (
                    /* EDIT MODE: Improved grid alignment and input borders */
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            className="border rounded-lg p-2 text-xs bg-transparent"
                            value={item.degree}
                            style={{ color: colors.textMain, borderColor: `${colors.textMain}33` }} // 33 is ~20% opacity
                            onChange={(e) =>
                                setEducation((prev) =>
                                    prev.map((ed, i) =>
                                        i === index ? { ...ed, degree: e.target.value } : ed
                                    )
                                )
                            }
                        />
                        <input
                            className="border rounded-lg p-2 text-xs bg-transparent"
                            value={item.institute}
                            style={{ color: colors.textMain, borderColor: `${colors.textMain}33` }}
                            onChange={(e) =>
                                setEducation((prev) =>
                                    prev.map((ed, i) =>
                                        i === index ? { ...ed, institute: e.target.value } : ed
                                    )
                                )
                            }
                        />
                        <input
                            className="border rounded-lg p-2 text-xs bg-transparent col-span-2"
                            value={item.year}
                            style={{ color: colors.textMain, borderColor: `${colors.textMain}33` }}
                            onChange={(e) =>
                                setEducation((prev) =>
                                    prev.map((ed, i) =>
                                        i === index ? { ...ed, year: e.target.value } : ed
                                    )
                                )
                            }
                        />
                    </div>
                ) : (
                    /* VIEW MODE: Better vertical alignment and flex distribution */
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex-1">
                            <p 
                                className="text-sm font-bold leading-tight"
                                style={{ color: colors.textMain }}
                            >
                                {item.degree}
                            </p>
                            <p
                                className="text-xs opacity-80 mt-1"
                                style={{ color: colors.primary }}
                            >
                                {item.institute}
                            </p>
                        </div>
                        <span 
                            className="whitespace-nowrap px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0"
                            style={{ backgroundColor: `${colors.textMain}15` }} // Logic: using 15% opacity of text color for badge
                        >
                            {item.year}
                        </span>
                    </div>
                )}
            </div>
        ))}
    </div>
</div>
                </div>
            </div>

            {/* FLOATING ACTION BUTTON - Decent & Fixed */}
            <div className="fixed bottom-10 right-10 z-50">
                <button
                    onClick={() => (isEdit ? updateData() : setIsEdit(true))}
                    className="flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-white shadow-lg hover:opacity-90 active:scale-95 transition-all text-xs uppercase tracking-widest"
                    style={{
                        backgroundColor: isEdit ? '#10b981' : colors.textMain,
                    }}
                >
                    <span>{isEdit ? 'Save Changes' : 'Edit Profile'}</span>
                    {isEdit ? <Check size={16} /> : <Pencil size={16} />}
                </button>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `,
                }}
            />
        </div>
    );
};

export default ConfirmResume;
