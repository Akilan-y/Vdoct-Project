import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
    // Verification fields
    isVerified: { type: Boolean, default: false },
    verificationStatus: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    verificationDocuments: {
        medicalLicense: { type: String, default: null },
        degreeCertificate: { type: String, default: null },
        identityProof: { type: String, default: null },
        experienceCertificate: { type: String, default: null }
    },
    verificationNotes: { type: String, default: '' },
    verifiedBy: { type: String, default: null },
    verifiedAt: { type: Number, default: null },
    licenseNumber: { type: String, default: '' },
    registrationNumber: { type: String, default: '' }
}, { minimize: false })

const doctorModel = mongoose.models.doctor || mongoose.model("doctor", doctorSchema);
export default doctorModel;