import express from 'express';
import { createUPIPayment, verifyPayment, getPaymentStatus } from '../controllers/paymentController.js';
import authUser from '../middleware/authUser.js';

const paymentRouter = express.Router();

// Create UPI payment
paymentRouter.post('/create-upi-payment', authUser, createUPIPayment);

// Verify payment (manual verification)
paymentRouter.post('/verify-payment', authUser, verifyPayment);

// Get payment status
paymentRouter.get('/payment-status/:appointmentId', authUser, getPaymentStatus);

export default paymentRouter; 