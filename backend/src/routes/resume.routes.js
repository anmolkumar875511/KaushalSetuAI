import { Router } from 'express';
import {
    uploadResume,
    getLatestResume,
    updateResume,
    getResumeImprovements,
} from '../controllers/resume.controller.js';
import { uploadResumeMiddleware } from '../middlewares/upload.middleware.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', getLatestResume);
router.post('/upload', uploadResumeMiddleware.single('resume'), uploadResume);
router.put('/:id', updateResume);
router.post('/improve', getResumeImprovements);

export default router;
