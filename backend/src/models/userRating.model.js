import mongoose from 'mongoose';

export const RATING_TIERS = [
    { title: 'Newbie', min: 0, color: '#9E9E9E' },
    { title: 'Pupil', min: 1200, color: '#7FB069' },
    { title: 'Apprentice', min: 1400, color: '#3B82F6' },
    { title: 'Specialist', min: 1600, color: '#06B6D4' },
    { title: 'Expert', min: 1800, color: '#8B5CF6' },
    { title: 'Master', min: 2000, color: '#F97316' },
    { title: 'Grandmaster', min: 2200, color: '#EF4444' },
];

export const getTierForRating = (rating) => {
    const tiers = [...RATING_TIERS].reverse();
    return tiers.find((t) => rating >= t.min) ?? RATING_TIERS[0];
};

const ratingEventSchema = new mongoose.Schema(
    {
        assessmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assesment',
            required: true,
        },
        topic: { type: String, required: true },
        score: { type: Number, required: true },
        delta: { type: Number, required: true },
        ratingAfter: { type: Number, required: true },
        breakdown: {
            baseChange: Number,
            difficultyMult: Number,
            recencyFactor: Number,
            timeBonus: Number,
        },
    },
    { _id: true, timestamps: true }
);

const userRatingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },

        currentRating: { type: Number, default: 1500, min: 0 },
        peakRating: { type: Number, default: 1500, min: 0 },
        totalAssessments: { type: Number, default: 0 },

        history: [ratingEventSchema],
    },
    { timestamps: true }
);

export default mongoose.model('UserRating', userRatingSchema);
