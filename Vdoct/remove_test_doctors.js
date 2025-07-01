import mongoose from 'mongoose';
import doctorModel from './backend/models/doctorModel.js';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vdoct';

async function removeTestDoctors() {
    await mongoose.connect(MONGO_URI);
    const result = await doctorModel.deleteMany({
        $or: [
            { name: 'Dr. Test Doctor' },
            { email: /testdoctor/i }
        ]
    });
    console.log(`Removed ${result.deletedCount} test doctor(s).`);
    await mongoose.disconnect();
}

removeTestDoctors(); 