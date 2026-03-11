import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },

    options: [
        {
            type: String,
            required: true,
        },
    ],

    correctAnswer: {
        type: String,
        required: true,
    },

    userAnswer: {
        type: String,
        default: null,
    },

    level: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true,
    },
});

const assessmentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        topic: {
            type: String,
            required: true,
        },

        questions: [questionSchema],

        score: {
            type: Number,
            default: 0,
        },

        completed: {
            type: Boolean,
            default: false,
        },

        timeStarted: {
            type: Date,
            default: Date.now,
        },

        timeCompleted: {
            type: Date,
        },

        duration: {
            type: Number,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Assesment', assessmentSchema);
