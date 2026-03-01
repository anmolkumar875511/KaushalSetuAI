import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = async (fileBuffer) => {
    if (!fileBuffer) return null;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
                folder: 'skillbridge_avatars',
            },
            (error, result) => {
                if (error) return reject(error);

                resolve({
                    url: result.secure_url,
                    id: result.public_id,
                });
            }
        );

        uploadStream.end(fileBuffer);
    });
};
