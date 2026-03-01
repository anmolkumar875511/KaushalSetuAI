import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { getMatchAnalysis } from '../controllers/skillGap.controller.js';

const router = Router();

router.use(verifyToken);

router.get('/analyze/:opportunityId', getMatchAnalysis);

export default router;
