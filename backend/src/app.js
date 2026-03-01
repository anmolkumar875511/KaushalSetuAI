import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import errorHandler from './middlewares/errorHandler.middleware.js';
import './utils/passport.js';

import userRoutes from './routes/user.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import opportunityRoutes from './routes/opportunity.routes.js';
import skillGapRoutes from './routes/skillGap.routes.js';
import roadmapRoutes from './routes/roadmap.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

const allowedOrigins = ['https://skillbridge-chi.vercel.app', 'http://localhost:5173'];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(null, true);
        },
        credentials: true,
    })
);

app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));
app.use(cookieParser());

app.use(passport.initialize());

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/opportunity', opportunityRoutes);
app.use('/api/v1/skillgap', skillGapRoutes);
app.use('/api/v1/roadmap', roadmapRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'SkillBridge API is running smoothly!',
        environment: process.env.NODE_ENV || 'development',
    });
});

app.use(errorHandler);

export default app;
