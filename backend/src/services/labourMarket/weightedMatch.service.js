import SkillDemand from '../../models/skillDemand.model.js';

export const calculateWeightedMatch = async ({ resumeSkills, jobSkills, region }) => {
    const resumeSet = new Set(
        (resumeSkills || [])
            .filter((s) => typeof s.name === 'string')
            .map((s) => s.name.toLowerCase().trim())
    );

    const normalizedJobSkills = (jobSkills || [])
        .filter((s) => typeof s === 'string')
        .map((s) => s.toLowerCase().trim());

    const matchedSkills = normalizedJobSkills.filter((skill) => resumeSet.has(skill));

    const missingSkills = normalizedJobSkills.filter((skill) => !resumeSet.has(skill));

    if (matchedSkills.length === 0) {
        return {
            weightedScore: 0,
            matchedSkills: [],
            missingSkills,
            skillCoverage: 0,
            demandWeight: 0,
        };
    }

    const demandDocs = await SkillDemand.find({
        skill: { $in: matchedSkills.map((s) => new RegExp(`^${s}$`, 'i')) },
        region,
    });

    const demandMap = {};

    demandDocs.forEach((doc) => {
        demandMap[doc.skill.toLowerCase()] = doc.demandScore / 100;
    });

    const DEFAULT_DEMAND_SCORE = 0.6;

    let demandWeight = 0;

    for (const skill of matchedSkills) {
        demandWeight += demandMap[skill] ?? DEFAULT_DEMAND_SCORE;
    }

    demandWeight = demandWeight / matchedSkills.length;

    const skillCoverage = matchedSkills.length / normalizedJobSkills.length;

    const weightedScore = (skillCoverage * 0.5 + demandWeight * 0.5) * 100;

    return {
        weightedScore: Math.round(weightedScore),
        matchedSkills,
        missingSkills,
        skillCoverage,
        demandWeight,
    };
};
