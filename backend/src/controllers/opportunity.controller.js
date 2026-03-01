import Opportunity from '../models/opportunity.model.js';
import ResumeParsed from '../models/resumeParsed.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';

export const getOpportunity = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        throw new apiError(401, 'Unauthorized');
    }

    const resume = await ResumeParsed.findOne({ user: userId }).sort({
        createdAt: -1,
    });

    if (!resume || !resume.categories || resume.categories.length === 0) {
        const opportunities = await Opportunity.find().sort({ createdAt: -1 }).limit(50);

        return res
            .status(200)
            .json(new apiResponse(200, 'Upload resume for personalized results', opportunities));
    }

    const categoryNames = resume.categories.map((cat) => cat.name);

    const matchedOpportunities = await Opportunity.find({
        category: { $in: categoryNames },
    })
        .sort({ createdAt: -1 })
        .limit(50);

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                `Opportunities for ${categoryNames.join(', ')} fetched`,
                matchedOpportunities
            )
        );
});
