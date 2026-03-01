import Log from '../models/log.model.js';
import User from '../models/user.model.js';
import Opportunity from '../models/opportunity.model.js';
import ResumeParsed from '../models/resumeParsed.model.js';
import LearningRoadmap from '../models/learningRoadmap.model.js';
import { runIngestion } from '../services/fetchOpportunity/ingestJob.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const ingest = asyncHandler(async (req, res) => {
    res.status(202).json(new apiResponse(202, 'Opportunity ingestion started'));

    (async () => {
        try {
            console.log('Admin is fetching opportunities...');

            await runIngestion();

            console.log('Admin successfully fetched opportunities!!');

            await logger({
                level: 'info',
                action: 'ADMIN_FETCHED_OPPORTUNITIES',
                message: `Admin ${req.user.email} fetched opportunities`,
                req,
            });
        } catch (error) {
            await logger({
                level: 'error',
                action: 'ADMIN_FETCH_OPPORTUNITIES_FAILED',
                message: 'Unable to fetch opportunities',
                error,
                req,
            });
        }
    })();
});

export const toggleBlacklist = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        throw new apiError(404, 'User not found');
    }

    user.isBlacklisted = !user.isBlacklisted;
    await user.save({ validateBeforeSave: false });

    await logger({
        level: 'info',
        action: 'USER_BLACKLIST_TOGGLE',
        message: `User ${user.email} status changed to Blacklisted: ${user.isBlacklisted}`,
        req,
    });

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                { isBlacklisted: user.isBlacklisted },
                `User has been ${user.isBlacklisted ? 'blacklisted' : 'whitelisted'}`
            )
        );
});

export const getLogs = asyncHandler(async (req, res) => {
    const { level, action, page = 1, limit = 20 } = req.query;

    const query = {};
    if (level) query.level = level;
    if (action) query['meta.action'] = action;

    const logs = await Log.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('user', 'name email role');

    const count = await Log.countDocuments(query);
    await logger({
        level: 'info',
        action: 'ADMIN_FETCHED_LOGS',
        message: `Admin fetched logs for level: ${level}, action: ${action}, page: ${page}, limit: ${limit}`,
        req,
    });

    res.status(200).json(
        new apiResponse(200, 'Logs fetched', {
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        })
    );
});

export const exportLogs = asyncHandler(async (req, res) => {
    const logs = await Log.find().sort({ createdAt: -1 }).populate('user', 'email');

    let csv = 'Date,Level,Action,User,Message,URL\n';

    logs.forEach((log) => {
        const date = log.createdAt.toISOString();
        const user = log.user ? log.user.email : 'System';
        const action = log.meta?.action || 'N/A';
        const url = log.meta?.url || 'N/A';

        const cleanMsg = log.message.replace(/"/g, '""');

        csv += `${date},${log.level},${action},${user},"${cleanMsg}",${url}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.attachment('system-logs.csv');
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
        totalOpportunities,
        activeOpportunities,
        totalResumes,
        totalRoadmaps,
        recentLogs,
    ] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        Opportunity.countDocuments(),
        Opportunity.countDocuments({ isActive: true }),
        ResumeParsed.countDocuments(),
        LearningRoadmap.countDocuments(),
        Log.find().sort({ createdAt: -1 }).limit(5).select('level message createdAt meta.action'),
    ]);

    const stats = {
        users: { total: totalUsers },
        opportunities: { total: totalOpportunities, active: activeOpportunities },
        resumes: totalResumes,
        roadmaps: totalRoadmaps,
        recentLogs,
    };

    return res
        .status(200)
        .json(new apiResponse(200, stats, 'Dashboard statistics fetched successfully'));
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'student' }).lean();

    if (!users || users.length === 0) {
        return res.status(200).json(new apiResponse(200, 'No students found', []));
    }

    return res.status(200).json(new apiResponse(200, 'Users fetched successfully', users));
});
