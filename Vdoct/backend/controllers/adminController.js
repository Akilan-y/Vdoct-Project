import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";

// API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for adding Doctor (with image upload)
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }
        
        // Check if doctor already exists
        const existingDoctor = await doctorModel.findOne({ email });
        if (existingDoctor) {
            return res.json({ success: false, message: "Doctor with this email already exists" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)
        
        // Handle image upload - use filename for database, not full path
        let imagePath = null;
        if (req.file) {
            imagePath = req.file.filename; // Just the filename, not the full path
            console.log('Image uploaded:', req.file.filename);
        } else {
            // Set a default image if none uploaded
            imagePath = 'default-doctor.png';
        }
        
        const doctorData = {
            name,
            email,
            password: hashedPassword,
            image: imagePath,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now(),
            // Explicitly set verification status
            isVerified: false,
            verificationStatus: 'pending'
        }
        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        res.json({ success: true, message: 'Doctor Added' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for adding Patient (with image upload)
const addPatient = async (req, res) => {
    try {
        const { name, email, password, phone, gender, dob, address } = req.body
        if (!name || !email || !password || !phone || !gender || !dob || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long" })
        }
        
        // Check if patient already exists
        const existingPatient = await userModel.findOne({ email });
        if (existingPatient) {
            return res.json({ success: false, message: "Patient with this email already exists" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)
        
        // Handle image upload - use filename for database, not full path
        let imagePath = null;
        if (req.file) {
            imagePath = req.file.filename; // Just the filename, not the full path
            console.log('Patient image uploaded:', req.file.filename);
        } else {
            // Set a default image if none uploaded
            imagePath = 'default-patient.png';
        }
        
        const patientData = {
            name,
            email,
            password: hashedPassword,
            image: imagePath,
            phone,
            gender,
            dob,
            address: JSON.parse(address),
            date: Date.now()
        }
        const newPatient = new userModel(patientData)
        await newPatient.save()
        res.json({ success: true, message: 'Patient Added Successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all users list for admin panel
const allUsers = async (req, res) => {
    try {

        const users = await userModel.find({}).select('-password')
        res.json({ success: true, users })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        console.log('Admin dashboard request received');

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        console.log(`Found ${doctors.length} doctors, ${users.length} users, ${appointments.length} appointments`);

        // Process appointments to ensure they have proper docData
        const processedAppointments = appointments.map((appointment, index) => {
            console.log(`Processing appointment ${index}:`, {
                docId: appointment.docId,
                hasDocData: !!appointment.docData,
                docDataName: appointment.docData?.name
            });

            // If docData is missing or incomplete, try to find the doctor
            if (!appointment.docData || !appointment.docData.name) {
                // Safely find the doctor with proper null checks
                const doctor = doctors.find(doc => {
                    if (!doc || !doc._id || !appointment.docId) {
                        console.log('Skipping doctor lookup due to missing data:', {
                            hasDoc: !!doc,
                            hasDocId: !!doc?._id,
                            hasAppointmentDocId: !!appointment.docId
                        });
                        return false;
                    }
                    const docIdStr = doc._id.toString();
                    const appointmentDocIdStr = appointment.docId.toString();
                    console.log('Comparing IDs:', { docIdStr, appointmentDocIdStr });
                    return docIdStr === appointmentDocIdStr;
                });
                
                if (doctor) {
                    console.log('Found doctor for appointment:', doctor.name);
                    appointment.docData = {
                        name: doctor.name || 'Unknown Doctor',
                        image: doctor.image || 'default-doctor.png',
                        speciality: doctor.speciality || 'Unknown'
                    };
                } else {
                    console.log('No doctor found for appointment, using fallback');
                    // Fallback if doctor not found
                    appointment.docData = {
                        name: 'Unknown Doctor',
                        image: 'default-doctor.png',
                        speciality: 'Unknown'
                    };
                }
            }
            return appointment;
        });

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: processedAppointments.reverse()
        }

        console.log('Dashboard data prepared successfully');
        res.json({ success: true, dashData })

    } catch (error) {
        console.log('Error in adminDashboard:', error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify a doctor
const verifyDoctor = async (req, res) => {
    try {
        const { doctorId, status, notes, licenseNumber, registrationNumber } = req.body;
        
        // Don't rely on req.user.id for now, just use 'admin' as the verifier
        const adminId = 'admin';

        console.log('Verification request:', {
            doctorId,
            status,
            adminId,
            hasUser: !!req.user,
            userObject: req.user
        });

        if (!doctorId || !status) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        // Allow approved, rejected, and pending status
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.json({ success: false, message: "Invalid status" });
        }

        const updateData = {
            verificationStatus: status,
            isVerified: status === 'approved',
            verificationNotes: notes || '',
            verifiedBy: adminId,
            verifiedAt: Date.now()
        };

        if (licenseNumber) {
            updateData.licenseNumber = licenseNumber;
        }

        if (registrationNumber) {
            updateData.registrationNumber = registrationNumber;
        }

        console.log('Updating doctor with data:', updateData);

        const updatedDoctor = await doctorModel.findByIdAndUpdate(doctorId, updateData, { new: true });

        if (!updatedDoctor) {
            return res.json({ success: false, message: "Doctor not found" });
        }

        console.log('Doctor updated successfully:', updatedDoctor.name);

        // Customize success message based on status
        let successMessage = '';
        if (status === 'approved') {
            successMessage = 'Doctor verified successfully';
        } else if (status === 'rejected') {
            successMessage = 'Doctor rejected successfully';
        } else if (status === 'pending') {
            successMessage = 'Doctor reverted to pending successfully';
        }

        res.json({ 
            success: true, 
            message: successMessage
        });

    } catch (error) {
        console.log('Error in verifyDoctor:', error);
        res.json({ success: false, message: error.message });
    }
}

// API to get doctors pending verification
const getPendingDoctors = async (req, res) => {
    try {
        console.log('Fetching pending doctors...');
        
        // First, let's see all doctors and their verification status
        const allDoctors = await doctorModel.find({}).select('-password');
        console.log(`Total doctors in database: ${allDoctors.length}`);
        
        allDoctors.forEach((doctor, index) => {
            console.log(`Doctor ${index + 1}: ${doctor.name} - verificationStatus: ${doctor.verificationStatus}, isVerified: ${doctor.isVerified}`);
        });
        
        // Get doctors that are pending OR don't have verification status set
        const pendingDoctors = await doctorModel.find({ 
            $or: [
                { verificationStatus: 'pending' },
                { verificationStatus: { $exists: false } },
                { verificationStatus: null },
                { verificationStatus: undefined }
            ]
        }).select('-password');
        
        console.log(`Found ${pendingDoctors.length} doctors with pending verification status`);
        
        res.json({ success: true, doctors: pendingDoctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get doctor verification details
const getDoctorVerificationDetails = async (req, res) => {
    try {
        const { doctorId } = req.params;
        
        const doctor = await doctorModel.findById(doctorId).select('-password');
        
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" });
        }

        res.json({ success: true, doctor });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Test authentication route
const testAuth = async (req, res) => {
    try {
        res.json({ success: true, message: 'Admin authentication working' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export {
    loginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    addDoctor,
    addPatient,
    allDoctors,
    allUsers,
    adminDashboard,
    verifyDoctor,
    getPendingDoctors,
    getDoctorVerificationDetails,
    testAuth
}