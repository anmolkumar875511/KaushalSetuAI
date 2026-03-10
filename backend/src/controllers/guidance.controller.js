import JobReadinessReport from '../models/jobReadinessReport.model.js';
import InterestGuide from '../models/interestGuide.model.js';
import FreelanceGuide from '../models/freelanceGuide.model.js';
import ResumeParsed from '../models/resumeParsed.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';
import { generateJobReadiness } from '../services/jobReadinessReport/jobReadiness.service.js';
import { generateInterestGuide } from '../services/interestGuide/interestGuide.service.js';
import { generateFreelanceGuide } from '../services/freelanceGuide/freelanceGuide.service.js';
import { logger } from '../utils/logger.js';

export const createJobReadinessReport = asyncHandler(async (req, res) => {
    const { interest } = req.body;
    const userId = req.user._id;

    const resume = await ResumeParsed.findOne({
        user: req.user._id,
    }).sort({ createdAt: -1 });

    const resumeId = resume ? resume._id : null;

    if (!resumeId || !interest) {
        throw new apiError(400, 'resumeId and interest are required');
    }

    if (!resume) {
        throw new apiError(404, 'Resume not found');
    }

    const report = await generateJobReadiness(userId, resumeId, resume, interest);

    if (!report) {
        throw new apiError(500, 'Unable to generate job readiness report');
    }

    await logger({
        level: 'info',
        action: 'JOB_READINESS_GENERATE',
        message: `User ${req.user.email} generated job readiness report`,
        req,
    });

    return res
        .status(201)
        .json(new apiResponse(201, 'Job readiness report generated successfully', report));
});

export const getJobReadinessReports = asyncHandler(async (req, res) => {
    const reports = await JobReadinessReport.find({
        user: req.user._id,
    })
        .populate('resume')
        .sort({ createdAt: -1 });

    if (reports.length === 0) {
        return res.status(200).json(new apiResponse(200, 'No job readiness reports found', []));
    }

    return res
        .status(200)
        .json(new apiResponse(200, 'Job readiness reports fetched successfully', reports));
});

export const createInterestGuide = asyncHandler(async (req, res) => {
    const { interest } = req.body;
    const userId = req.user._id;

    if (!interest) {
        throw new apiError(400, 'Interest is required');
    }

    const guide = await generateInterestGuide(userId, interest);

    if (!guide) {
        throw new apiError(500, 'Unable to generate interest guide');
    }

    await logger({
        level: 'info',
        action: 'INTEREST_GUIDE_GENERATE',
        message: `User ${req.user.email} generated interest guide for ${interest}`,
        req,
    });

    return res
        .status(201)
        .json(new apiResponse(201, 'Interest guide generated successfully', guide));
});

export const getInterestGuides = asyncHandler(async (req, res) => {
    const guides = await InterestGuide.find({
        user: req.user._id,
    }).sort({ createdAt: -1 });

    if (guides.length === 0) {
        return res.status(200).json(new apiResponse(200, 'No interest guides found', []));
    }

    return res
        .status(200)
        .json(new apiResponse(200, 'Interest guides fetched successfully', guides));
});

export const createFreelanceGuide = asyncHandler(async (req, res) => {
    const { interest } = req.body;
    const userId = req.user._id;

    if (!interest) {
        throw new apiError(400, 'Interest is required');
    }

    const guide = await generateFreelanceGuide(userId, interest);

    if (!guide) {
        throw new apiError(500, 'Unable to generate freelance guide');
    }

    await logger({
        level: 'info',
        action: 'FREELANCE_GUIDE_GENERATE',
        message: `User ${req.user.email} generated freelance guide for ${interest}`,
        req,
    });

    return res
        .status(201)
        .json(new apiResponse(201, 'Freelance guide generated successfully', guide));
});

export const getFreelanceGuides = asyncHandler(async (req, res) => {
    const guides = await FreelanceGuide.find({
        user: req.user._id,
    }).sort({ createdAt: -1 });

    if (guides.length === 0) {
        return res.status(200).json(new apiResponse(200, 'No freelance guides found', []));
    }

    return res
        .status(200)
        .json(new apiResponse(200, 'Freelance guides fetched successfully', guides));
});
