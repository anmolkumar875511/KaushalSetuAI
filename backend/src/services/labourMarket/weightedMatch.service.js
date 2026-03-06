import SkillDemand from '../../models/skillDemand.model.js';

export const calculateWeightedMatch = async ({ resumeSkills, jobSkills, region }) => {
    const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase()));

    const normalizedJobSkills = jobSkills.map((s) => s.toLowerCase());

    const matchedSkills = normalizedJobSkills.filter((skill) => resumeSet.has(skill));

    const missingSkills = normalizedJobSkills.filter((skill) => !resumeSet.has(skill));

    if (matchedSkills.length === 0) {
        return {
            weightedScore: 0,
            matchedSkills: [],
            missingSkills,
        };
    }

    const demandDocs = await SkillDemand.find({
        skill: { $in: matchedSkills },
        region,
    });

    const demandMap = {};

    demandDocs.forEach((doc) => {
        demandMap[doc.skill.toLowerCase()] = doc.demandScore;
    });

    let demandWeight = 0;

    for (const skill of matchedSkills) {
        demandWeight += demandMap[skill] || 0.5;
    }

    demandWeight = demandWeight / matchedSkills.length;

    const skillCoverage = matchedSkills.length / normalizedJobSkills.length;

    const weightedScore = (demandWeight * 0.6 + skillCoverage * 0.4) * 100;

    return {
        weightedScore: Math.round(weightedScore),
        matchedSkills,
        missingSkills,
    };
};
