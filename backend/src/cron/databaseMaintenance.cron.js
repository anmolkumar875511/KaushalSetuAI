import cron from 'node-cron';
import User from '../models/user.model.js';
import SkillGapReport from '../models/skillGapReport.model.js';
import Roadmap from '../models/learningRoadmap.model.js';

cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Starting Daily Database Maintenance...');
    const now = Date.now();
    const EXPIRY_24H = 24 * 60 * 60 * 1000;
    const expiryDate = new Date(now - EXPIRY_24H);

    try {
        const userResult = await User.deleteMany({
            isEmailVerified: false,
            createdAt: { $lt: expiryDate },
        });
        console.log(`[CRON] Deleted ${userResult.deletedCount} unverified users.`);

        const usedReportIds = await Roadmap.find().distinct('skillGapReportId');

        const reportResult = await SkillGapReport.deleteMany({
            _id: { $nin: usedReportIds },
            createdAt: { $lt: expiryDate },
        });
        console.log(`[CRON] Deleted ${reportResult.deletedCount} unused SkillGapReports.`);

        console.log('[CRON] Maintenance Complete.');
    } catch (error) {
        console.error('[CRON] Maintenance failed:', error);
    }
});
