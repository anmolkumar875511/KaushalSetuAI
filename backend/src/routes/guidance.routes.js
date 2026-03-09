import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
    createJobReadinessReport,
    getJobReadinessReports,
    createInterestGuide,
    getInterestGuides,
    createFreelanceGuide,
    getFreelanceGuides
} from '../controllers/guidance.controller.js';

const router = Router();

router.use(verifyToken);

router.post('/job-readiness', createJobReadinessReport);
router.get('/job-readiness', getJobReadinessReports);

router.post('/interest-guide', createInterestGuide);
router.get('/interest-guide', getInterestGuides);

router.post('/freelance-guide', createFreelanceGuide);
router.get('/freelance-guide', getFreelanceGuides);

export default router;