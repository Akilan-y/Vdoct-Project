import express from 'express';
import { loginAdmin, appointmentsAdmin, appointmentCancel, addDoctor, addPatient, allDoctors, allUsers, adminDashboard, verifyDoctor, getPendingDoctors, getDoctorVerificationDetails, testAuth } from '../controllers/adminController.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';
const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin)
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor)
adminRouter.post("/add-patient", authAdmin, upload.single('image'), addPatient)
// adminRouter.post("/delete-doctor", authAdmin, deleteDoctor) // Removed for now
adminRouter.get("/all-doctors", authAdmin, allDoctors)
adminRouter.get("/doctors", authAdmin, allDoctors)
adminRouter.get("/users", authAdmin, allUsers)
adminRouter.get("/dashboard", authAdmin, adminDashboard)
adminRouter.post("/appointments", authAdmin, appointmentsAdmin)
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
adminRouter.post("/change-availability", authAdmin, changeAvailablity)

// Verification routes
adminRouter.post("/verify-doctor", authAdmin, verifyDoctor)
adminRouter.get("/pending-doctors", authAdmin, getPendingDoctors)
adminRouter.get("/doctor-verification/:doctorId", authAdmin, getDoctorVerificationDetails)

// Test route
adminRouter.get("/test-auth", authAdmin, testAuth)

export default adminRouter;