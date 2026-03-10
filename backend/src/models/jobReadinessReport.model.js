import mongoose from 'mongoose';

const jobReadinessReportSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        interest: {
            type: String,
            required: true,
        },

        resume: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ResumeParsed',
        },

        readinessScore: {
            type: Number,
            required: true,
        },

        strengths: [
            {
                type: String,
            },
        ],

        missingSkills: [
            {
                type: String,
            },
        ],

        recommendedSkills: [
            {
                type: String,
            },
        ],

        recommendations: [
            {
                type: String,
            },
        ],

        estimatedLearningTime: {
            type: String,
        },

        demandInsights: [
            {
                skill: String,
                demandScore: Number,
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('JobReadinessReport', jobReadinessReportSchema);
