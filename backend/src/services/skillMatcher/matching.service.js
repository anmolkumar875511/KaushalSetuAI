import ResumeParsed from '../../models/resumeParsed.model.js';
import Opportunity from '../../models/opportunity.model.js';
import SkillGapReport from '../../models/skillGapReport.model.js';
import apiError from '../../utils/apiError.js';
import { normalizeSkill } from '../../utils/skillNormalizer.js';
import { queryGroq } from '../../utils/groqClient.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';
import { matchingPrompt } from './matchingPrompt.js';

export const generateSkillGapReport = async (userId, opportunityId) => {
    const resume = await ResumeParsed.findOne({ user: userId }).sort({
        resumeVersion: -1,
    });
    const opportunity = await Opportunity.findById(opportunityId);

    if (!resume) throw new apiError(404, 'Resume is not available.');
    if (!opportunity) throw new apiError(404, 'Opportunity is unavailable.');

    const resumeCategories = resume.categories.map((c) => c.name.toLowerCase());
    const isCategoryMatched = resumeCategories.includes(opportunity.category.toLowerCase());

    if (!isCategoryMatched) {
        const report = await SkillGapReport.create({
            user: userId,
            opportunity: opportunityId,
            matchPercentage: 0,
            matchedSkills: [],
            missingSkills: opportunity.requiredSkills,
        });
        return report;
    }

    const userSkillSet = new Set(resume.skills.map((s) => normalizeSkill(s.name)));

    let matchedSkills = [];
    let initialMissing = [];

    opportunity.requiredSkills.forEach((skill) => {
        if (userSkillSet.has(normalizeSkill(skill))) {
            matchedSkills.push(skill);
        } else {
            initialMissing.push(skill);
        }
    });

    let finalMissing = [...initialMissing];

    if (initialMissing.length > 0) {
        try {
            const prompt = matchingPrompt(Array.from(userSkillSet), initialMissing);
            const raw = await queryGroq(prompt);
            const parsed = safeJsonParse(raw);

            if (parsed) {
                matchedSkills = [...new Set([...matchedSkills, ...(parsed.newMatches || [])])];
                finalMissing = parsed.stillMissing || [];
            }
        } catch (err) {
            console.error('Groq semantic matching failed:', err.message);
        }
    }

    const totalRequired = opportunity.requiredSkills.length;
    const matchPercentage =
        totalRequired === 0 ? 100 : Math.round((matchedSkills.length / totalRequired) * 100);

    try {
        const report = await SkillGapReport.create({
            user: userId,
            opportunity: opportunityId,
            matchPercentage,
            matchedSkills,
            missingSkills: finalMissing,
        });
        return report;
    } catch (err) {
        throw new apiError(500, 'Error saving skill gap report');
    }
};
