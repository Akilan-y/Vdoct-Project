import mongoose from 'mongoose';
import doctorModel from './backend/models/doctorModel.js';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vdoct';

async function updateExistingDoctorsVerification() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all doctors that don't have verificationStatus set
        const doctorsToUpdate = await doctorModel.find({
            $or: [
                { verificationStatus: { $exists: false } },
                { isVerified: { $exists: false } }
            ]
        });

        console.log(`Found ${doctorsToUpdate.length} doctors that need verification status update`);

        if (doctorsToUpdate.length > 0) {
            // Update all existing doctors to have pending verification status
            const updateResult = await doctorModel.updateMany(
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
                        verificationNotes: 'Auto-updated from existing data',
                        verifiedBy: null,
                        verifiedAt: null
                    }
                }
            );

            console.log(`Updated ${updateResult.modifiedCount} doctors with verification status`);
        }

        // Now let's check the current status
        const pendingDoctors = await doctorModel.find({ verificationStatus: 'pending' });
        const verifiedDoctors = await doctorModel.find({ verificationStatus: 'approved' });
        const rejectedDoctors = await doctorModel.find({ verificationStatus: 'rejected' });

        console.log('\n=== Current Verification Status ===');
        console.log(`Pending verification: ${pendingDoctors.length}`);
        console.log(`Verified: ${verifiedDoctors.length}`);
        console.log(`Rejected: ${rejectedDoctors.length}`);

        // Show some example doctors
        if (pendingDoctors.length > 0) {
            console.log('\n=== Sample Pending Doctors ===');
            pendingDoctors.slice(0, 3).forEach((doctor, index) => {
                console.log(`${index + 1}. ${doctor.name} - ${doctor.speciality}`);
            });
        }

        console.log('\n✅ Verification status update completed!');
        
    } catch (error) {
        console.error('❌ Error updating verification status:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

updateExistingDoctorsVerification(); 