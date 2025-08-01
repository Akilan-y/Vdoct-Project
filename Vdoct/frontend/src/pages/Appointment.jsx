import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import UPIPayment from '../components/UPIPayment'
import axios from 'axios'
import { toast } from 'react-toastify'

const Appointment = () => {

    const { docId } = useParams()
    const { doctors, currencySymbol, backendUrl, token, getDoctosData } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const [docInfo, setDocInfo] = useState(false)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')
    const [bookingError, setBookingError] = useState('')
    const [showConfirm, setShowConfirm] = useState(false)
    const [pendingBooking, setPendingBooking] = useState(false)
    const [showPayment, setShowPayment] = useState(false)
    const [bookedAppointment, setBookedAppointment] = useState(null)

    const navigate = useNavigate()

    const fetchDocInfo = async () => {
        const docInfo = doctors.find((doc) => doc._id === docId)
        setDocInfo(docInfo)
    }

    const getAvailableSolts = async () => {

        setDocSlots([])

        // getting current date
        let today = new Date()

        for (let i = 0; i < 7; i++) {

            // getting date with index 
            let currentDate = new Date(today)
            currentDate.setDate(today.getDate() + i)

            // setting end time of the date with index
            let endTime = new Date()
            endTime.setDate(today.getDate() + i)
            endTime.setHours(21, 0, 0, 0)

            // setting hours 
            if (today.getDate() === currentDate.getDate()) {
                currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
                currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
            } else {
                currentDate.setHours(10)
                currentDate.setMinutes(0)
            }

            let timeSlots = [];


            while (currentDate < endTime) {
                let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                let day = currentDate.getDate()
                let month = currentDate.getMonth() + 1
                let year = currentDate.getFullYear()

                const slotDate = day + "_" + month + "_" + year
                const slotTime = formattedTime

                const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true

                if (isSlotAvailable) {

                    // Add slot to array
                    timeSlots.push({
                        datetime: new Date(currentDate),
                        time: formattedTime
                    })
                }

                // Increment current time by 30 minutes
                currentDate.setMinutes(currentDate.getMinutes() + 30);
            }

            setDocSlots(prev => ([...prev, timeSlots]))

        }

    }

    const handleBookClick = () => {
        if (!token) {
            toast.warning('Login to book appointment')
            return navigate('/login')
        }
        if (!slotTime) {
            setBookingError('Please select a date and time slot before booking.')
            return
        }
        setBookingError('')
        setShowConfirm(true)
    }

    const bookAppointment = async () => {
        setPendingBooking(true)
        const date = docSlots[slotIndex][0].datetime
        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()
        const slotDate = day + "_" + month + "_" + year
        try {
            const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime }, { headers: { token } })
            if (data.success) {
                toast.success(data.message)
                getDoctosData()
                
                // Set booked appointment data for payment
                setBookedAppointment({
                    _id: data.appointmentId || 'temp-id',
                    fees: docInfo.fees,
                    patientName: data.patientName || 'Patient',
                    doctorName: docInfo.name,
                    doctorId: docInfo._id,
                    slotDate,
                    slotTime
                })
                
                // Show payment instead of navigating
                setShowPayment(true)
                setShowConfirm(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setPendingBooking(false)
        }
    }

    const handlePaymentComplete = () => {
        toast.success('Payment completed! Your appointment is confirmed.')
        setShowPayment(false)
        setBookedAppointment(null)
        navigate('/my-appointments')
    }

    const handlePaymentCancel = () => {
        setShowPayment(false)
        setBookedAppointment(null)
        toast.info('Payment cancelled. You can try again later.')
    }

    // Clear error when slot is selected
    useEffect(() => {
        if (slotTime) setBookingError('')
    }, [slotTime])

    useEffect(() => {
        if (doctors.length > 0) {
            fetchDocInfo()
        }
    }, [doctors, docId])

    useEffect(() => {
        if (docInfo) {
            getAvailableSolts()
        }
    }, [docInfo])

    return docInfo ? (
        <div>

            {/* ---------- Doctor Details ----------- */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div>
                    <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
                </div>

                <div className='flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>

                    {/* ----- Doc Info : name, degree, experience ----- */}

                    <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" /></p>
                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{docInfo.degree} - {docInfo.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
                    </div>

                    {/* ----- Doc About ----- */}
                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About <img className='w-3' src={assets.info_icon} alt="" /></p>
                        <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{docInfo.about}</p>
                    </div>

                    <p className='text-gray-600 font-medium mt-4'>Appointment fee: <span className='text-gray-800'>{currencySymbol}{docInfo.fees}</span> </p>
                </div>
            </div>

            {/* Booking slots */}
            <div className='mt-8 flex justify-center'>
              <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl w-full">
                <p className="text-xl font-bold text-primary mb-4">Booking Slots</p>
                {bookingError && (
                  <div className="mb-4 p-3 bg-error/10 border border-error/30 text-error rounded text-center font-semibold animate-pulse">
                    {bookingError}
                  </div>
                )}
                {/* Date selector */}
                <div className='flex gap-3 items-center w-full overflow-x-auto mb-6 pb-2'>
                  {docSlots.length && docSlots.map((item, index) => (
                    <button
                      onClick={() => setSlotIndex(index)}
                      key={index}
                      className={`text-center px-5 py-3 min-w-20 rounded-full font-semibold transition-all duration-150 border-2 ${slotIndex === index ? 'bg-primary text-white border-primary shadow' : 'bg-surface text-primary border-primary/20 hover:bg-primary/10'}`}
                    >
                      <div className="text-xs font-bold uppercase">{item[0] && daysOfWeek[item[0].datetime.getDay()]}</div>
                      <div className="text-lg font-bold">{item[0] && item[0].datetime.getDate()}</div>
                    </button>
                  ))}
                </div>
                {/* Booked slots and next available slot */}
                {(() => {
                  if (!docInfo || !docInfo.slots_booked || !docSlots[slotIndex] || !docSlots[slotIndex][0]) return null;
                  const selectedDate = docSlots[slotIndex][0].datetime;
                  const day = selectedDate.getDate();
                  const month = selectedDate.getMonth() + 1;
                  const year = selectedDate.getFullYear();
                  const slotDateStr = day + "_" + month + "_" + year;
                  const booked = docInfo.slots_booked[slotDateStr] || [];
                  return (
                    <div className="mb-4 flex flex-col gap-2">
                      <div>
                        <span className='text-xs text-error font-semibold'>Booked slots:</span>
                        {booked.length === 0 ? (
                          <span className='ml-2 text-xs text-success'>No slots booked for this day.</span>
                        ) : (
                          <div className='flex flex-wrap gap-2 mt-1'>
                            {booked.map((slot, idx) => (
                              <span key={idx} className='px-3 py-1 bg-error/10 text-error rounded-full text-xs'>{slot}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {docSlots[slotIndex].length > 0 && (
                        <div>
                          <span className='text-xs text-success font-semibold'>Next available slot:</span>
                          <span className='ml-2 px-3 py-1 bg-success/10 text-success rounded-full text-xs'>{docSlots[slotIndex][0].time}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
                {/* Available slots grid */}
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2 mb-6'>
                  {docSlots.length && docSlots[slotIndex].map((item, index) => (
                    <button
                      onClick={() => setSlotTime(item.time)}
                      key={index}
                      className={`text-sm font-medium px-4 py-2 rounded-lg border transition-all duration-150 ${item.time === slotTime ? 'bg-primary text-white border-primary shadow' : 'bg-surface text-primary border-primary/20 hover:bg-primary/10'}`}
                    >
                      {item.time.toLowerCase()}
                    </button>
                  ))}
                </div>
                <button onClick={handleBookClick} className='w-full bg-accent text-white text-base font-semibold px-8 py-3 rounded-full shadow hover:bg-primary transition'>Book an appointment</button>
                {/* Confirmation Modal */}
                {showConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center animate-fade-in-up">
                      <h2 className="text-xl font-bold text-primary mb-4">Confirm Booking</h2>
                      <p className="mb-6 text-text">Are you sure you want to book this appointment for <span className="font-semibold text-accent">{slotTime}</span> on <span className="font-semibold text-accent">{docSlots[slotIndex][0]?.datetime.toLocaleDateString()}</span>?</p>
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={bookAppointment}
                          disabled={pendingBooking}
                          className="px-6 py-2 bg-primary text-white rounded-full font-semibold shadow hover:bg-accent transition disabled:opacity-60"
                        >
                          {pendingBooking ? 'Booking...' : 'Yes, Book'}
                        </button>
                        <button
                          onClick={() => setShowConfirm(false)}
                          className="px-6 py-2 bg-gray-200 text-primary rounded-full font-semibold shadow hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Listing Releated Doctors */}
            <RelatedDoctors speciality={docInfo.speciality} docId={docId} />

            {/* Payment Modal */}
            {showPayment && bookedAppointment && (
                <UPIPayment
                    appointmentData={bookedAppointment}
                    onPaymentComplete={handlePaymentComplete}
                    onCancel={handlePaymentCancel}
                />
            )}
        </div>
    ) : null
}

export default Appointment