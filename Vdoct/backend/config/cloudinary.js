import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = async () => {
    // Debug print for CLOUDINARY_URL
    console.log('CLOUDINARY_URL:', process.env.CLOUDINARY_URL);

    // Check for missing CLOUDINARY_URL
    if (!process.env.CLOUDINARY_URL) {
        console.error('ERROR: CLOUDINARY_URL environment variable is missing. Please check your .env file.');
        throw new Error('CLOUDINARY_URL environment variable missing');
    }

    cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL
    });
    console.log('Cloudinary Connected');
}

export default connectCloudinary;