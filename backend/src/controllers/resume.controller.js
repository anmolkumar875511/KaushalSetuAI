import pdf from 'pdf-parse-debugging-disabled';
import asyncHandler from '../utils/asyncHandler.js';
import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';
import ResumeParsed from '../models/resumeParsed.model.js';
import { parseResumeText } from '../services/resumeParser/index.js';
import { logger } from '../utils/logger.js';
import { analyseResume } from '../services/resumeImprovement/resumeImprovement.service.js';
import { sendResumeImprovementEmail } from '../utils/sendEmail.js';

export const uploadResume = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new apiError(400, 'Resume file is required');
    }

    const pdfData = await pdf(req.file.buffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length === 0) {
        throw new apiError(422, 'Uploaded resume is unreadable');
    }

    const parsedData = await parseResumeText(rawText);

    const lastResume = await ResumeParsed.findOne({ user: req.user._id })
        .sort({ resumeVersion: -1 })
        .select('resumeVersion');

    const nextVersion = lastResume ? lastResume.resumeVersion + 1 : 1;

    const resume = await ResumeParsed.create({
        user: req.user._id,
        resumeVersion: nextVersion,
        ...parsedData,
        parsingMeta: {
            parsedAt: new Date(),
            parserVersion: 'v1.0',
        },
    });

    await logger({
        level: 'info',
        action: 'RESUME_UPLOAD',
        message: `User ${req.user.email} uploaded resume`,
        req,
    });

    return res.status(201).json(
        new apiResponse(201, 'Resume uploaded & saved', {
            resumeId: resume._id,
            data: parsedData,
        })
    );
});

export const getLatestResume = asyncHandler(async (req, res) => {
    const resume = await ResumeParsed.findOne({
        user: req.user._id,
    }).sort({ createdAt: -1 });

    if (!resume) {
        return res.status(201).json(new apiResponse(201, 'No resume found, please upload resume'));
    }

    return res.status(200).json(new apiResponse(200, 'Latest resume fetched', resume));
});

export const updateResume = asyncHandler(async (req, res) => {
    const { skills, education, experience, projects } = req.body;

    const resume = await ResumeParsed.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!resume) {
        throw new apiError(404, 'Resume not found');
    }

    if (skills) resume.skills = skills;
    if (education) resume.education = education;
    if (experience) resume.experience = experience;
    if (projects) resume.projects = projects;

    await resume.save();

    await logger({
        level: 'info',
        action: 'RESUME_UPDATE',
        message: `User ${req.user.email} updated resume`,
        req,
    });

    return res.status(200).json(new apiResponse(200, 'Resume updated successfully', resume));
});

export const getResumeImprovements = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const resume = await ResumeParsed.findOne({ user: userId }).sort({ resumeVersion: -1 });

    if (!resume) {
        throw new apiError(404, 'No resume found. Please upload your resume first.');
    }

    const report = await analyseResume(resume);

    await logger({
        level: 'info',
        action: 'RESUME_IMPROVE_ANALYSE',
        message: `User ${req.user.email} generated resume improvement report`,
        req,
    });

    sendResumeImprovementEmail(req.user.email, {
        name: req.user.name,
        overallScore: report.overallScore,
        topPriorities: report.topPriorities,
        atsKeywords: report.atsKeywords,
        dimensions: report.dimensions,
    }).catch((err) => console.error('[Email] Resume improvement failed:', err.message));

    return res.status(200).json(
        new apiResponse(200, 'Resume improvement report generated', {
            resumeId: resume._id,
            resumeVersion: resume.resumeVersion,
            name: resume.name,
            ...report,
        })
    );
});
