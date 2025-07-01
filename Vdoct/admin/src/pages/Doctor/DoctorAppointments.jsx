import React from 'react'
import { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {

  const { doctorToken, appointments, getAppointmentsData, cancelAppointment, completeAppointment, backendUrl } = useContext(DoctorContext)
  const { currencySymbol } = useContext(AppContext)

  useEffect(() => {
    if (doctorToken) {
      getAppointmentsData()
    }
  }, [doctorToken, getAppointmentsData])

  // Function to get proper image URL for patient
  const getPatientImageUrl = (userData) => {
    if (userData?.image) {
      // If it's a full URL, use it as is
      if (userData.image.startsWith('http')) {
        return userData.image;
      }
      // If it's a base64 data URL, use it as is
      if (userData.image.startsWith('data:image')) {
        return userData.image;
      }
      // If it's a filename, construct the full URL
      return `${backendUrl}/uploads/${userData.image}`;
    }
    // Fallback to avatar service
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'User')}&background=random&size=64`;
  };

  return (
    <div className='w-full max-w-6xl m-5 '>

      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {appointments && appointments.length > 0 ? (
          appointments.map((item, index) => (
            <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
              <p className='max-sm:hidden'>{index + 1}</p>
              <div className='flex items-center gap-2'>
                <img 
                  src={getPatientImageUrl(item.userData)} 
                  className='w-8 h-8 rounded-full object-cover bg-gray-100' 
                  alt={item.userData?.name || 'Patient'} 
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userData?.name || 'User')}&background=random&size=64`;
                  }}
                /> 
                <p>{item.userData?.name || 'Unknown User'}</p>
              </div>
              <div>
                <p className='text-xs inline border border-primary px-2 rounded-full'>
                  {item.payment ? 'Online' : 'CASH'}
                </p>
              </div>
              <p className='max-sm:hidden'>
                {item.userData?.dob ? new Date().getFullYear() - new Date(item.userData.dob).getFullYear() : 'N/A'}
              </p>
              <p>
                {new Date(item.slotDate).toLocaleDateString()}, {item.slotTime}
              </p>
              <p>{currencySymbol}{item.amount}</p>
              {item.cancelled
                ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                : item.isCompleted
                  ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                  : <div className='flex'>
                      <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                      <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                    </div>
              }
            </div>
          ))
        ) : (
          <div className='px-6 py-4 text-gray-500 text-center'>No appointments found</div>
        )}
      </div>

    </div>
  )
}

export default DoctorAppointments