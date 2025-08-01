import multer from "multer";
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

// Default local storage configuration
const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Initialize with local storage by default
let storage = localStorage;
console.log('Using local storage (Cloudinary not configured)');

// Function to configure Cloudinary storage
export const configureCloudinaryStorage = () => {
    console.log('Cloudinary ENV:', process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);
    console.log('CLOUDINARY_URL:', process.env.CLOUDINARY_URL);

    // Check if Cloudinary credentials are available
    const hasCloudinaryCredentials = (process.env.CLOUDINARY_CLOUD_NAME && 
                                    process.env.CLOUDINARY_API_KEY && 
                                    process.env.CLOUDINARY_API_SECRET) || 
                                    process.env.CLOUDINARY_URL;

    if (hasCloudinaryCredentials) {
        try {
            // Configure Cloudinary
            if (process.env.CLOUDINARY_URL) {
                // Use CLOUDINARY_URL format
                cloudinary.config({
                    cloudinary_url: process.env.CLOUDINARY_URL
                });
                console.log('Using CLOUDINARY_URL configuration');
            } else {
                // Use individual variables
                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET
                });
                console.log('Using individual Cloudinary variables');
            }

            // Configure Cloudinary storage
            storage = new CloudinaryStorage({
                cloudinary: cloudinary,
                params: {
                    folder: 'vdoct-uploads',
                    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                    transformation: [{ width: 500, height: 500, crop: 'limit' }]
                }
            });
            console.log('Using Cloudinary storage');
        } catch (error) {
            console.error('Failed to configure Cloudinary storage:', error);
            console.log('Falling back to local storage');
        }
    } else {
        console.log('Cloudinary credentials not available, using local storage');
    }
};

const fileFilter = (req, file, callback) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        callback(null, true);
    } else {
        callback(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export default upload;