import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import PatientsCard from './PatientsCard'

const Dashboard = () => {

  const { adminToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (adminToken) {
      setIsLoading(true)
      setError(null)
      getDashData()
        .then((data) => {
          console.log('Dashboard data received:', data);
          if (data && data.dashData) {
            console.log('Latest appointments:', data.dashData.latestAppointments);
          }
        })
        .catch((error) => {
          console.error('Error loading dashboard:', error);
          setError(error.message || 'Failed to load dashboard data');
        })
        .finally(() => setIsLoading(false))
    }
  }, [adminToken, getDashData])

  // Helper function to safely get doctor data
  const getDoctorData = (item) => {
    if (item.docData && item.docData.name) {
      return item.docData;
    }
    // Fallback if docData is missing
    return {
      name: 'Unknown Doctor',
      image: 'default-doctor.png',
      speciality: 'Unknown'
    };
  };

  // Helper function to safely handle appointment cancellation
  const handleCancelAppointment = (appointmentId) => {
    if (appointmentId) {
      // Ensure appointmentId is a string
      const id = appointmentId.toString ? appointmentId.toString() : String(appointmentId);
      console.log('Cancelling appointment with ID:', id);
      cancelAppointment(id);
    } else {
      console.error('No appointment ID provided for cancellation');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!dashData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Dashboard Data</h2>
          <p className="text-gray-600">Unable to load dashboard information</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Admin Icon */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                👨‍⚕️
              </div>
            </div>
            
            {/* Welcome Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-lg text-purple-600 font-semibold mb-3">Healthcare Management System</p>
              <p className="text-gray-600">Monitor and manage your healthcare platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate('/doctor-list')}
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <span className="text-2xl text-blue-600">👨‍⚕️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                <p className="text-3xl font-bold text-gray-900">{dashData.doctors || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate('/all-appointments')}
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <span className="text-2xl text-green-600">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Appointments</p>
                <p className="text-3xl font-bold text-gray-900">{dashData.appointments || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate('/patients-list')}
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <span className="text-2xl text-purple-600">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{dashData.patients || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Bookings */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-2xl mr-3 text-purple-600">📋</span>
                Latest Bookings
              </h3>
              <button
                onClick={() => navigate('/all-appointments')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
              >
                View All
              </button>
            </div>
          </div>

          <div className="p-6">
            {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
              <div className="space-y-4">
                {dashData.latestAppointments.slice(0, 5).map((item, index) => {
                  // Additional safety check for item
                  if (!item) {
                    console.warn('Found null/undefined appointment item at index:', index);
                    return null;
                  }
                  const doctorData = getDoctorData(item);
                  // Get status badge
                  const getStatusBadge = (item) => {
                    if (item.cancelled) {
                      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>;
                    }
                    if (item.isCompleted) {
                      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
                    }
                    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
                  };
                  return (
                    <div className='flex items-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all duration-200' key={item._id || item.id || `appointment-${index}`}>
                      <img 
                        className='rounded-full w-12 h-12 object-cover border-2 border-gray-200' 
                        src={doctorData.image ? `http://localhost:4000/uploads/${doctorData.image}` : 'https://ui-avatars.com/api/?name=Doctor&background=random&size=256'} 
                        alt={doctorData.name}
                        onError={(e) => {
                          e.target.src = 'https://ui-avatars.com/api/?name=Doctor&background=random&size=256';
                        }}
                      />
                      <div className='flex-1 ml-4'>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className='text-gray-900 font-semibold'>{doctorData.name}</p>
                            <p className='text-gray-600 text-sm'>Booking on {item.slotDate ? slotDateFormat(item.slotDate) : 'Unknown Date'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(item)}
                            {!item.cancelled && !item.isCompleted && (
                              <button
                                onClick={() => handleCancelAppointment(item._id || item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Cancel Appointment"
                              >
                                <span className="text-lg">❌</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            ) : (
              <div className='text-center py-12'>
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Appointments Yet</h3>
                <p className="text-gray-500">No appointments have been scheduled yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard