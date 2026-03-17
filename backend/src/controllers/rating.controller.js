import UserRating, { getTierForRating, RATING_TIERS } from '../models/userRating.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';

export const getMyRating = asyncHandler(async (req, res) => {
    const record = await UserRating.findOne({ user: req.user._id }).select('-history').lean();

    if (!record) {
        const defaultRating = 1500;
        return res.status(200).json(
            new apiResponse(200, 'Rating fetched', {
                currentRating: defaultRating,
                peakRating: defaultRating,
                totalAssessments: 0,
                tier: getTierForRating(defaultRating),
                history: [],
            })
        );
    }

    return res.status(200).json(
        new apiResponse(200, 'Rating fetched', {
            currentRating: record.currentRating,
            peakRating: record.peakRating,
            totalAssessments: record.totalAssessments,
            tier: getTierForRating(record.currentRating),
        })
    );
});

export const getMyRatingHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    const record = await UserRating.findOne({ user: req.user._id }).lean();
    if (!record) {
        return res.status(200).json(
            new apiResponse(200, 'Rating history fetched', {
                history: [],
                total: 0,
                currentPage: 1,
                totalPages: 0,
            })
        );
    }

    const allHistory = [...record.history].reverse();
    const total = allHistory.length;
    const start = (Number(page) - 1) * Number(limit);
    const paginated = allHistory.slice(start, start + Number(limit));

    return res.status(200).json(
        new apiResponse(200, 'Rating history fetched', {
            history: paginated,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
        })
    );
});

export const getRatingTiers = asyncHandler(async (req, res) => {
    return res.status(200).json(new apiResponse(200, 'Tiers fetched', RATING_TIERS));
});
