import { Router } from 'express';
import passport from 'passport';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { uploadAvatarMiddleware } from '../middlewares/upload.middleware.js';
import {
    getUserProfile,
    updateUserProfile,
    changeUserPassword,
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    verifyEmailOTP,
    resendEmailOTP,
    forgotPassword,
    resetPassword,
    uploadAvatar,
    handleGoogleCallback,
    updateTheme,
} from '../controllers/user.controller.js';

const router = Router();

router.post('/register', registerUser);
router.post('/verify-email', verifyEmailOTP);
router.post('/resend-otp', resendEmailOTP);
router.post('/login', loginUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get(
    '/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
    })
);
router.get(
    '/auth/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/login',
        failureMessage: 'Something went wrong',
    }),
    handleGoogleCallback
);

router.post('/logout', verifyToken, logoutUser);
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);
router.put('/change-password', verifyToken, changeUserPassword);
router.patch('/avatar', verifyToken, uploadAvatarMiddleware.single('avatar'), uploadAvatar);
router.patch('/theme', verifyToken, updateTheme);

export default router;
