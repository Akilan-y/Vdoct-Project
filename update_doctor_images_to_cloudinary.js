import mongoose from 'mongoose';
import doctorModel from './Vdoct/backend/models/doctorModel.js';

const MONGO_URI = 'mongodb://localhost:27017/your-db-name'; // <-- UPDATE THIS to your actual MongoDB URI
const DEFAULT_CLOUDINARY_URL = 'https://res.cloudinary.com/your-cloud-name/image/upload/vdoct-uploads/default-doctor.png'; // <-- UPDATE THIS to your actual Cloudinary default image URL

async function updateDoctorImages() {
  await mongoose.connect(MONGO_URI);

  const doctors = await doctorModel.find({});
  for (const doc of doctors) {
    if (doc.image && !doc.image.startsWith('http')) {
      doc.image = DEFAULT_CLOUDINARY_URL;
      await doc.save();
      console.log(`Updated doctor ${doc.name} to use default Cloudinary image.`);
    }
  }

  await mongoose.disconnect();
  console.log('Done updating doctor images.');
}

updateDoctorImages(); 