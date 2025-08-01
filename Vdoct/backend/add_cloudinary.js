import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');

// Read existing .env file
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
    console.log('No existing .env file found, creating new one');
}

// Check if Cloudinary variables already exist
if (!envContent.includes('CLOUDINARY_URL')) {
    // Add Cloudinary configuration
    const cloudinaryConfig = `

# Cloudinary Configuration
CLOUDINARY_URL=cloudinary://286743949566123:Bp8rBMJIfla07EpcvEM3zjjbsa8@dxcmtg6hl
CLOUDINARY_CLOUD_NAME=dxcmtg6hl
CLOUDINARY_API_KEY=286743949566123
CLOUDINARY_API_SECRET=Bp8rBMJIfla07EpcvEM3zjjbsa8
`;

    // Append to .env file
    fs.appendFileSync(envPath, cloudinaryConfig);
    console.log('✅ Cloudinary variables added to .env file');
} else {
    console.log('✅ Cloudinary variables already exist in .env file');
}

// Test reading the variables
import dotenv from 'dotenv';
dotenv.config({ path: envPath });

console.log('Testing environment variables:');
console.log('CLOUDINARY_URL:', process.env.CLOUDINARY_URL ? 'SET' : 'NOT SET');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'); 