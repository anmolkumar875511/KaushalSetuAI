import User from '../models/user.model.js';
import ResumeParsed from '../models/resumeParsed.model.js';
import SkillDemand from '../models/skillDemand.model.js';
import SkillGapReport from '../models/skillGapReport.model.js';
import LearningRoadmap from '../models/learningRoadmap.model.js';
import Opportunity from '../models/opportunity.model.js';
import Assessment from '../models/assessment.model.js';

import asyncHandler from '../utils/asyncHandler.js';
import apiResponse from '../utils/apiResponse.js';


export const getPlatformOverview = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalResumes,
        totalOpportunities,
        totalRoadmaps,
        totalAssessments
    ] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        ResumeParsed.countDocuments(),
        Opportunity.countDocuments(),
        LearningRoadmap.countDocuments(),
        Assessment.countDocuments()
    ]);

    return res.status(200).json(
        new apiResponse(200, {
            totalUsers,
            totalResumes,
            totalOpportunities,
            totalRoadmaps,
            totalAssessments
        }, 'Platform overview fetched')
    );
});

export const getUserGrowth = asyncHandler(async (req, res) => {

    const growth = await User.aggregate([
        {
            $match: { role: 'student' }
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                users: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    return res.status(200).json(
        new apiResponse(200, growth, 'User growth analytics fetched')
    );
});

export const getTopSkills = asyncHandler(async (req, res) => {

    const skills = await ResumeParsed.aggregate([
        { $unwind: "$skills" },
        {
            $group: {
                _id: "$skills.name",
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    return res.status(200).json(
        new apiResponse(200,'Top skills fetched', skills)
    );
});

export const getMissingSkills = asyncHandler(async (req, res) => {

    const gaps = await SkillGapReport.aggregate([
        { $unwind: "$missingSkills" },
        {
            $group: {
                _id: "$missingSkills",
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    return res.status(200).json(
        new apiResponse(200, 'Most missing skills fetched', gaps)
    );
});

export const getSkillDemandInsights = asyncHandler(async (req, res) => {

    const demand = await SkillDemand.find()
        .sort({ demandScore: -1 })
        .limit(10)
        .select("skill region demandScore avgSalary growthTrend");

    return res.status(200).json(
        new apiResponse(200, demand, 'Skill demand insights fetched')
    );
});

export const getLearningInsights = asyncHandler(async (req, res) => {

    const avgProgress = await LearningRoadmap.aggregate([
        {
            $group: {
                _id: null,
                avgProgress: { $avg: "$progress" },
                totalRoadmaps: { $sum: 1 }
            }
        }
    ]);

    return res.status(200).json(
        new apiResponse(200, 'Learning analytics fetched', avgProgress[0] || {})
    );
});

export const getOpportunityInsights = asyncHandler(async (req, res) => {

    const byCategory = await Opportunity.aggregate([
        {
            $group: {
                _id: "$category",
                jobs: { $sum: 1 }
            }
        },
        { $sort: { jobs: -1 } }
    ]);

    const byExperience = await Opportunity.aggregate([
        {
            $group: {
                _id: "$experienceLevel",
                jobs: { $sum: 1 }
            }
        }
    ]);

    return res.status(200).json(
        new apiResponse(200, 'Opportunity analytics fetched', {
            byCategory,
            byExperience
        })
    );
});

export const getAssessmentInsights = asyncHandler(async (req, res) => {

    const stats = await Assessment.aggregate([
        {
            $group: {
                _id: null,
                totalAssessments: { $sum: 1 },
                avgScore: { $avg: "$score" },
                completed: {
                    $sum: {
                        $cond: ["$completed", 1, 0]
                    }
                }
            }
        }
    ]);

    return res.status(200).json(
        new apiResponse(200, 'Assessment analytics fetched', stats[0] || {})
    );
});