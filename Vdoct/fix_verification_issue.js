import mongoose from 'mongoose';
import doctorModel from './backend/models/doctorModel.js';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vdoct';

async function fixVerificationIssue() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Get all doctors
        const allDoctors = await doctorModel.find({});
        console.log(`\n=== Total doctors found: ${allDoctors.length} ===`);

        if (allDoctors.length === 0) {
            console.log('No doctors found in database!');
            return;
        }

        // Fix 1: Update doctors with missing verification fields
        console.log('\n=== Fix 1: Adding verification fields to doctors ===');
        const updateResult1 = await doctorModel.updateMany(
            {
                $or: [
                    { verificationStatus: { $exists: false } },
                    { isVerified: { $exists: false } }
                ]
            },
            {
                $set: {
                    isVerified: false,
                    verificationStatus: 'pending',
                    verificationNotes: 'Auto-updated: Verification fields added',
                    verifiedBy: null,
                    verifiedAt: null,
                    licenseNumber: '',
                    registrationNumber: ''
                }
            }
        );
        console.log(`Updated ${updateResult1.modifiedCount} doctors with missing verification fields`);

        // Fix 2: Update doctors with undefined/null verification status
        console.log('\n=== Fix 2: Fixing undefined verification status ===');
        const updateResult2 = await doctorModel.updateMany(
            {
                $or: [
                    { verificationStatus: null },
                    { verificationStatus: undefined }
                ]
            },
            {
                $set: {
                    verificationStatus: 'pending',
                    isVerified: false,
                    verificationNotes: 'Auto-updated: Status was undefined'
                }
            }
        );
        console.log(`Updated ${updateResult2.modifiedCount} doctors with undefined verification status`);

        // Fix 3: Ensure all doctors have proper verification status
        console.log('\n=== Fix 3: Ensuring all doctors have proper verification status ===');
        const updateResult3 = await doctorModel.updateMany(
            {
                verificationStatus: { $nin: ['pending', 'approved', 'rejected'] }
            },
            {
                $set: {
                    verificationStatus: 'pending',
                    isVerified: false,
                    verificationNotes: 'Auto-updated: Invalid status corrected'
                }
            }
        );
        console.log(`Updated ${updateResult3.modifiedCount} doctors with invalid verification status`);

        // Verify the fixes
        console.log('\n=== Verification of fixes ===');
        const pendingDoctors = await doctorModel.find({ verificationStatus: 'pending' });
        const approvedDoctors = await doctorModel.find({ verificationStatus: 'approved' });
        const rejectedDoctors = await doctorModel.find({ verificationStatus: 'rejected' });
        const totalDoctors = await doctorModel.find({});

        console.log(`Total doctors: ${totalDoctors.length}`);
        console.log(`Pending verification: ${pendingDoctors.length}`);
        console.log(`Approved: ${approvedDoctors.length}`);
        console.log(`Rejected: ${rejectedDoctors.length}`);

        // Show pending doctors
        if (pendingDoctors.length > 0) {
            console.log('\n=== Pending Doctors (should appear in verification page) ===');
            pendingDoctors.forEach((doctor, index) => {
                console.log(`${index + 1}. ${doctor.name} - ${doctor.email}`);
            });
        } else {
            console.log('\n⚠️  No pending doctors found. This might mean:');
            console.log('   - All doctors are already verified');
            console.log('   - All doctors are rejected');
            console.log('   - There are no doctors in the database');
        }

        // Test the API query
        console.log('\n=== Testing API Query ===');
        const apiTestDoctors = await doctorModel.find({ 
            verificationStatus: 'pending' 
        }).select('-password');
        console.log(`API query result: ${apiTestDoctors.length} pending doctors`);

        console.log('\n✅ Verification issue fix completed!');
        console.log('\n📋 Next steps:');
        console.log('1. Restart your backend server');
        console.log('2. Go to admin panel > Doctor Verification');
        console.log('3. You should now see pending doctors to verify');
        
    } catch (error) {
        console.error('❌ Error fixing verification issue:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

fixVerificationIssue(); 