import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    // Meeting fields
    meetLink: { type: String, default: null },
    meetingId: { type: String, default: null },
    meetingStatus: { 
        type: String, 
        enum: ['pending', 'scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    // New fields for meeting control
    doctorReady: { type: Boolean, default: false },
    meetingStarted: { type: Boolean, default: false },
    meetingStartTime: { type: Date, default: null },
    meetingEndTime: { type: Date, default: null }
})

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema)
export default appointmentModel