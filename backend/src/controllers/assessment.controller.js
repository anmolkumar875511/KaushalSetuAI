import Assessment from '../models/assessment.model.js';
import { generateAssessmentQuestions } from '../services/assesment/assessment.service.js';
import { calculateAssessmentScore } from '../services/assesment/scoreCalculator.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const generateAssessment = asyncHandler(async (req, res) => {
    const { topic } = req.body;
    const userId = req.user._id;

    if (!topic) {
        throw new apiError(400, 'Topic is required');
    }

    const questions = await generateAssessmentQuestions(topic);

    const assessment = await Assessment.create({
        userId,
        topic,
        questions,
    });

    await logger({
        level: 'info',
        action: 'ASSESSMENT_GENERATE',
        message: `User ${req.user.email} generated assessment for topic ${topic}`,
        req,
    });

    return res
        .status(201)
        .json(new apiResponse(201, 'Assessment created successfully', assessment._id));
});

export const startAssessment = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params;

    const assessment = await Assessment.findOne({
        _id: assessmentId,
        userId: req.user._id,
    }).select('-questions.correctAnswer -score -timeCompleted -duration');

    if (!assessment) {
        throw new apiError(404, 'Assessment not found');
    }

    if (assessment.completed) {
        throw new apiError(400, 'Assessment already completed');
    }

    assessment.timeStarted = new Date();
    await assessment.save();

    await logger({
        level: 'info',
        action: 'ASSESSMENT_START',
        message: `User ${req.user.email} started assessment ${assessmentId}`,
        req,
    });

    return res.status(200).json(
        new apiResponse(200, 'Assessment started successfully', {
            maxScore: 100,
            assessment,
        })
    );
});

export const submitAssessment = asyncHandler(async (req, res) => {
    const { assessmentId, answers } = req.body;

    const assessment = await Assessment.findOne({
        _id: assessmentId,
        userId: req.user._id,
    });

    if (!assessment) {
        throw new apiError(404, 'Assessment not found');
    }

    if (assessment.completed) {
        throw new apiError(400, 'Assessment already submitted');
    }

    assessment.questions.forEach((q, index) => {
        q.userAnswer = answers[index] || null;
    });

    const score = calculateAssessmentScore(assessment.questions);

    assessment.score = score;
    assessment.completed = true;
    assessment.timeCompleted = new Date();

    if (assessment.timeStarted) {
        assessment.duration = (assessment.timeCompleted - assessment.timeStarted) / 1000;
    }

    await assessment.save();

    await logger({
        level: 'info',
        action: 'ASSESSMENT_SUBMIT',
        message: `User ${req.user.email} submitted assessment ${assessmentId} with score ${score}`,
        req,
    });

    return res.status(200).json(
        new apiResponse(200, 'Assessment submitted successfully', {
            score,
            maxScore: 100,
        })
    );
});

export const getUserAssessments = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const assessments = await Assessment.find({ userId }).sort({ createdAt: -1 });

    if (!assessments.length) {
        return res.status(200).json(new apiResponse(200, 'No assessments found', []));
    }

    return res
        .status(200)
        .json(new apiResponse(200, 'Assessments fetched successfully', assessments));
});

export const getAssessmentById = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params;

    const assessment = await Assessment.findOne({
        _id: assessmentId,
        userId: req.user._id,
    });

    if (!assessment) {
        throw new apiError(404, 'Assessment not found');
    }

    return res
        .status(200)
        .json(new apiResponse(200, 'Assessment fetched successfully', assessment));
});
