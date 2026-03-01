import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
    {
        level: {
            type: String,
            enum: ['info', 'warn', 'error'],
            default: 'info',
        },
        message: {
            type: String,
            required: true,
        },
        meta: {
            action: String,
            method: String,
            url: String,
            ip: String,
            userAgent: String,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Log', logSchema);
