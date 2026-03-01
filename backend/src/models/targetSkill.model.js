import mongoose from 'mongoose';

const targetSkillSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        targetRole: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
        },
        specificSkills: {
            type: [String],
            default: [],
        },
        isAchieved: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model('TargetSkill', targetSkillSchema);
