import TargetSkill from '../../models/targetSkill.model.js';
import ResumeParsed from '../../models/resumeParsed.model.js';
import SkillGapReport from '../../models/skillGapReport.model.js';
import LearningRoadmap from '../../models/learningRoadmap.model.js';
import Opportunity from '../../models/opportunity.model.js';
import apiError from '../../utils/apiError.js';
import { queryGroq } from '../../utils/groqClient.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';
import { roadmapPrompt } from './roadmapPrompt.js';

export const generateRoadmap = async (userId, opportunityId) => {
    const report = await SkillGapReport.findOne({
        user: userId,
        opportunity: opportunityId,
    }).sort({ createdAt: -1 });
    const job = await Opportunity.findById(opportunityId);

    if (!report) throw new apiError(404, 'Skill Gap Report not found. Analyze skills first.');
    if (!job) throw new apiError(404, 'Opportunity details missing.');

    try {
        const prompt = roadmapPrompt(report.missingSkills, job.title, job.category);
        const raw = await queryGroq(prompt);
        const roadmapData = safeJsonParse(raw);

        if (!roadmapData) throw new Error('AI failed to return structured data');

        const trackableRoadmap = roadmapData.map((week) => ({
            ...week,
            tasks: week.tasks.map((taskDesc) => ({
                description: taskDesc,
                isCompleted: false,
            })),
        }));

        return await LearningRoadmap.create({
            user: userId,
            opportunity: opportunityId,
            roadmap: trackableRoadmap,
            progress: 0,
        });
    } catch (err) {
        throw new apiError(500, `Roadmap Error: ${err.message}`);
    }
};

export const generateCustomTargetRoadmap = async (userId, targetSkillId) => {
    const target = await TargetSkill.findById(targetSkillId);
    const userResume = await ResumeParsed.findOne({ user: userId }).sort({
        createdAt: -1,
    });

    const currentSkills = userResume ? userResume.skills.map((s) => s.name) : [];

    const prompt = roadmapPrompt(
        target.specificSkills,
        target.targetRole,
        target.category,
        currentSkills
    );

    try {
        const raw = await queryGroq(prompt);
        const roadmapData = safeJsonParse(raw);

        const trackableRoadmap = roadmapData.map((week) => ({
            ...week,
            tasks: week.tasks.map((taskDesc) => ({
                description: taskDesc,
                isCompleted: false,
            })),

            resources: week.resources.map((res) => ({
                title: res.title,
                url: res.url.startsWith('http')
                    ? res.url
                    : `https://www.youtube.com/results?search_query=${encodeURIComponent(res.title)}`,
            })),
        }));

        return await LearningRoadmap.create({
            user: userId,
            targetSkill: targetSkillId,
            roadmap: trackableRoadmap,
            progress: 0,
        });
    } catch (err) {
        throw new apiError(500, `Roadmap Generation Failed: ${err.message}`);
    }
};
