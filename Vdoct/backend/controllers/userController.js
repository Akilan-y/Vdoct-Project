import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import Razorpay from "razorpay";
import Stripe from "stripe";
import crypto from "crypto";

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret"
});

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// API to register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long" })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)
        const userData = { name, email, password: hashedPassword }
        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.json({ success: true, token })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id
        const userData = await userModel.findById(userId).select('-password')
        res.json({ success: true, userData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile (with image upload)
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, dob, gender, bloodGroup } = req.body
        const userId = req.user.id
        
        // Debug: Log received data
        console.log('Received profile update data:', {
            name,
            phone,
            address,
            dob,
            gender,
            bloodGroup,
            hasImage: !!req.file,
            imageFile: req.file?.path
        })
        
        // Check for required fields
        if (!name || !phone || !dob || !gender) {
            console.log('Missing fields:', { name: !!name, phone: !!phone, dob: !!dob, gender: !!gender })
            return res.json({ success: false, message: "Data Missing" })
        }
        
        // Validate address
        if (!address) {
            console.log('Address is missing')
            return res.json({ success: false, message: "Address is required" })
        }
        
        let parsedAddress
        try {
            parsedAddress = JSON.parse(address)
        } catch (error) {
            console.log('Address parsing error:', error)
            return res.json({ success: false, message: "Invalid address format" })
        }
        
        // Prepare update data
        const updateData = { 
            name: name.trim(), 
            phone: phone.trim(), 
            address: parsedAddress, 
            dob, 
            gender 
        }
        
        // Add blood group if provided
        if (bloodGroup && bloodGroup !== 'Not Selected') {
            updateData.bloodGroup = bloodGroup
        }
        
        // If image uploaded, add image field
        if (req.file) {
            updateData.image = req.file.path
            console.log('Image uploaded:', req.file.path)
        }
        
        console.log('Updating user with data:', updateData)
        
        await userModel.findByIdAndUpdate(userId, updateData)
        res.json({ success: true, message: 'Profile Updated' })
    } catch (error) {
        console.log('Profile update error:', error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment 
const bookAppointment = async (req, res) => {
    try {
        const { docId, slotDate, slotTime } = req.body
        const userId = req.user.id
        const docData = await doctorModel.findById(docId).select("-password")
        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }
        let slots_booked = docData.slots_booked
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }
        const userData = await userModel.findById(userId).select("-password")
        delete docData.slots_booked
        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }
        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        res.json({ success: true, message: 'Appointment Booked' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const userId = req.user.id
        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.userId && appointmentData.userId.toString() !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }
        appointmentData.cancelled = true
        await appointmentData.save()
        res.json({ success: true, message: 'Appointment Cancelled' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to list appointments
const listAppointment = async (req, res) => {
    try {
        const userId = req.user.id
        const appointments = await appointmentModel.find({ userId }).populate('docId', 'name speciality degree experience image address phone')
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to create Razorpay order
const paymentRazorpay = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user.id;
        
        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" });
        }
        
        if (appointment.userId && appointment.userId.toString() !== userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }
        
        const options = {
            amount: appointment.amount * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `appointment_${appointmentId}`,
        };
        
        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to verify Razorpay payment
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const userId = req.user.id;
        
        // Verify the payment signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
            .update(body.toString())
            .digest("hex");
        
        if (expectedSignature === razorpay_signature) {
            // Payment is successful, update appointment
            await appointmentModel.findByIdAndUpdate(
                { _id: req.body.appointmentId },
                { payment: true }
            );
            res.json({ success: true, message: "Payment successful" });
        } else {
            res.json({ success: false, message: "Payment verification failed" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to create Stripe payment session
const paymentStripe = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user.id;
        
        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" });
        }
        
        if (appointment.userId && appointment.userId.toString() !== userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `Appointment with ${appointment.docData.name}`,
                        },
                        unit_amount: appointment.amount * 100, // Stripe expects amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify?success=true&appointmentId=${appointmentId}`,
            cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/my-appointments`,
        });
        
        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to verify Stripe payment
const verifyStripe = async (req, res) => {
    try {
        const { success, appointmentId } = req.body;
        const userId = req.user.id;
        
        if (success === "true") {
            await appointmentModel.findByIdAndUpdate(
                { _id: appointmentId },
                { payment: true }
            );
            res.json({ success: true, message: "Payment successful" });
        } else {
            res.json({ success: false, message: "Payment failed" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay,
    paymentStripe,
    verifyStripe
}