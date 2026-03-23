import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
    {
        question: { type: String, required: true },
        userAnswer: { type: String, default: '' },
        aiEvaluation: {
            score: { type: Number, min: 0, max: 10, default: null },
            feedback: { type: String, default: null },
            strengths: [String],
            improvements: [String],
            idealAnswer: { type: String, default: null },
        },
    },
    { _id: true }
);

const mockInterviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        jobRole: { type: String, required: true },
        experienceLevel: {
            type: String,
            enum: ['fresher', 'junior', 'mid', 'senior'],
            default: 'junior',
        },
        focusAreas: [String],
        totalQuestions: { type: Number, default: 5 },

        questions: [String],
        answers: [answerSchema],

        overallScore: { type: Number, min: 0, max: 100, default: null },
        overallFeedback: { type: String, default: null },
        strengths: [String],
        areasToImprove: [String],

        status: {
            type: String,
            enum: ['pending', 'in_progress', 'evaluating', 'completed'],
            default: 'pending',
        },

        currentQuestionIndex: { type: Number, default: 0 },

        startedAt: { type: Date, default: null },
        completedAt: { type: Date, default: null },
        duration: { type: Number, default: null },
    },
    { timestamps: true }
);

mockInterviewSchema.index({ userId: 1, status: 1, createdAt: -1 });

const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);
export default MockInterview;
