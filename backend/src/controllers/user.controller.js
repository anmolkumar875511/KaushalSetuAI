import asyncHandler from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';
import { generateOTP } from '../utils/generateOTP.js';
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../utils/sendEmail.js';
import { uploadImageToCloudinary } from '../utils/cloudinary.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import crypto from 'crypto';

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/',
};

export const registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return next(new apiError(400, 'Missing required fields'));
    }

    if (password.length < 6) {
        return next(new apiError(400, 'Password must be at least 6 characters long'));
    }

    let user = await User.findOne({ email });

    if (user && user.isEmailVerified) {
        return next(new apiError(400, 'User with this email already exists'));
    }

    const otp = generateOTP();

    if (!user) {
        user = new User({ name, email, password });
    } else {
        user.name = name;
        user.password = password;
    }

    await user.setEmailOTP(otp);

    try {
        await sendOTPEmail(email, otp);
        await user.save();
    } catch (error) {
        console.log(error);
        return next(
            new apiError(500, 'Email address is invalid or cannot receive emails', error.message)
        );
    }

    await logger({
        level: 'info',
        action: 'USER_REGISTER',
        message: `User ${user.email} registered`,
        req,
    });

    res.status(201).json(
        new apiResponse(201, 'OTP sent to email for verification', {
            email,
        })
    );
});

export const verifyEmailOTP = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new apiError(400, 'Email and OTP are required'));
    }

    const user = await User.findOne({ email }).select('+emailOTP +emailOTPExpires');

    if (!user) {
        return next(new apiError(404, 'User not found'));
    }

    if (user.isEmailVerified) {
        return next(new apiError(400, 'Email already verified'));
    }

    if (!user.emailOTP || user.emailOTPExpires.getTime() < Date.now()) {
        const currentTime = Date.now();
        console.log('Expired OTP:', user.emailOTPExpires.getTime(), 'Current Time:', currentTime);
        return next(new apiError(400, 'OTP expired'));
    }

    const isValidOTP = await user.isEmailOTPMatch(otp);
    if (!isValidOTP) {
        return next(new apiError(400, 'Invalid OTP'));
    }

    user.isEmailVerified = true;
    user.clearEmailOTP();
    await sendWelcomeEmail(user.email, user.name);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    await logger({
        level: 'info',
        action: 'EMAIL_VERIFIED',
        message: `User ${user.email} verified email`,
        req,
    });

    res.status(200)
        .cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 15,
        })
        .cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 60 * 24 * 7,
        })
        .json(
            new apiResponse(200, 'Email verified and login successful', {
                user: user.toJSON(),
            })
        );
});

export const resendEmailOTP = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new apiError(400, 'Email is required'));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new apiError(404, 'User not found'));
    }

    if (user.isEmailVerified) {
        return next(new apiError(400, 'Email already verified'));
    }

    const otp = generateOTP();
    await user.setEmailOTP(otp);

    await user.save({ validateBeforeSave: false });
    await sendOTPEmail(email, otp);

    res.status(200).json(new apiResponse(200, 'OTP resent successfully'));
});

export const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return next(new apiError(400, 'Missing email or password'));
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.isPasswordMatch(password))) {
            return next(new apiError(401, 'Invalid email or password'));
        }

        if (user.isBlacklisted) {
            return next(new apiError(402, 'Your account is currently blacklisted by admin'));
        }

        if (!user.isEmailVerified) {
            return next(new apiError(403, 'Please verify your email before login'));
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        await logger({
            level: 'info',
            action: 'USER_LOGIN',
            message: `User ${user.email} logged in`,
            req,
        });

        res.status(200)
            .cookie('accessToken', accessToken, {
                ...cookieOptions,
                maxAge: 1000 * 60 * 15,
            })
            .cookie('refreshToken', refreshToken, {
                ...cookieOptions,
                maxAge: 1000 * 60 * 60 * 24 * 7,
            })
            .json(
                new apiResponse(200, 'Login successful', {
                    user: user.toJSON(),
                })
            );
    } catch (error) {
        return next(new apiError(500, 'Server error during login', error.message));
    }
});

export const getUserProfile = asyncHandler(async (req, res) => {
    res.status(200).json(
        new apiResponse(200, 'User profile fetched successfully', {
            user: req.user.toJSON(),
        })
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: '' },
    });

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    await logger({
        level: 'info',
        action: 'USER_LOGOUT',
        message: `User ${req.user.email} logged out`,
        req,
    });
    res.status(200).json(new apiResponse(200, 'Logout successful'));
});

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return next(new apiError(401, 'Refresh token missing'));
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
        return next(new apiError(401, 'Refresh token expired'));
    }

    const user = await User.findOne({
        _id: decoded.id,
        refreshToken,
    });

    if (!user) {
        return next(new apiError(401, 'Invalid refresh token'));
    }

    if (user.isBlacklisted) {
        return next(new apiError(402, 'Your account is currently blacklisted by admin'));
    }

    if (!user.isEmailVerified) {
        return next(new apiError(403, 'Please verify your email'));
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .cookie('accessToken', newAccessToken, cookieOptions)
        .cookie('refreshToken', newRefreshToken, cookieOptions)
        .json(new apiResponse(200, 'Token refreshed'));
});

export const updateUserProfile = asyncHandler(async (req, res, next) => {
    const { name } = req.body;

    if (!name) {
        return next(new apiError(400, 'Missing required fields'));
    }

    req.user.name = name;
    await req.user.save();
    await logger({
        level: 'info',
        action: 'USER_UPDATE',
        message: `User ${req.user.email} updated profile`,
        req,
    });
    res.status(200).json(
        new apiResponse(200, 'User profile updated successfully', {
            user: req.user.toJSON(),
        })
    );
});

export const changeUserPassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new apiError(400, 'Missing required fields'));
    }

    if (currentPassword === newPassword) {
        return next(new apiError(400, 'New password must be different from current password'));
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.isPasswordMatch(currentPassword))) {
        return next(new apiError(401, 'Current password is incorrect'));
    }

    user.password = newPassword;
    await user.save();

    await logger({
        level: 'info',
        action: 'USER_PASSWORD_CHANGE',
        message: `User ${user.email} changed password`,
        req,
    });

    res.status(200).json(new apiResponse(200, 'Password changed successfully'));
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new apiError(400, 'Email is required'));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new apiError(404, 'You are not registered with us'));
    }

    if (user.isBlacklisted) {
        return next(new apiError(402, 'Your account is currently blacklisted by admin'));
    }

    if (!user.isEmailVerified) {
        return next(new apiError(403, 'Please verify your email'));
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
        await sendPasswordResetEmail(user.email, resetUrl);

        res.status(200).json(new apiResponse(200, 'Password reset email sent successfully'));
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        await logger({
            level: 'error',
            action: 'USER_PASSWORD_RESET',
            message: `Failed to send password reset email to ${user.email}`,
            req,
        });

        return next(new apiError(500, 'Failed to send password reset email'));
    }
});

export const resetPassword = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return next(new apiError(400, 'New password is required'));
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
        return next(new apiError(400, 'Invalid or expired reset token'));
    }

    if (user.isBlacklisted) {
        return next(new apiError(402, 'Your account is currently blacklisted by admin'));
    }

    if (!user.isEmailVerified) {
        return next(new apiError(403, 'Please verify your email'));
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    await logger({
        level: 'info',
        action: 'USER_PASSWORD_RESET',
        message: `User ${user.email} reset password`,
        req,
    });

    res.status(200).json(new apiResponse(200, 'Password reset successful'));
});

export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const user = req.user;

        const uploadedImage = await uploadImageToCloudinary(req.file.buffer);

        if (!uploadedImage) {
            return res.status(500).json({
                success: false,
                message: 'Failed to upload avatar',
            });
        }

        user.avatar = {
            url: uploadedImage.url,
            publicId: uploadedImage.id,
        };

        await user.save();

        await logger({
            level: 'info',
            action: 'USER_AVATAR_UPLOAD',
            message: `User ${user.email} uploaded avatar`,
            req,
        });

        return res.status(200).json(
            new apiResponse(200, 'Avatar uploaded successfully', {
                user: user.toJSON(),
            })
        );
    } catch (error) {
        await logger({
            level: 'error',
            action: 'USER_AVATAR_UPLOAD',
            message: `Avatar upload failed`,
            req,
        });

        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Failed to upload avatar',
            errors: error.message,
        });
    }
};

export const handleGoogleCallback = asyncHandler(async (req, res) => {
    const user = req.user;

    if (user.isBlacklisted) {
        await logger({
            level: 'warn',
            action: 'USER_LOGIN_ATTEMPT_BLACKLISTED',
            message: `Blacklisted user ${user.email} attempted login`,
            req,
        });
        return res.redirect(`${process.env.FRONTEND_URL}/account-suspended`);
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    await logger({
        level: 'info',
        action: 'USER_LOGIN_GOOGLE',
        message: `User ${user.email} logged in via Google`,
        req,
    });
    res.status(200)
        .cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 15,
        })
        .cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 60 * 24 * 7,
        })
        .redirect(`${process.env.FRONTEND_URL}/Dashboard`);
});

export const updateTheme = async (req, res) => {
    try {
        const { theme } = req.body;
        if (!['light', 'dark'].includes(theme)) {
            return res.status(400).json({ message: 'Invalid theme type' });
        }

        const user = await User.findByIdAndUpdate(req.user.id, { theme }, { new: true });

        res.status(200).json({
            success: true,
            theme: user.theme,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating theme' });
    }
};
