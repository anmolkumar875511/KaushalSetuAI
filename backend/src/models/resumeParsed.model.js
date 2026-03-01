import mongoose from 'mongoose';

const resumeParsedSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        resumeVersion: {
            type: Number,
            default: 1,
        },

        categories: [
            {
                name: {
                    type: String,
                    required: true,
                    lowercase: true,
                    trim: true,
                    index: true,
                },
                confidence: {
                    type: Number,
                    default: 0.7,
                },
                source: {
                    type: String,
                    enum: ['rule_based', 'ai_inferred'],
                    default: 'rule_based',
                },
            },
        ],

        skills: [
            {
                name: {
                    type: String,
                    required: true,
                    lowercase: true,
                    trim: true,
                },
                level: {
                    type: String,
                    enum: ['beginner', 'intermediate', 'advanced'],
                    default: 'beginner',
                },
                confidence: {
                    type: Number,
                    default: 0.7,
                },
                source: {
                    type: String,
                    enum: ['resume', 'ai_inferred'],
                    default: 'resume',
                },
            },
        ],

        experience: [
            {
                role: String,
                company: String,
                durationMonths: Number,
            },
        ],

        education: [
            {
                degree: String,
                institute: String,
                year: Number,
            },
        ],

        projects: [
            {
                title: {
                    type: String,
                    required: true,
                },
                description: {
                    type: String,
                    default: '',
                },
            },
        ],

        parsedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.model('ResumeParsed', resumeParsedSchema);
