import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
    createInterview,
    startInterview,
    submitAnswer,
    completeInterview,
    getUserInterviews,
    getInterviewById,
    deleteInterview,
} from '../controllers/mockInterview.controller.js';

const router = Router();

router.use(verifyToken);

router.post('/create', createInterview);
router.get('/', getUserInterviews);
router.get('/:interviewId', getInterviewById);
router.patch('/:interviewId/start', startInterview);
router.post('/:interviewId/answer', submitAnswer);
router.post('/:interviewId/complete', completeInterview);
router.delete('/:interviewId', deleteInterview);

export default router;
