import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const UPIPayment = ({ appointmentData, onPaymentComplete, onCancel }) => {
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { backendUrl } = useContext(AppContext);

    console.log('UPIPayment component rendered with data:', appointmentData);

    const generatePayment = async () => {
        try {
            setLoading(true);
            console.log('Generating payment for:', appointmentData);
            const { data } = await axios.post(
                `${backendUrl}/api/payment/create-upi-payment`,
                {
                    amount: appointmentData.fees,
                    appointmentId: appointmentData._id,
                    patientName: appointmentData.patientName || 'Patient',
                    doctorName: appointmentData.doctorName || 'Doctor',
                    doctorId: appointmentData.doctorId
                },
                {
                    headers: { token: localStorage.getItem('token') }
                }
            );

            console.log('Payment generation response:', data);

            if (data.success) {
                setPaymentData(data.paymentData);
                toast.success('Payment details generated successfully!');
            } else {
                toast.error(data.message || 'Failed to generate payment');
            }
        } catch (error) {
            console.error('Payment generation error:', error);
            toast.error('Failed to generate payment details');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentVerification = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post(
                `${backendUrl}/api/payment/verify-payment`,
                {
                    appointmentId: appointmentData._id,
                    transactionId: 'manual-verification',
                    amount: appointmentData.fees
                },
                {
                    headers: { token: localStorage.getItem('token') }
                }
            );

            if (data.success) {
                // Don't show success message here - let the parent component handle it
                if (onPaymentComplete) {
                    onPaymentComplete();
                }
                // Don't call onCancel here - let the parent component handle closing the modal
            } else {
                toast.error(data.message || 'Payment verification failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (appointmentData) {
            generatePayment();
        }
    }, [appointmentData]);

    if (!paymentData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Generating payment details...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">UPI Payment</h2>
                    <p className="text-gray-600">Pay ₹{paymentData?.amount || '0'} for your appointment</p>
                </div>

                {/* Payment Details */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-lg">₹{paymentData.amount}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Doctor:</span>
                        <span className="font-medium">{paymentData.doctorName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">UPI ID:</span>
                        <span className="font-mono text-sm bg-white px-2 py-1 rounded">{paymentData.upiId}</span>
                    </div>
                </div>

                {/* QR Code */}
                <div className="text-center mb-6">
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 inline-block">
                        <img 
                            src={paymentData.qrCode} 
                            alt="UPI QR Code" 
                            className="w-48 h-48 mx-auto"
                        />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Scan this QR code with any UPI app
                    </p>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-yellow-800 mb-2">How to pay:</h3>
                    <ol className="text-sm text-yellow-700 space-y-1">
                        <li>1. Scan the QR code with any UPI app</li>
                        <li>2. Verify the amount and payee details</li>
                        <li>3. Complete the payment</li>
                        <li>4. Click "I have paid" below</li>
                    </ol>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handlePaymentVerification}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-medium transition-colors"
                    >
                        {loading ? 'Processing...' : 'I have paid'}
                    </button>
                    
                    <button
                        onClick={onCancel}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-medium transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                {/* Note */}
                <p className="text-xs text-gray-500 text-center mt-4">
                    Click "I have paid" after completing the payment to confirm your appointment.
                </p>
            </div>
        </div>
    );
};

export default UPIPayment; 