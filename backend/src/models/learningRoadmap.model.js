import mongoose from 'mongoose';

const learningRoadmapSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        opportunity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Opportunity',
            required: false,
        },
        targetSkill: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TargetSkill',
        },

        skillGapReport: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SkillGapReport',
        },

        roadmap: [
            {
                week: Number,
                topic: String,
                tasks: [
                    {
                        description: String,
                        isCompleted: { type: Boolean, default: false },
                    },
                ],
                resources: [{ title: String, url: String }],
            },
        ],

        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    { timestamps: true }
);

export default mongoose.model('LearningRoadmap', learningRoadmapSchema);
