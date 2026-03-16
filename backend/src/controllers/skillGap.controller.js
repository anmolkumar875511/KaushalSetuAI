import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateSkillGapReport } from '../services/skillMatcher/matching.service.js';
import { logger } from '../utils/logger.js';

export const getMatchAnalysis = asyncHandler(async (req, res) => {
    const { opportunityId } = req.params;

    if (!opportunityId) throw new apiError(400, 'Opportunity ID is required.');

    const report = await generateSkillGapReport(req.user._id, opportunityId);

    if (!report) throw new apiError(404, 'Skill gap report could not be generated.');

    await logger({
        level: 'info',
        action: 'SKILL_GAP_REPORT_FETCH',
        message: `User ${req.user.email} fetched skill gap report for opportunity ${opportunityId}`,
        req,
    });

    return res.status(200).json(new apiResponse(200, 'Skill gap report fetched', report));
});
