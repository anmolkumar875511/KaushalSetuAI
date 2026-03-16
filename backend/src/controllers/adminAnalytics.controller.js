import User from '../models/user.model.js';
import ResumeParsed from '../models/resumeParsed.model.js';
import SkillDemand from '../models/skillDemand.model.js';
import SkillGapReport from '../models/skillGapReport.model.js';
import LearningRoadmap from '../models/learningRoadmap.model.js';
import Opportunity from '../models/opportunity.model.js';
import Assessment from '../models/assessment.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiResponse from '../utils/apiResponse.js';

export const getUserGrowth = asyncHandler(async (req, res) => {
    const growth = await User.aggregate([
        { $match: { role: 'student' } },
        {
            $group: {
                _id: { $month: '$createdAt' },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 1,
                count: 1,
                users: '$count',
            },
        },
    ]);

    return res.status(200).json(new apiResponse(200, 'User growth fetched', growth));
});

export const getTopSkills = asyncHandler(async (req, res) => {
    const skills = await ResumeParsed.aggregate([
        { $unwind: '$skills' },
        {
            $group: {
                _id: '$skills.name',
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
    ]);

    return res.status(200).json(new apiResponse(200, 'Top skills fetched', skills));
});

export const getMissingSkills = asyncHandler(async (req, res) => {
    const gaps = await SkillGapReport.aggregate([
        { $unwind: '$missingSkills' },
        {
            $group: {
                _id: '$missingSkills',
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
    ]);

    return res.status(200).json(new apiResponse(200, 'Missing skills fetched', gaps));
});

export const getSkillDemandInsights = asyncHandler(async (req, res) => {
    const demand = await SkillDemand.find()
        .sort({ demandScore: -1 })
        .limit(10)
        .select('skill region demandScore avgSalary growthTrend')
        .lean();

    return res.status(200).json(new apiResponse(200, 'Skill demand fetched', demand));
});

export const getLearningInsights = asyncHandler(async (req, res) => {
    const [overview, buckets] = await Promise.all([
        LearningRoadmap.aggregate([
            {
                $group: {
                    _id: null,
                    avgProgress: { $avg: '$progress' },
                    totalRoadmaps: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ['$progress', 100] }, 1, 0] } },
                },
            },
        ]),
        LearningRoadmap.aggregate([
            {
                $bucket: {
                    groupBy: '$progress',
                    boundaries: [0, 26, 51, 76, 101],
                    default: 'other',
                    output: { count: { $sum: 1 } },
                },
            },
        ]),
    ]);

    const data = {
        ...(overview[0] ?? { avgProgress: 0, totalRoadmaps: 0, completed: 0 }),
        progressBuckets: buckets,
    };
    data.avgProgress = Math.round(data.avgProgress ?? 0);
    data.completionRate = data.totalRoadmaps
        ? Math.round((data.completed / data.totalRoadmaps) * 100)
        : 0;

    return res.status(200).json(new apiResponse(200, 'Learning insights fetched', data));
});

export const getOpportunityInsights = asyncHandler(async (req, res) => {
    const [byCategory, byExperience, byType] = await Promise.all([
        Opportunity.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
        Opportunity.aggregate([{ $group: { _id: '$experienceLevel', count: { $sum: 1 } } }]),
        Opportunity.aggregate([{ $group: { _id: '$opportunityType', count: { $sum: 1 } } }]),
    ]);

    return res.status(200).json(
        new apiResponse(200, 'Opportunity insights fetched', {
            byCategory,
            byExperience,
            byType,
        })
    );
});

export const getAssessmentInsights = asyncHandler(async (req, res) => {
    const [overview, scoreDistrib, topTopics] = await Promise.all([
        Assessment.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: ['$completed', 1, 0] } },
                    avgScore: { $avg: { $cond: ['$completed', '$score', null] } },
                },
            },
        ]),
        Assessment.aggregate([
            { $match: { completed: true } },
            {
                $bucket: {
                    groupBy: '$score',
                    boundaries: [0, 21, 41, 61, 81, 101],
                    default: 'other',
                    output: { count: { $sum: 1 } },
                },
            },
        ]),
        Assessment.aggregate([
            { $group: { _id: '$topic', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
        ]),
    ]);

    const data = {
        ...(overview[0] ?? { total: 0, completed: 0, avgScore: 0 }),
        avgScore: Math.round(overview[0]?.avgScore ?? 0),
        scoreDistribution: scoreDistrib,
        topTopics,
    };

    return res.status(200).json(new apiResponse(200, 'Assessment insights fetched', data));
});

export const getPlatformOverview = asyncHandler(async (req, res) => {
    const [totalUsers, totalResumes, totalOpportunities, totalRoadmaps, totalAssessments] =
        await Promise.all([
            User.countDocuments({ role: 'student' }),
            ResumeParsed.countDocuments(),
            Opportunity.countDocuments(),
            LearningRoadmap.countDocuments(),
            Assessment.countDocuments(),
        ]);

    return res.status(200).json(
        new apiResponse(200, 'Platform overview fetched', {
            totalUsers,
            totalResumes,
            totalOpportunities,
            totalRoadmaps,
            totalAssessments,
        })
    );
});
