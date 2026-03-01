import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { getOpportunity } from '../controllers/opportunity.controller.js';

const router = Router();

router.use(verifyToken);

router.get('/', getOpportunity);

export default router;
