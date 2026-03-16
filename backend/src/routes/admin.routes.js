import { Router } from 'express';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import {
    ingest,
    toggleBlacklist,
    getLogs,
    exportLogs,
    getDashboardStats,
    getAllUsers,
} from '../controllers/admin.controller.js';

import {
    getPlatformOverview,
    getUserGrowth,
    getTopSkills,
    getMissingSkills,
    getSkillDemandInsights,
    getLearningInsights,
    getOpportunityInsights,
    getAssessmentInsights
} from '../controllers/adminAnalytics.controller.js';

const router = Router();

router.use(verifyToken, authorizeRoles('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/fetch', ingest);
router.patch('/blacklist/:userId', toggleBlacklist);
router.get('/logs', getLogs);
router.get('/logs/export', exportLogs);
router.get('/users', getAllUsers);

router.get('/analytics/overview', getPlatformOverview);
router.get('/analytics/user-growth', getUserGrowth);
router.get('/analytics/top-skills', getTopSkills);
router.get('/analytics/missing-skills', getMissingSkills);
router.get('/analytics/skill-demand', getSkillDemandInsights);
router.get('/analytics/learning', getLearningInsights);
router.get('/analytics/opportunities', getOpportunityInsights);
router.get('/analytics/assessments', getAssessmentInsights);

export default router;
