import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import SessionSlot from '../models/sessionSlotModel.js';

// API for doctor Login 
const loginDoctor = async (req, res) => {

    try {

        const { email, password } = req.body
        console.log('Doctor login attempt for email:', email);
        console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
        console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
        
        const user = await doctorModel.findOne({ email })

        if (!user) {
            console.log('Doctor not found for email:', email);
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            console.log('Generated token for doctor login:', token.substring(0, 20) + '...');
            console.log('For user id:', user._id);
            console.log('Using JWT_SECRET length:', process.env.JWT_SECRET.length);
            
            // Test token verification immediately
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log('Token verification test successful:', decoded);
            } catch (verifyError) {
                console.error('Token verification test failed:', verifyError);
            }
            
            res.json({ success: true, token })
        } else {
            console.log('Password mismatch for doctor:', email);
            res.json({ success: false, message: "Invalid credentials" })
        }


    } catch (error) {
        console.log('Doctor login error:', error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.json({ success: false, message: 'Authentication error - user not found' });
        }

        const docId = req.user.id;
        const appointments = await appointmentModel.find({ docId }).populate('userId', 'name email image dob');

        res.json({ success: true, appointments });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.json({ success: false, message: 'Authentication error - user not found' });
        }

        const { appointmentId } = req.body;
        const docId = req.user.id;

        const appointmentData = await appointmentModel.findById(appointmentId);
        if (appointmentData && appointmentData.docId && appointmentData.docId.toString() === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
            return res.json({ success: true, message: 'Appointment Cancelled' });
        }

        res.json({ success: false, message: 'Appointment not found or unauthorized' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.json({ success: false, message: 'Authentication error - user not found' });
        }

        const { appointmentId } = req.body;
        const docId = req.user.id;

        const appointmentData = await appointmentModel.findById(appointmentId);
        if (appointmentData && appointmentData.docId && appointmentData.docId.toString() === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
            return res.json({ success: true, message: 'Appointment Completed' });
        }

        res.json({ success: false, message: 'Appointment not found or unauthorized' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get all doctors list for Frontend
const doctorList = async (req, res) => {
    try {
        // Only return verified and available doctors for the frontend
        const doctors = await doctorModel.find({ 
            available: true, 
            isVerified: true,
            verificationStatus: 'approved'
        }).select(['-password', '-email'])
        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to change doctor availablity for Admin and Doctor Panel
const changeAvailablity = async (req, res) => {
    try {
        // Use doctorId from the request body for admin panel
        const docId = req.body.doctorId;

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: 'Availablity Changed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor profile for  Doctor Panel
const doctorProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.json({ success: false, message: 'Authentication error - user not found' });
        }

        const docId = req.user.id;
        const profileData = await doctorModel.findById(docId).select('-password');

        res.json({ success: true, profileData });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to update doctor profile data from  Doctor Panel
const updateDoctorProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.json({ success: false, message: 'Authentication error - user not found' });
        }

        const { fees, address, available, about, upiId, licenseNumber, registrationNumber, notes } = req.body;
        const docId = req.user.id;

        console.log('=== DOCTOR PROFILE UPDATE ===');
        console.log('Request body:', req.body);
        console.log('Extracted UPI ID:', upiId);

        const updateData = {
            fees,
            address,
            available,
            about,
            ...(upiId !== undefined && { upiId }),
            ...(licenseNumber !== undefined && { licenseNumber }),
            ...(registrationNumber !== undefined && { registrationNumber }),
            ...(notes !== undefined && { notes })
        };

        console.log('Final update data:', updateData);

        await doctorModel.findByIdAndUpdate(docId, updateData);

        console.log('Profile updated successfully for doctor ID:', docId);

        res.json({ success: true, message: 'Profile Updated' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {
        console.log('Doctor dashboard request - req.user:', req.user);
        
        if (!req.user || !req.user.id) {
            console.log('Error: req.user or req.user.id is undefined');
            return res.json({ success: false, message: 'Authentication error - user not found' });
        }

        const docId = req.user.id;
        console.log('Doctor ID from token:', docId);

        const appointments = await appointmentModel.find({ docId }).populate('userId', 'name email image dob');
        console.log('Found appointments:', appointments.length);

        // Debug appointment structure
        if (appointments.length > 0) {
            console.log('Sample appointment structure:', {
                _id: appointments[0]._id,
                userId: appointments[0].userId,
                userIdType: typeof appointments[0].userId,
                hasUserIdId: !!appointments[0].userId?._id,
                docId: appointments[0].docId,
                docIdType: typeof appointments[0].docId
            });
        }

        let earnings = 0;

        appointments.forEach((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount || 0;
            }
        });

        let patients = [];

        appointments.forEach((item) => {
            // Handle both populated and unpopulated userId
            let userId = null;
            if (item.userId) {
                if (typeof item.userId === 'object' && item.userId._id) {
                    // Populated userId (ObjectId)
                    userId = item.userId._id.toString();
                } else if (typeof item.userId === 'string') {
                    // Unpopulated userId (String)
                    userId = item.userId;
                }
            }
            
            if (userId && !patients.includes(userId)) {
                patients.push(userId);
            }
        });

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        };

        console.log('Dashboard data prepared:', dashData);
        res.json({ success: true, dashData });

    } catch (error) {
        console.log('Error in doctorDashboard:', error);
        res.json({ success: false, message: error.message });
    }
}

// Add a session slot
const addSessionSlot = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.json({ success: false, message: 'Authentication error - user not found' });
    }
    const { date, startTime, endTime } = req.body;
    if (!date || !startTime || !endTime) {
      return res.json({ success: false, message: 'All fields are required' });
    }
    const slot = await SessionSlot.create({
      doctorId: req.user.id,
      date,
      startTime,
      endTime
    });
    res.json({ success: true, slot });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get all session slots for the doctor
const getSessionSlots = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.json({ success: false, message: 'Authentication error - user not found' });
    }
    const slots = await SessionSlot.find({ doctorId: req.user.id }).sort({ date: 1, startTime: 1 });
    res.json({ success: true, slots });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Delete a session slot
const deleteSessionSlot = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.json({ success: false, message: 'Authentication error - user not found' });
    }
    const slotId = req.params.id;
    await SessionSlot.deleteOne({ _id: slotId, doctorId: req.user.id });
    res.json({ success: true, message: 'Slot deleted' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    doctorList,
    changeAvailablity,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile,
    addSessionSlot,
    getSessionSlots,
    deleteSessionSlot
}