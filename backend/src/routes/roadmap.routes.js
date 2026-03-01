import { Router } from 'express';
import {
    createRoadmap,
    getRoadmap,
    toggleTaskStatus,
    deleteRoadmap,
    setTargetAndGenerateRoadmap,
    getCompletedRoadmaps,
} from '../controllers/roadmap.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/completed', getCompletedRoadmaps);
router.get('/', getRoadmap);
router.post('/generate/:opportunityId', createRoadmap);
router.post('/custom-target', setTargetAndGenerateRoadmap);
router.patch('/:roadmapId/task/:taskId', toggleTaskStatus);
router.delete('/:roadmapId', deleteRoadmap);

export default router;
