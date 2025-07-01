import mongoose from 'mongoose';
import doctorModel from './backend/models/doctorModel.js';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vdoct';

async function diagnoseVerificationIssue() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Get all doctors
        const allDoctors = await doctorModel.find({});
        console.log(`\n=== Total doctors in database: ${allDoctors.length} ===`);

        if (allDoctors.length === 0) {
            console.log('No doctors found in database!');
            return;
        }

        // Analyze each doctor's verification fields
        console.log('\n=== Doctor Verification Analysis ===');
        allDoctors.forEach((doctor, index) => {
            console.log(`\nDoctor ${index + 1}: ${doctor.name}`);
            console.log(`  - Email: ${doctor.email}`);
            console.log(`  - verificationStatus: ${doctor.verificationStatus || 'NOT SET'}`);
            console.log(`  - isVerified: ${doctor.isVerified || 'NOT SET'}`);
            console.log(`  - Has verificationNotes: ${doctor.verificationNotes ? 'YES' : 'NO'}`);
            console.log(`  - Has verifiedBy: ${doctor.verifiedBy ? 'YES' : 'NO'}`);
            console.log(`  - Has verifiedAt: ${doctor.verifiedAt ? 'YES' : 'NO'}`);
        });

        // Check for doctors without verification fields
        const doctorsWithoutVerification = allDoctors.filter(doc => 
            !doc.verificationStatus || !doc.hasOwnProperty('isVerified')
        );
        
        console.log(`\n=== Doctors without verification fields: ${doctorsWithoutVerification.length} ===`);
        
        if (doctorsWithoutVerification.length > 0) {
            console.log('These doctors need verification fields added:');
            doctorsWithoutVerification.forEach((doctor, index) => {
                console.log(`${index + 1}. ${doctor.name} (${doctor.email})`);
            });
        }

        // Check pending doctors
        const pendingDoctors = allDoctors.filter(doc => doc.verificationStatus === 'pending');
        console.log(`\n=== Doctors with pending status: ${pendingDoctors.length} ===`);
        
        if (pendingDoctors.length > 0) {
            console.log('Pending doctors:');
            pendingDoctors.forEach((doctor, index) => {
                console.log(`${index + 1}. ${doctor.name} (${doctor.email})`);
            });
        }

        // Check verified doctors
        const verifiedDoctors = allDoctors.filter(doc => doc.verificationStatus === 'approved');
        console.log(`\n=== Doctors with approved status: ${verifiedDoctors.length} ===`);

        // Check rejected doctors
        const rejectedDoctors = allDoctors.filter(doc => doc.verificationStatus === 'rejected');
        console.log(`\n=== Doctors with rejected status: ${rejectedDoctors.length} ===`);

        // Check doctors with undefined/null verification status
        const undefinedStatusDoctors = allDoctors.filter(doc => 
            doc.verificationStatus === undefined || doc.verificationStatus === null
        );
        console.log(`\n=== Doctors with undefined/null status: ${undefinedStatusDoctors.length} ===`);

        if (undefinedStatusDoctors.length > 0) {
            console.log('These doctors have undefined verification status:');
            undefinedStatusDoctors.forEach((doctor, index) => {
                console.log(`${index + 1}. ${doctor.name} (${doctor.email})`);
            });
        }

        console.log('\n=== DIAGNOSIS COMPLETE ===');
        
    } catch (error) {
        console.error('❌ Error during diagnosis:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

diagnoseVerificationIssue(); 