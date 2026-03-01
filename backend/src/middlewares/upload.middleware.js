import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadAvatarMiddleware = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG, JPG and PNG allowed'), false);
        }
        cb(null, true);
    },
});

export const uploadResumeMiddleware = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only PDF allowed'), false);
        }
        cb(null, true);
    },
});
