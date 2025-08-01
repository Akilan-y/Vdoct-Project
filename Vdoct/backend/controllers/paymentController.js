import QRCode from 'qrcode';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';

// UPI Payment Controller
const createUPIPayment = async (req, res) => {
    try {
        const { amount, appointmentId, patientName, doctorName, doctorId } = req.body;
        
        // Get doctor's UPI ID if available, otherwise use default
        let upiId = process.env.UPI_ID || 'uthayakilan@okaxis'; // Default UPI ID for the system
        
        if (doctorId) {
            const doctor = await doctorModel.findById(doctorId).select('upiId');
            if (doctor && doctor.upiId && doctor.upiId.trim() !== '') {
                upiId = doctor.upiId;
            }
        }
        
        // Generate UPI payment link
        const paymentLink = generateUPILink(amount, upiId, patientName, doctorName, appointmentId);
        
        // Generate QR code for the payment
        const qrCodeDataURL = await generateUPIQR(paymentLink);
        
        res.json({
            success: true,
            paymentData: {
                upiId,
                amount,
                paymentLink,
                qrCode: qrCodeDataURL,
                appointmentId,
                patientName,
                doctorName
            }
        });
    } catch (error) {
        console.log('UPI Payment Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Generate UPI payment link
const generateUPILink = (amount, upiId, patientName, doctorName, appointmentId) => {
    const note = `Appointment with ${doctorName} - ID: ${appointmentId}`;
    const encodedNote = encodeURIComponent(note);
    const encodedPatientName = encodeURIComponent(patientName);
    
    return `upi://pay?pa=${upiId}&pn=${encodedPatientName}&tn=${encodedNote}&am=${amount}&cu=INR`;
};

// Generate QR code for UPI payment
const generateUPIQR = async (upiLink) => {
    try {
        const qrCodeDataURL = await QRCode.toDataURL(upiLink, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        return qrCodeDataURL;
    } catch (error) {
        console.log('QR Code Generation Error:', error);
        throw new Error('Failed to generate QR code');
    }
};

// Verify payment (manual verification)
const verifyPayment = async (req, res) => {
    try {
        const { appointmentId, transactionId, amount } = req.body;
        
        console.log('=== PAYMENT VERIFICATION ===');
        console.log('Appointment ID:', appointmentId);
        console.log('Transaction ID:', transactionId);
        console.log('Amount:', amount);
        
        // Find and update the appointment
        const appointment = await appointmentModel.findById(appointmentId);
        
        if (!appointment) {
            return res.json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        console.log('Current appointment status:', {
            cancelled: appointment.cancelled,
            payment: appointment.payment,
            isCompleted: appointment.isCompleted
        });
        
        // Check if appointment is already cancelled
        if (appointment.cancelled) {
            return res.json({
                success: false,
                message: 'Cannot process payment for a cancelled appointment'
            });
        }
        
        // Check if payment is already completed
        if (appointment.payment) {
            return res.json({
                success: false,
                message: 'Payment has already been completed for this appointment'
            });
        }
        
        // Update appointment payment status - only update payment-related fields
        const updateData = {
            payment: true,
            paymentDate: Date.now(),
            transactionId: transactionId || 'manual-verification'
        };
        
        console.log('Updating appointment with data:', updateData);
        
        const updatedAppointment = await appointmentModel.findByIdAndUpdate(
            appointmentId, 
            updateData,
            { 
                new: true,
                runValidators: false // Don't run schema validators
            }
        );
        
        console.log('Updated appointment status:', {
            cancelled: updatedAppointment.cancelled,
            payment: updatedAppointment.payment,
            isCompleted: updatedAppointment.isCompleted
        });
        
        console.log('Appointment payment status updated successfully');
        
        res.json({
            success: true,
            message: 'Payment completed successfully! Your appointment is now confirmed.',
            appointmentId,
            transactionId,
            amount,
            paymentStatus: 'completed'
        });
    } catch (error) {
        console.log('Payment Verification Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        
        console.log('=== GET PAYMENT STATUS ===');
        console.log('Appointment ID:', appointmentId);
        
        // Find the appointment in the database
        const appointment = await appointmentModel.findById(appointmentId);
        
        if (!appointment) {
            return res.json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        const paymentStatus = appointment.payment ? 'completed' : 'pending';
        
        console.log('Payment status:', paymentStatus);
        
        res.json({
            success: true,
            paymentStatus,
            appointmentId,
            amount: appointment.amount,
            paymentDate: appointment.paymentDate
        });
    } catch (error) {
        console.log('Get Payment Status Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    createUPIPayment,
    verifyPayment,
    getPaymentStatus
}; 