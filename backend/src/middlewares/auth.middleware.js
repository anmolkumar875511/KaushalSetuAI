import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import apiError from '../utils/apiError.js';

export const verifyToken = asyncHandler(async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.accessToken;

    if (!token) {
        return next(new apiError(401, 'Not authorized, token missing'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new apiError(401, 'Not authorized, user not found'));
        }

        if (user.isBlacklisted) {
            return next(new apiError(402, 'Your account is currently blacklisted by admin'));
        }

        if (!user.isEmailVerified) {
            return next(new apiError(403, 'Please verify your email'));
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new apiError(401, 'Token expired'));
        }
        return next(new apiError(401, 'Not authorized, token failed'));
    }
});

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new apiError(401, 'Not authorized'));
        }
        if (!roles.includes(req.user.role)) {
            return next(
                new apiError(403, `Role (${req.user.role}) is not allowed to access this resource`)
            );
        }
        next();
    };
};
