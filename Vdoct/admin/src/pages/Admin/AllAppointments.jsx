import React, { useEffect } from 'react'
import { assets } from '../../assets/assets'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import GoogleMeetButton from '../../components/GoogleMeetButton'

const AllAppointments = () => {

  const { adminToken, appointments, cancelAppointment, getAppointmentsData } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)

  useEffect(() => {
    if (adminToken) {
      getAppointmentsData()
    }
  }, [adminToken, getAppointmentsData])

  const getStatusBadge = (item) => {
    if (item.cancelled) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>;
    }
    if (item.isCompleted) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
    }
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-2xl shadow-lg p-6'>
        <div className='flex items-center gap-4'>
          <div className='p-3 bg-blue-100 rounded-xl'>
            <span className='text-2xl text-blue-600'>📅</span>
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>All Appointments</h1>
            <p className='text-gray-600'>Manage and monitor all patient appointments</p>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
        {/* Table Header */}
        <div className='bg-gray-50 px-6 py-4 border-b border-gray-200'>
          <div className='grid grid-cols-12 gap-4 text-sm font-medium text-gray-700'>
            <div className='col-span-1'>#</div>
            <div className='col-span-3'>Patient</div>
            <div className='col-span-1'>Age</div>
            <div className='col-span-2'>Date & Time</div>
            <div className='col-span-3'>Doctor</div>
            <div className='col-span-1'>Fees</div>
            <div className='col-span-1'>Meet</div>
            <div className='col-span-1'>Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className='divide-y divide-gray-200'>
          {appointments.length > 0 ? (
            appointments.map((item, index) => (
              <div className='px-6 py-4 hover:bg-gray-50 transition-colors duration-200' key={index}>
                <div className='grid grid-cols-12 gap-4 items-center'>
                  {/* Serial Number */}
                  <div className='col-span-1'>
                    <span className='text-sm font-medium text-gray-900'>{index + 1}</span>
                  </div>

                  {/* Patient Info */}
                  <div className='col-span-3'>
                    <div className='flex items-center gap-3'>
              <img
                src={
                  item.userData.image
                    ? item.userData.image.startsWith('http')
                      ? item.userData.image
                      : item.userData.image.startsWith('data:image')
                        ? item.userData.image
                        : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/uploads/${item.userData.image}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userData.name)}&background=random&size=64`
                }
                        className='w-10 h-10 rounded-full object-cover border-2 border-gray-200'
                alt={item.userData.name}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userData.name)}&background=random&size=64`;
                        }}
                      />
                      <div>
                        <p className='text-sm font-semibold text-gray-900'>{item.userData.name}</p>
                        <p className='text-xs text-gray-500'>{item.userData.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Age */}
                  <div className='col-span-1'>
                    <span className='text-sm text-gray-700'>{calculateAge(item.userData.dob)}</span>
                  </div>

                  {/* Date & Time */}
                  <div className='col-span-2'>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>{slotDateFormat(item.slotDate)}</p>
                      <p className='text-xs text-gray-500'>{item.slotTime}</p>
                    </div>
            </div>

                  {/* Doctor Info */}
                  <div className='col-span-3'>
                    <div className='flex items-center gap-3'>
              <img
                src={
                  item.docData.image
                    ? item.docData.image.startsWith('http')
                      ? item.docData.image
                      : item.docData.image.startsWith('data:image')
                        ? item.docData.image
                        : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/uploads/${item.docData.image}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.docData.name)}&background=random&size=64`
                }
                        className='w-10 h-10 rounded-full object-cover border-2 border-gray-200'
                alt={item.docData.name}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.docData.name)}&background=random&size=64`;
                        }}
                      />
                      <div>
                        <p className='text-sm font-semibold text-gray-900'>{item.docData.name}</p>
                        <p className='text-xs text-blue-600'>{item.docData.speciality}</p>
                      </div>
                    </div>
                  </div>

                  {/* Fees */}
                  <div className='col-span-1'>
                    <span className='text-sm font-semibold text-gray-900'>{currency}{item.amount}</span>
                  </div>

                  {/* Meet */}
                  <div className='col-span-1'>
                    <GoogleMeetButton 
                      appointmentId={item._id} 
                      appointment={item}
                      onAppointmentUpdate={getAppointmentsData}
                    />
                  </div>

                  {/* Status & Actions */}
                  <div className='col-span-1'>
                    <div className='flex flex-col gap-2'>
                      {getStatusBadge(item)}
                      
                      {/* Cancel Button */}
                      {!item.cancelled && !item.isCompleted && (
                        <button
                          onClick={() => cancelAppointment(item._id)}
                          className='p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200'
                          title="Cancel Appointment"
                        >
                          <img className='w-5 h-5' src={assets.cancel_icon} alt="Cancel" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='px-6 py-12 text-center'>
              <div className='text-gray-400 text-6xl mb-4'>📅</div>
              <h3 className='text-lg font-semibold text-gray-600 mb-2'>No Appointments Found</h3>
              <p className='text-gray-500'>No appointments have been scheduled yet.</p>
            </div>
          )}
          </div>
      </div>
    </div>
  )
}

export default AllAppointments