import ResumeParsed from '../../models/resumeParsed.model.js';
import Opportunity from '../../models/opportunity.model.js';
import SkillGapReport from '../../models/skillGapReport.model.js';
import apiError from '../../utils/apiError.js';
import { normalizeSkill } from '../../utils/skillNormalizer.js';
import { queryGemini } from '../../utils/geminiClient.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';
import { matchingPrompt } from './matchingPrompt.js';

const REPORT_TTL_HOURS = 24;

export const generateSkillGapReport = async (userId, opportunityId) => {
    const ttlCutoff = new Date(Date.now() - REPORT_TTL_HOURS * 60 * 60 * 1000);

    const existing = await SkillGapReport.findOne({
        user: userId,
        opportunity: opportunityId,
        createdAt: { $gte: ttlCutoff },
    })
        .sort({ createdAt: -1 })
        .lean();

    if (existing) return existing;

    const [resume, opportunity] = await Promise.all([
        ResumeParsed.findOne({ user: userId }).sort({ resumeVersion: -1 }).lean(),
        Opportunity.findById(opportunityId).lean(),
    ]);

    if (!resume) throw new apiError(404, 'Resume not found. Please upload your resume first.');
    if (!opportunity) throw new apiError(404, 'Opportunity not found.');
    if (!opportunity.isActive) throw new apiError(410, 'This opportunity is no longer active.');

    const resumeSkillSet = new Set((resume.skills ?? []).map((s) => normalizeSkill(s.name)));

    const requiredSkills = opportunity.requiredSkills ?? [];

    if (!requiredSkills.length) {
        return _saveReport(userId, opportunityId, 100, [], []);
    }

    const matchedSkills = [];
    const initialMissing = [];

    for (const skill of requiredSkills) {
        if (resumeSkillSet.has(normalizeSkill(skill))) {
            matchedSkills.push(skill);
        } else {
            initialMissing.push(skill);
        }
    }

    const resumeCategories = new Set(
        (resume.categories ?? []).map((c) => c.name?.toLowerCase().trim())
    );
    const categoryMatched = resumeCategories.has(opportunity.category?.toLowerCase());
    const CATEGORY_MISMATCH_CAP = 60;

    let finalMatched = [...matchedSkills];
    let finalMissing = [...initialMissing];

    if (initialMissing.length > 0) {
        try {
            const prompt = matchingPrompt(Array.from(resumeSkillSet), initialMissing);
            const raw = await queryGemini(prompt);
            const parsed = safeJsonParse(raw);

            if (parsed && typeof parsed === 'object') {
                const aiNewMatches = Array.isArray(parsed.newMatches) ? parsed.newMatches : [];
                const aiStillMissing = Array.isArray(parsed.stillMissing)
                    ? parsed.stillMissing
                    : initialMissing;

                const validJobSkillSet = new Set(requiredSkills.map((s) => normalizeSkill(s)));
                const verifiedNewMatches = aiNewMatches.filter((s) =>
                    validJobSkillSet.has(normalizeSkill(s))
                );

                finalMatched = [...new Set([...matchedSkills, ...verifiedNewMatches])];
                finalMissing = aiStillMissing;
            }
        } catch (err) {
            console.error('[SkillGap] Semantic matching failed:', err.message);
        }
    }

    let matchPercentage = Math.round((finalMatched.length / requiredSkills.length) * 100);

    if (!categoryMatched) {
        matchPercentage = Math.min(matchPercentage, CATEGORY_MISMATCH_CAP);
    }

    return _saveReport(userId, opportunityId, matchPercentage, finalMatched, finalMissing);
};

const _saveReport = async (
    userId,
    opportunityId,
    matchPercentage,
    matchedSkills,
    missingSkills
) => {
    try {
        return await SkillGapReport.create({
            user: userId,
            opportunity: opportunityId,
            matchPercentage: Math.min(100, Math.max(0, matchPercentage)),
            matchedSkills,
            missingSkills,
        });
    } catch (err) {
        throw new apiError(500, 'Failed to save skill gap report.');
    }
};
