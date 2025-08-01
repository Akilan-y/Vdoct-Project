import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = async () => {
    // Debug print for environment variables
    console.log('Cloudinary ENV:', process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);
    console.log('CLOUDINARY_URL:', process.env.CLOUDINARY_URL);

    // Check for missing CLOUDINARY_URL
    if (!process.env.CLOUDINARY_URL) {
        console.error('ERROR: CLOUDINARY_URL environment variable is missing. Please check your .env file.');
        console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('CLOUDINARY')));
        throw new Error('CLOUDINARY_URL environment variable missing');
    }

    try {
        cloudinary.config({
            cloudinary_url: process.env.CLOUDINARY_URL
        });
        console.log('Cloudinary Connected Successfully');
    } catch (error) {
        console.error('Failed to configure Cloudinary:', error);
        throw error;
    }
}

export default connectCloudinary;