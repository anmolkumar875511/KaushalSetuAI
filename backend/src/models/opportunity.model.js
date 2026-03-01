import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        company: {
            name: {
                type: String,
                required: true,
                trim: true,
            },
        },

        description: {
            type: String,
            required: true,
        },

        requiredSkills: {
            type: [String],
            default: [],
            index: true,
        },

        category: {
            type: String,
            enum: [
                'tech',
                'finance',
                'medical',
                'law',
                'education',
                'management',
                'design',
                'government',
                'other',
            ],
            index: true,
        },

        opportunityType: {
            type: String,
            enum: ['job', 'internship'],
            required: true,
        },

        experienceLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner',
        },

        location: {
            type: String,
            default: 'Remote',
        },

        stipendOrSalary: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 },
            currency: { type: String, default: 'INR' },
        },

        applicationLink: {
            type: String,
            required: true,
        },

        source: {
            type: String,
            enum: ['internal', 'external'],
            required: true,
        },

        externalSource: {
            type: String,
            index: true,
        },

        externalId: {
            type: String,
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        lastSeenAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

opportunitySchema.index({ externalId: 1, externalSource: 1 }, { unique: true, sparse: true });

export default mongoose.model('Opportunity', opportunitySchema);
