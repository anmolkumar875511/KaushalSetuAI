import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { getOpportunity, rankedJobs } from '../controllers/opportunity.controller.js';

const router = Router();

router.use(verifyToken);

router.get('/', getOpportunity);
router.get('/ranked', rankedJobs);

export default router;
