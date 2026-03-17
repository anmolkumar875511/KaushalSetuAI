import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
    getMyRating,
    getMyRatingHistory,
    getRatingTiers,
} from '../controllers/rating.controller.js';

const router = Router();

router.get('/tiers', getRatingTiers);
router.get('/me', verifyToken, getMyRating);
router.get('/me/history', verifyToken, getMyRatingHistory);

export default router;
