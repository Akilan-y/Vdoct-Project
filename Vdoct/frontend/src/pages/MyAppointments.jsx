import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyAppointments = () => {

    const { backendUrl, token } = useContext(AppContext)
    const navigate = useNavigate()

    const [appointments, setAppointments] = useState([])
    const [payment, setPayment] = useState('')
    const [cancelling, setCancelling] = useState({})
    const [cancelled, setCancelled] = useState({})
    const [confirmCancelId, setConfirmCancelId] = useState(null)

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        if (!slotDate || typeof slotDate !== 'string') return 'Invalid Date';
        const dateArray = slotDate.split('_')
        if (dateArray.length !== 3) return 'Invalid Date';
        return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    }

    // Getting User Appointments Data Using API
    const getUserAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
            setAppointments(data.appointments.reverse())
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Function to cancel appointment Using API
    const cancelAppointment = async (appointmentId) => {
        setCancelling(prev => ({ ...prev, [appointmentId]: true }));
        try {
            const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })
            if (data.success) {
                toast.success(data.message)
                setCancelled(prev => ({ ...prev, [appointmentId]: true }));
                getUserAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setCancelling(prev => ({ ...prev, [appointmentId]: false }));
            setConfirmCancelId(null);
        }
    }

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Appointment Payment',
            description: "Appointment Payment",
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                try {
                    const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { token } });
                    if (data.success) {
                        navigate('/my-appointments')
                        getUserAppointments()
                    }
                } catch (error) {
                    console.log(error)
                    toast.error(error.message)
                }
            }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    // Function to make payment using razorpay
    const appointmentRazorpay = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })
            if (data.success) {
                initPay(data.order)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Function to make payment using stripe
    const appointmentStripe = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/payment-stripe', { appointmentId }, { headers: { token } })
            if (data.success) {
                const { session_url } = data
                window.location.replace(session_url)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Demo: Mark appointment as agreed
    const agreeAppointment = (index) => {
        setAppointments(prev => prev.map((item, i) => i === index ? { ...item, agreed: true } : item));
    }

    useEffect(() => {
        if (token) {
            getUserAppointments()
        }
    }, [token])

    // Helper to get doctor image
    const getDoctorImage = (docData, name) => {
        if (docData && docData.image) {
            if (docData.image.startsWith('http')) return docData.image;
            return docData.image;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Doctor')}&background=random&size=256`;
    };

    // Helper to get status badge
    const getStatusBadge = (item) => {
        if (item.cancelled) return <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">Cancelled</span>;
        if (item.isCompleted) return <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-semibold">Completed</span>;
        if (item.payment) return <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">Paid</span>;
        return <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">Pending</span>;
    };

    return (
        <div className="max-w-3xl mx-auto px-2 sm:px-0">
            <h2 className="pb-3 mt-12 text-2xl font-bold text-primary border-b mb-8">My Appointments</h2>
            {appointments.length === 0 && (
                <div className="text-center text-gray-500 py-10">No appointments found.</div>
            )}
            <div className="flex flex-col gap-8">
                {appointments.map((item, index) => (
                    item.docData ? (
                        <div key={item._id || index} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row gap-6 items-center border border-primary/10 relative">
                            {/* Status badge */}
                            <div className="absolute top-4 right-4">{getStatusBadge(item)}</div>
                            {/* Doctor image */}
                            <div className="flex-shrink-0">
                                <img className="w-28 h-28 rounded-full object-cover border-4 border-primary/10 bg-gray-100" src={getDoctorImage(item.docData, item.docData.name)} alt={item.docData.name} onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.docData.name)}&background=random&size=256`; }} />
                            </div>
                            {/* Appointment details */}
                            <div className="flex-1 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                    <span className="text-lg font-bold text-primary">{item.docData.name}</span>
                                    <span className="text-accent text-sm font-semibold">{item.docData.speciality}</span>
                                </div>
                                <div className="text-gray-500 text-sm mb-1 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12.414a4 4 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414-1.414z" /></svg>
                                    <span>{item.docData.address?.line1 || ''} {item.docData.address?.line2 || ''}</span>
                                </div>
                                <div className="text-gray-500 text-sm mb-1 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span>{slotDateFormat(item.slotDate)} | {item.slotTime}</span>
                                </div>
                                {(!item.cancelled && item.agreed && item.docData.phone) && (
                                    <div className="mt-2 text-blue-700 font-semibold flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.28a2 2 0 011.789 1.106l1.387 2.773a2 2 0 01-.327 2.32l-.7.7a16.001 16.001 0 006.586 6.586l.7-.7a2 2 0 012.32-.327l2.773 1.387A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C9.163 23 1 14.837 1 5V4a2 2 0 012-2z" /></svg>
                                        <a href={`tel:${item.docData.phone}`} className="underline">{item.docData.phone}</a>
                                    </div>
                                )}
                                {(!item.cancelled && !item.agreed) && (
                                    <button onClick={() => agreeAppointment(index)} className="mt-2 px-4 py-1 bg-green-500 text-white rounded text-xs">Agree (Demo)</button>
                                )}
                            </div>
                            {/* Actions */}
                            <div className="flex flex-col gap-2 min-w-[140px] w-full sm:w-auto">
                                {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && <button onClick={() => setPayment(item._id)} className="text-[#696969] py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300">Pay Online</button>}
                                {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && <button onClick={() => appointmentStripe(item._id)} className="text-[#696969] py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center"><img className="max-w-20 max-h-5" src={assets.stripe_logo} alt="" /></button>}
                                {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && <button onClick={() => appointmentRazorpay(item._id)} className="text-[#696969] py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center"><img className="max-w-20 max-h-5" src={assets.razorpay_logo} alt="" /></button>}
                                {!item.cancelled && item.payment && !item.isCompleted && <button className="py-2 border rounded text-[#696969] bg-[#EAEFFF]">Paid</button>}
                                {item.isCompleted && <button className="py-2 border border-green-500 rounded text-green-500">Completed</button>}
                                {!item.cancelled && !item.isCompleted && (
                                    cancelling[item._id] ? (
                                        <div className="py-2 border rounded flex items-center justify-center text-[#696969] bg-gray-50">
                                            <span className="dot-anim inline-block w-2 h-2 rounded-full bg-primary mx-0.5 animate-dot"></span>
                                            <span className="dot-anim inline-block w-2 h-2 rounded-full bg-primary mx-0.5 animate-dot delay-150"></span>
                                            <span className="dot-anim inline-block w-2 h-2 rounded-full bg-primary mx-0.5 animate-dot delay-300"></span>
                                        </div>
                                    ) : cancelled[item._id] ? (
                                        <button className="py-2 border border-red-500 rounded text-red-500">Appointment cancelled</button>
                                    ) : (
                                        <>
                                            <button onClick={() => setConfirmCancelId(item._id)} className="text-[#696969] py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300">Cancel appointment</button>
                                            {confirmCancelId === item._id && (
                                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center animate-fade-in-up">
                                                        <h2 className="text-xl font-bold text-primary mb-4">Cancel Appointment</h2>
                                                        <p className="mb-6 text-text">Are you sure you want to cancel this appointment?</p>
                                                        <div className="flex gap-4 justify-center">
                                                            <button
                                                                onClick={() => cancelAppointment(item._id)}
                                                                disabled={cancelling[item._id]}
                                                                className="px-6 py-2 bg-red-500 text-white rounded-full font-semibold shadow hover:bg-red-600 transition disabled:opacity-60"
                                                            >
                                                                {cancelling[item._id] ? 'Cancelling...' : 'Yes, Cancel'}
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmCancelId(null)}
                                                                className="px-6 py-2 bg-gray-200 text-primary rounded-full font-semibold shadow hover:bg-gray-300 transition"
                                                            >
                                                                No, Go Back
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )
                                )}
                            </div>
                        </div>
                    ) : null
                ))}
            </div>
        </div>
    )
}

export default MyAppointments