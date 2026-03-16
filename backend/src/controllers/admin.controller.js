import Log from '../models/log.model.js';
import User from '../models/user.model.js';
import Opportunity from '../models/opportunity.model.js';
import ResumeParsed from '../models/resumeParsed.model.js';
import LearningRoadmap from '../models/learningRoadmap.model.js';
import Assessment from '../models/assessment.model.js';
import { runIngestion } from '../services/fetchOpportunity/ingestJob.service.js';
import { generateSkillDemand } from '../services/labourMarket/generateDemand.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const ingest = asyncHandler(async (req, res) => {
    res.status(202).json(new apiResponse(202, null, 'Opportunity ingestion started'));

    (async () => {
        try {
            await runIngestion();
            await generateSkillDemand();
            await logger({
                level: 'info',
                action: 'ADMIN_FETCHED_OPPORTUNITIES',
                message: `Admin ${req.user.email} fetched opportunities`,
                req,
            });
        } catch (err) {
            await logger({
                level: 'error',
                action: 'ADMIN_FETCH_OPPORTUNITIES_FAILED',
                message: 'Unable to fetch opportunities',
                error: err,
                req,
            });
        }
    })();
});

export const toggleBlacklist = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) throw new apiError(404, 'User not found');

    user.isBlacklisted = !user.isBlacklisted;
    await user.save({ validateBeforeSave: false });

    await logger({
        level: 'info',
        action: 'USER_BLACKLIST_TOGGLE',
        message: `User ${user.email} blacklisted: ${user.isBlacklisted}`,
        req,
    });

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                { isBlacklisted: user.isBlacklisted },
                `User ${user.isBlacklisted ? 'blacklisted' : 'whitelisted'}`
            )
        );
});

export const getLogs = asyncHandler(async (req, res) => {
    const { level, action, page = 1, limit = 20 } = req.query;

    const query = {};
    if (level) query.level = level;
    if (action) query['meta.action'] = action;

    const [logs, count] = await Promise.all([
        Log.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .populate('user', 'name email role')
            .lean(),
        Log.countDocuments(query),
    ]);

    await logger({
        level: 'info',
        action: 'ADMIN_FETCHED_LOGS',
        message: `Admin fetched logs — level:${level} action:${action} page:${page}`,
        req,
    });

    return res.status(200).json(
        new apiResponse(
            200,
            {
                logs,
                totalPages: Math.ceil(count / Number(limit)),
                currentPage: Number(page),
                total: count,
            },
            'Logs fetched'
        )
    );
});

export const exportLogs = asyncHandler(async (req, res) => {
    const logs = await Log.find().sort({ createdAt: -1 }).populate('user', 'email').lean();

    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const rows = logs.map((log) =>
        [
            log.createdAt.toISOString(),
            log.level,
            log.meta?.action || 'N/A',
            log.user?.email || 'System',
            escape(log.message),
            log.meta?.url || 'N/A',
        ].join(',')
    );

    const csv = ['Date,Level,Action,User,Message,URL', ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="system-logs.csv"');
    await logger({
        level: 'info',
        action: 'ADMIN_EXPORTED_LOGS',
        message: 'Admin exported logs',
        req,
    });
    return res.status(200).send(csv);
});

export const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        verifiedUsers,
        blacklistedUsers,
        totalOpportunities,
        activeOpportunities,
        totalResumes,
        totalRoadmaps,
        completedRoadmaps,
        totalAssessments,
        completedAssessments,
        recentLogs,
    ] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'student', isEmailVerified: true }),
        User.countDocuments({ role: 'student', isBlacklisted: true }),
        Opportunity.countDocuments(),
        Opportunity.countDocuments({ isActive: true }),
        ResumeParsed.countDocuments(),
        LearningRoadmap.countDocuments(),
        LearningRoadmap.countDocuments({ progress: 100 }),
        Assessment.countDocuments(),
        Assessment.countDocuments({ completed: true }),
        Log.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('level message createdAt meta')
            .populate('user', 'email')
            .lean(),
    ]);

    const avgScoreAgg = await Assessment.aggregate([
        { $match: { completed: true } },
        { $group: { _id: null, avg: { $avg: '$score' } } },
    ]);
    const avgAssessmentScore = Math.round(avgScoreAgg[0]?.avg ?? 0);

    const avgProgressAgg = await LearningRoadmap.aggregate([
        { $group: { _id: null, avg: { $avg: '$progress' } } },
    ]);
    const avgRoadmapProgress = Math.round(avgProgressAgg[0]?.avg ?? 0);

    return res.status(200).json(
        new apiResponse(
            200,
            {
                users: {
                    total: totalUsers,
                    verified: verifiedUsers,
                    blacklisted: blacklistedUsers,
                },
                opportunities: {
                    total: totalOpportunities,
                    active: activeOpportunities,
                },
                resumes: totalResumes,
                roadmaps: {
                    total: totalRoadmaps,
                    completed: completedRoadmaps,
                    avgProgress: avgRoadmapProgress,
                },
                assessments: {
                    total: totalAssessments,
                    completed: completedAssessments,
                    avgScore: avgAssessmentScore,
                },
                recentLogs,
            },
            'Dashboard statistics fetched'
        )
    );
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'student' })
        .select(
            '-password -refreshToken -emailOTP -emailOTPExpires -passwordResetToken -passwordResetExpires'
        )
        .lean();

    return res.status(200).json(new apiResponse(200, users, 'Users fetched'));
});
