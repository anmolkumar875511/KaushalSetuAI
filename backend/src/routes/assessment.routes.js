import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
    generateAssessment,
    startAssessment,
    submitAssessment,
    getUserAssessments,
    getAssessmentById,
} from '../controllers/assessment.controller.js';

const router = express.Router();

router.use(verifyToken);

router.post('/generate', generateAssessment);
router.patch('/start/:assessmentId', startAssessment);
router.post('/submit', submitAssessment);
router.get('/', getUserAssessments);
router.get('/:assessmentId', getAssessmentById);

export default router;
