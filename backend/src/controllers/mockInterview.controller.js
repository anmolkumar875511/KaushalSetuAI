import MockInterview from '../models/mockInterview.model.js';
import {
    generateInterviewQuestions,
    evaluateSingleAnswer,
    generateOverallFeedback,
} from '../services/mockInterview/mockInterview.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { sendInterviewReportEmail } from '../utils/sendEmail.js';

export const createInterview = asyncHandler(async (req, res) => {
    const { jobRole, experienceLevel = 'junior', focusAreas = [], totalQuestions = 5 } = req.body;
    const userId = req.user._id;

    if (!jobRole?.trim()) {
        throw new apiError(400, 'Job role is required');
    }

    const clampedTotal = Math.min(10, Math.max(3, Number(totalQuestions)));

    const questions = await generateInterviewQuestions({
        jobRole: jobRole.trim(),
        experienceLevel,
        focusAreas,
        totalQuestions: clampedTotal,
    });

    const interview = await MockInterview.create({
        userId,
        jobRole: jobRole.trim(),
        experienceLevel,
        focusAreas,
        totalQuestions: clampedTotal,
        questions,
        answers: [],
        status: 'pending',
    });

    await logger({
        level: 'info',
        action: 'MOCK_INTERVIEW_CREATE',
        message: `User ${req.user.email} created mock interview for ${jobRole}`,
        req,
    });

    return res.status(201).json(
        new apiResponse(201, 'Mock interview created successfully', {
            interviewId: interview._id,
            jobRole: interview.jobRole,
            experienceLevel: interview.experienceLevel,
            focusAreas: interview.focusAreas,
            totalQuestions: interview.totalQuestions,
            questions: interview.questions,
        })
    );
});

export const startInterview = asyncHandler(async (req, res) => {
    const { interviewId } = req.params;

    const interview = await MockInterview.findOne({ _id: interviewId, userId: req.user._id });
    if (!interview) throw new apiError(404, 'Interview not found');
    if (interview.status === 'completed') throw new apiError(400, 'Interview already completed');

    interview.status = 'in_progress';
    interview.startedAt = interview.startedAt || new Date();
    await interview.save();

    await logger({
        level: 'info',
        action: 'MOCK_INTERVIEW_START',
        message: `User ${req.user.email} started mock interview ${interviewId}`,
        req,
    });

    return res.status(200).json(
        new apiResponse(200, 'Interview started', {
            interviewId: interview._id,
            status: interview.status,
            startedAt: interview.startedAt,
        })
    );
});

export const submitAnswer = asyncHandler(async (req, res) => {
    const { interviewId } = req.params;
    const { questionIndex, answer } = req.body;

    if (answer === undefined || questionIndex === undefined) {
        throw new apiError(400, 'questionIndex and answer are required');
    }

    const interview = await MockInterview.findOne({ _id: interviewId, userId: req.user._id });
    if (!interview) throw new apiError(404, 'Interview not found');
    if (interview.status === 'completed') throw new apiError(400, 'Interview already completed');

    const question = interview.questions[questionIndex];
    if (!question) throw new apiError(400, 'Invalid question index');

    const evaluation = await evaluateSingleAnswer({
        question,
        userAnswer: answer,
        jobRole: interview.jobRole,
        experienceLevel: interview.experienceLevel,
    });

    const existingIdx = interview.answers.findIndex((a) => a.question === question);

    const answerDoc = {
        question,
        userAnswer: answer,
        aiEvaluation: evaluation,
    };

    if (existingIdx >= 0) {
        interview.answers[existingIdx] = answerDoc;
    } else {
        interview.answers.push(answerDoc);
    }

    interview.currentQuestionIndex = Math.max(interview.currentQuestionIndex, questionIndex + 1);
    await interview.save();

    return res.status(200).json(
        new apiResponse(200, 'Answer submitted and evaluated', {
            questionIndex,
            question,
            userAnswer: answer,
            evaluation,
        })
    );
});

export const completeInterview = asyncHandler(async (req, res) => {
    const { interviewId } = req.params;

    const interview = await MockInterview.findOne({ _id: interviewId, userId: req.user._id });
    if (!interview) throw new apiError(404, 'Interview not found');

    if (interview.status === 'completed') {
        return res.status(200).json(new apiResponse(200, 'Interview already completed', interview));
    }

    interview.status = 'evaluating';
    await interview.save();

    const { overallScore, overallFeedback, strengths, areasToImprove } =
        await generateOverallFeedback({
            jobRole: interview.jobRole,
            experienceLevel: interview.experienceLevel,
            answers: interview.answers,
        });

    interview.overallScore = overallScore;
    interview.overallFeedback = overallFeedback;
    interview.strengths = strengths;
    interview.areasToImprove = areasToImprove;
    interview.status = 'completed';
    interview.completedAt = new Date();

    if (interview.startedAt) {
        interview.duration = Math.round((interview.completedAt - interview.startedAt) / 1000);
    }

    await interview.save();

    await logger({
        level: 'info',
        action: 'MOCK_INTERVIEW_COMPLETE',
        message: `User ${req.user.email} completed mock interview ${interviewId} with score ${overallScore}`,
        req,
    });

    sendInterviewReportEmail(req.user.email, {
        name: req.user.name,
        jobRole: interview.jobRole,
        experienceLevel: interview.experienceLevel,
        overallScore: interview.overallScore,
        overallFeedback: interview.overallFeedback,
        strengths: interview.strengths,
        areasToImprove: interview.areasToImprove,
        answers: interview.answers,
        duration: interview.duration,
        interviewId: interview._id,
    }).catch((err) => console.error('[Email] Interview report failed:', err.message));

    return res.status(200).json(
        new apiResponse(200, 'Interview completed successfully', {
            interviewId: interview._id,
            jobRole: interview.jobRole,
            experienceLevel: interview.experienceLevel,
            overallScore: interview.overallScore,
            overallFeedback: interview.overallFeedback,
            strengths: interview.strengths,
            areasToImprove: interview.areasToImprove,
            answers: interview.answers,
            duration: interview.duration,
            completedAt: interview.completedAt,
        })
    );
});

export const getUserInterviews = asyncHandler(async (req, res) => {
    const interviews = await MockInterview.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .select('-answers -questions');

    return res
        .status(200)
        .json(new apiResponse(200, 'Interviews fetched successfully', interviews));
});

export const getInterviewById = asyncHandler(async (req, res) => {
    const { interviewId } = req.params;

    const interview = await MockInterview.findOne({ _id: interviewId, userId: req.user._id });
    if (!interview) throw new apiError(404, 'Interview not found');

    return res.status(200).json(new apiResponse(200, 'Interview fetched successfully', interview));
});

export const deleteInterview = asyncHandler(async (req, res) => {
    const { interviewId } = req.params;

    const interview = await MockInterview.findOneAndDelete({
        _id: interviewId,
        userId: req.user._id,
    });

    if (!interview) throw new apiError(404, 'Interview not found');

    return res.status(200).json(new apiResponse(200, 'Interview deleted successfully', null));
});
