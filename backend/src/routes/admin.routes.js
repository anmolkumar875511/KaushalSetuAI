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

router.get('/overview', getPlatformOverview);
router.get('/user-growth', getUserGrowth);
router.get('/top-skills', getTopSkills);
router.get('/missing-skills', getMissingSkills);
router.get('/skill-demand', getSkillDemandInsights);
router.get('/learning', getLearningInsights);
router.get('/opportunities', getOpportunityInsights);
router.get('/assessments', getAssessmentInsights);

export default router;
