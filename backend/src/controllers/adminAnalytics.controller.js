import User from '../models/user.model.js';
import ResumeParsed from '../models/resumeParsed.model.js';
import SkillDemand from '../models/skillDemand.model.js';
import SkillGapReport from '../models/skillGapReport.model.js';
import LearningRoadmap from '../models/learningRoadmap.model.js';
import Opportunity from '../models/opportunity.model.js';
import Assessment from '../models/assessment.model.js';
import MockInterview from '../models/mockInterview.model.js';
import UserRating, { RATING_TIERS } from '../models/userRating.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiResponse from '../utils/apiResponse.js';

const growthTrendLabel = {
    $switch: {
        branches: [
            { case: { $gte: ['$growthTrend', 1.1] }, then: 'rising' },
            { case: { $lt: ['$growthTrend', 1.0] }, then: 'declining' },
        ],
        default: 'stable',
    },
};

export const getUserGrowth = asyncHandler(async (req, res) => {
    const growth = await User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 1, count: 1, users: '$count' } },
    ]);
    return res.status(200).json(new apiResponse(200, 'User growth fetched', growth));
});

export const getTopSkills = asyncHandler(async (req, res) => {
    const skills = await ResumeParsed.aggregate([
        { $unwind: '$skills' },
        { $group: { _id: '$skills.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
    ]);
    return res.status(200).json(new apiResponse(200, 'Top skills fetched', skills));
});

export const getMissingSkills = asyncHandler(async (req, res) => {
    const gaps = await SkillGapReport.aggregate([
        { $unwind: '$missingSkills' },
        { $group: { _id: '$missingSkills', count: { $sum: 1 } } },
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
    return res
        .status(200)
        .json(
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

export const getRatingInsights = asyncHandler(async (req, res) => {
    const [overview, topUsers, ratingByMonth] = await Promise.all([
        UserRating.aggregate([
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$currentRating' },
                    maxRating: { $max: '$currentRating' },
                    totalRated: { $sum: 1 },
                    totalAssessments: { $sum: '$totalAssessments' },
                },
            },
        ]),
        UserRating.find()
            .sort({ currentRating: -1 })
            .limit(10)
            .populate('user', 'name email avatar')
            .select('currentRating peakRating totalAssessments user')
            .lean(),
        UserRating.aggregate([
            { $unwind: '$history' },
            {
                $group: {
                    _id: { $month: '$history.createdAt' },
                    avgRating: { $avg: '$history.ratingAfter' },
                    events: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),
    ]);

    const boundaries = RATING_TIERS.map((t) => t.min);
    boundaries.push(10000);
    const tierBuckets = await UserRating.aggregate([
        {
            $bucket: {
                groupBy: '$currentRating',
                boundaries,
                default: 'other',
                output: { count: { $sum: 1 } },
            },
        },
    ]);
    const tierDistribution = tierBuckets.map((b) => {
        const tier = RATING_TIERS.find((t) => t.min === b._id);
        return {
            tier: tier?.title ?? 'Unknown',
            color: tier?.color ?? '#9E9E9E',
            min: b._id,
            count: b.count,
        };
    });

    const stats = overview[0] ?? { avgRating: 0, maxRating: 0, totalRated: 0, totalAssessments: 0 };
    return res.status(200).json(
        new apiResponse(200, 'Rating insights fetched', {
            avgRating: Math.round(stats.avgRating ?? 0),
            maxRating: stats.maxRating ?? 0,
            totalRated: stats.totalRated ?? 0,
            totalAssessments: stats.totalAssessments ?? 0,
            tierDistribution,
            topUsers,
            ratingByMonth: ratingByMonth.map((d) => ({
                month: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                ][(d._id - 1) % 12],
                avgRating: Math.round(d.avgRating),
                events: d.events,
            })),
        })
    );
});

export const getMockInterviewInsights = asyncHandler(async (req, res) => {
    const [overview, byStatus, byExperienceLevel, scoreDistrib, topRoles, completionByMonth] =
        await Promise.all([
            MockInterview.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                        avgScore: {
                            $avg: {
                                $cond: [{ $eq: ['$status', 'completed'] }, '$overallScore', null],
                            },
                        },
                        avgDuration: {
                            $avg: { $cond: [{ $ne: ['$duration', null] }, '$duration', null] },
                        },
                    },
                },
            ]),
            MockInterview.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            MockInterview.aggregate([
                { $match: { status: 'completed' } },
                {
                    $group: {
                        _id: '$experienceLevel',
                        count: { $sum: 1 },
                        avgScore: { $avg: '$overallScore' },
                    },
                },
                { $sort: { count: -1 } },
            ]),
            MockInterview.aggregate([
                { $match: { status: 'completed', overallScore: { $ne: null } } },
                {
                    $bucket: {
                        groupBy: '$overallScore',
                        boundaries: [0, 21, 41, 61, 81, 101],
                        default: 'other',
                        output: { count: { $sum: 1 } },
                    },
                },
            ]),
            MockInterview.aggregate([
                {
                    $group: {
                        _id: '$jobRole',
                        count: { $sum: 1 },
                        avgScore: { $avg: '$overallScore' },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 8 },
            ]),
            MockInterview.aggregate([
                { $match: { status: 'completed' } },
                {
                    $group: {
                        _id: { $month: '$completedAt' },
                        count: { $sum: 1 },
                        avgScore: { $avg: '$overallScore' },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);

    const MONTHS_SHORT = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
    const SCORE_LABELS = { 0: '0–20', 21: '21–40', 41: '41–60', 61: '61–80', 81: '81–100' };
    const stats = overview[0] ?? { total: 0, completed: 0, avgScore: 0, avgDuration: 0 };

    return res.status(200).json(
        new apiResponse(200, 'Mock interview insights fetched', {
            total: stats.total,
            completed: stats.completed,
            completionRate: stats.total ? Math.round((stats.completed / stats.total) * 100) : 0,
            avgScore: Math.round(stats.avgScore ?? 0),
            avgDurationSeconds: Math.round(stats.avgDuration ?? 0),
            byStatus: byStatus.map((d) => ({ status: d._id ?? 'unknown', count: d.count })),
            byExperienceLevel: byExperienceLevel.map((d) => ({
                level: d._id ?? 'unknown',
                count: d.count,
                avgScore: Math.round(d.avgScore ?? 0),
            })),
            scoreDistribution: scoreDistrib.map((b) => ({
                range: SCORE_LABELS[b._id] ?? String(b._id),
                count: b.count,
            })),
            topRoles: topRoles.map((d) => ({
                role: d._id ?? 'Unknown',
                count: d.count,
                avgScore: Math.round(d.avgScore ?? 0),
            })),
            byMonth: completionByMonth.map((d) => ({
                month: MONTHS_SHORT[(d._id - 1) % 12],
                count: d.count,
                avgScore: Math.round(d.avgScore ?? 0),
            })),
        })
    );
});

export const getResumeImprovementInsights = asyncHandler(async (req, res) => {
    const [
        overview,
        skillLevelDistrib,
        avgSkillsPerResume,
        resumesWithSummary,
        resumesWithProjects,
        resumesWithExperience,
        topMissingFromGap,
        resumeVersionDistrib,
    ] = await Promise.all([
        ResumeParsed.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    avgSkillCount: { $avg: { $size: { $ifNull: ['$skills', []] } } },
                    avgExpCount: { $avg: { $size: { $ifNull: ['$experience', []] } } },
                    avgProjectCount: { $avg: { $size: { $ifNull: ['$projects', []] } } },
                },
            },
        ]),
        ResumeParsed.aggregate([
            { $unwind: '$skills' },
            { $group: { _id: '$skills.level', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
        ResumeParsed.aggregate([
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    avgSkills: { $avg: { $size: { $ifNull: ['$skills', []] } } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),
        ResumeParsed.countDocuments({ summary: { $exists: true, $ne: '' } }),
        ResumeParsed.countDocuments({ 'projects.0': { $exists: true } }),
        ResumeParsed.countDocuments({ 'experience.0': { $exists: true } }),
        SkillGapReport.aggregate([
            { $unwind: '$missingSkills' },
            { $group: { _id: '$missingSkills', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]),
        ResumeParsed.aggregate([
            { $group: { _id: '$user', maxVersion: { $max: '$resumeVersion' } } },
            { $group: { _id: '$maxVersion', users: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $limit: 5 },
        ]),
    ]);

    const MONTHS_SHORT = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
    const stats = overview[0] ?? { total: 0, avgSkillCount: 0, avgExpCount: 0, avgProjectCount: 0 };
    const total = stats.total || 1;

    return res.status(200).json(
        new apiResponse(200, 'Resume improvement insights fetched', {
            total: stats.total,
            avgSkillsPerResume: Math.round(stats.avgSkillCount ?? 0),
            avgExperienceEntries: Math.round(stats.avgExpCount ?? 0),
            avgProjectEntries: Math.round(stats.avgProjectCount ?? 0),
            completeness: {
                withSummary: Math.round((resumesWithSummary / total) * 100),
                withExperience: Math.round((resumesWithExperience / total) * 100),
                withProjects: Math.round((resumesWithProjects / total) * 100),
            },
            skillLevelDistribution: skillLevelDistrib.map((d) => ({
                level: d._id ?? 'unknown',
                count: d.count,
            })),
            avgSkillsOverTime: avgSkillsPerResume.map((d) => ({
                month: MONTHS_SHORT[(d._id - 1) % 12],
                avgSkills: Math.round(d.avgSkills ?? 0),
                uploads: d.count,
            })),
            topMissingSkills: topMissingFromGap.map((d) => ({ skill: d._id, count: d.count })),
            reUploadRate: resumeVersionDistrib.map((d) => ({
                version: `v${d._id}`,
                users: d.users,
            })),
        })
    );
});

export const getSkillDemandByRegion = asyncHandler(async (req, res) => {
    const [byRegion, growthTrendSummary, topSkillsGlobal, demandOverTime] = await Promise.all([
        SkillDemand.aggregate([
            { $sort: { demandScore: -1 } },
            {
                $group: {
                    _id: '$region',
                    topSkills: {
                        $push: {
                            skill: '$skill',
                            demandScore: '$demandScore',
                            growthTrend: {
                                $switch: {
                                    branches: [
                                        { case: { $gte: ['$growthTrend', 1.1] }, then: 'rising' },
                                        { case: { $lt: ['$growthTrend', 1.0] }, then: 'declining' },
                                    ],
                                    default: 'stable',
                                },
                            },
                            avgSalary: '$avgSalary',
                        },
                    },
                    avgDemandScore: { $avg: '$demandScore' },
                    totalSkillsTracked: { $sum: 1 },
                },
            },
            {
                $project: {
                    region: '$_id',
                    topSkills: { $slice: ['$topSkills', 8] },
                    avgDemandScore: { $round: ['$avgDemandScore', 1] },
                    totalSkillsTracked: 1,
                },
            },
            { $sort: { avgDemandScore: -1 } },
        ]),

        SkillDemand.aggregate([
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $gte: ['$growthTrend', 1.1] }, then: 'rising' },
                                { case: { $lt: ['$growthTrend', 1.0] }, then: 'declining' },
                            ],
                            default: 'stable',
                        },
                    },
                    count: { $sum: 1 },
                    avgScore: { $avg: '$demandScore' },
                },
            },
            { $sort: { count: -1 } },
        ]),

        SkillDemand.aggregate([
            {
                $group: {
                    _id: '$skill',
                    avgDemandScore: { $avg: '$demandScore' },
                    regionsPresent: { $sum: 1 },
                    avgSalary: { $avg: '$avgSalary' },
                    growthTrends: { $push: '$growthTrend' },
                },
            },
            { $sort: { avgDemandScore: -1 } },
            { $limit: 10 },
            {
                $project: {
                    skill: '$_id',
                    avgDemandScore: { $round: ['$avgDemandScore', 1] },
                    regionsPresent: 1,
                    avgSalary: { $round: ['$avgSalary', 0] },
                    dominantTrend: {
                        $let: {
                            vars: { avgTrend: { $avg: '$growthTrends' } },
                            in: {
                                $switch: {
                                    branches: [
                                        { case: { $gte: ['$$avgTrend', 1.1] }, then: 'rising' },
                                        { case: { $lt: ['$$avgTrend', 1.0] }, then: 'declining' },
                                    ],
                                    default: 'stable',
                                },
                            },
                        },
                    },
                },
            },
        ]),

        SkillDemand.aggregate([
            {
                $group: {
                    _id: { $month: '$updatedAt' },
                    avgDemandScore: { $avg: '$demandScore' },
                    skillsUpdated: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),
    ]);

    const MONTHS_SHORT = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    return res.status(200).json(
        new apiResponse(200, 'Regional skill demand fetched', {
            byRegion: byRegion.map((r) => ({
                region: r._id ?? 'unknown',
                avgDemandScore: r.avgDemandScore,
                totalSkillsTracked: r.totalSkillsTracked,
                topSkills: r.topSkills,
            })),
            growthTrendSummary: growthTrendSummary.map((d) => ({
                trend: d._id ?? 'stable',
                count: d.count,
                avgScore: Math.round(d.avgScore ?? 0),
            })),
            topSkillsGlobal,
            demandOverTime: demandOverTime.map((d) => ({
                month: MONTHS_SHORT[(d._id - 1) % 12],
                avgScore: Math.round(d.avgDemandScore ?? 0),
                skillsUpdated: d.skillsUpdated,
            })),
        })
    );
});
