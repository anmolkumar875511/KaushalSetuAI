import Log from '../models/log.model.js';

export const logger = async ({ level = 'info', message, action, req, userId, error }) => {
    try {
        const finalMessage = error ? `${message} | Error: ${error.message}` : message;

        const logData = {
            level,
            message: finalMessage,
            meta: {
                action: action || 'GENERAL_SYSTEM_EVENT',
                method: req?.method,
                url: req?.originalUrl,
                ip: req?.ip,
                userAgent: req?.get('User-Agent'),
                stack: error?.stack,
            },
            user: userId || req?.user?._id || null,
        };

        await Log.create(logData);
    } catch (err) {
        console.error('CRITICAL: Logger failed to save to MongoDB:', err.message);
        console.info('Original Log Attempt:', message);
    }
};
