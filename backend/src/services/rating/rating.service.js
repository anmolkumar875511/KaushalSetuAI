import UserRating, { getTierForRating } from '../../models/userRating.model.js';

const INITIAL_RATING = 1500;
const BASE_SCALE = 25;
const DECAY_RATE = 0.05;
const TIME_BONUS_MAX = 0.15;
const AVG_DURATION_S = 300;
const MIN_RATING = 0;

const DIFFICULTY_MULT = { easy: 1.0, medium: 1.4, hard: 1.8 };

const calcDifficultyMult = (questions = []) => {
    if (!questions.length) return DIFFICULTY_MULT.medium;

    const weights = { easy: 1.0, medium: 1.4, hard: 1.8 };
    const avg = questions.reduce((sum, q) => sum + (weights[q.level] ?? 1.4), 0) / questions.length;
    return Number(avg.toFixed(4));
};

const calcTimeBonus = (durationSeconds) => {
    if (!durationSeconds || durationSeconds <= 0) return 0;
    const ratio = durationSeconds / AVG_DURATION_S;
    return Number(Math.max(0, TIME_BONUS_MAX * (1 - ratio)).toFixed(4));
};

export const computeRatingDelta = ({ score, questions, durationSeconds, totalAssessments }) => {
    const difficultyMult = calcDifficultyMult(questions);
    const recencyFactor = 1 / (1 + totalAssessments * DECAY_RATE);
    const timeBonus = calcTimeBonus(durationSeconds);

    const rawBase = ((score - 50) / 50) * BASE_SCALE * difficultyMult;
    const timeMult = rawBase > 0 ? 1 + timeBonus : 1;
    const delta = Math.round(rawBase * recencyFactor * timeMult);

    return {
        delta,
        breakdown: {
            baseChange: Number(rawBase.toFixed(2)),
            difficultyMult,
            recencyFactor: Number(recencyFactor.toFixed(4)),
            timeBonus,
        },
    };
};

export const updateUserRating = async ({ userId, assessment }) => {
    /* Find or create */
    let record = await UserRating.findOne({ user: userId });
    if (!record) {
        record = new UserRating({ user: userId, currentRating: INITIAL_RATING });
    }

    const durationSeconds = assessment.duration ?? null;

    const { delta, breakdown } = computeRatingDelta({
        score: assessment.score,
        questions: assessment.questions ?? [],
        durationSeconds,
        totalAssessments: record.totalAssessments,
    });

    const newRating = Math.max(MIN_RATING, record.currentRating + delta);

    record.history.push({
        assessmentId: assessment._id,
        topic: assessment.topic,
        score: assessment.score,
        delta,
        ratingAfter: newRating,
        breakdown,
    });

    record.currentRating = newRating;
    record.peakRating = Math.max(record.peakRating, newRating);
    record.totalAssessments = record.totalAssessments + 1;

    await record.save();

    return {
        currentRating: record.currentRating,
        peakRating: record.peakRating,
        delta,
        tier: getTierForRating(record.currentRating),
        breakdown,
    };
};
