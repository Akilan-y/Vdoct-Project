import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import PatientsCard from './PatientsCard'
import WebSocketTest from '../../components/WebSocketTest'

const Dashboard = () => {

  const { adminToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext)
  const { slotDateFormat, backendUrl } = useContext(AppContext)
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Dashboard Data</h2>
          <p className="text-gray-600">Unable to load dashboard information</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                👨‍⚕️
              </div>
          <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-lg text-blue-600 font-medium">Healthcare Management System</p>
              <p className="text-gray-600">Monitor and manage your healthcare platform</p>
          </div>
        </div>
      </div>

        {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
            onClick={() => navigate('/doctor-list')}
          >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Doctors</p>
                <p className="text-3xl font-bold text-gray-900">{dashData.doctors || 0}</p>
              </div>
            <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
              <span className="text-2xl text-blue-600">👨‍⚕️</span>
            </div>
            </div>
          </div>

        <div 
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
            onClick={() => navigate('/all-appointments')}
          >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Appointments</p>
                <p className="text-3xl font-bold text-gray-900">{dashData.appointments || 0}</p>
              </div>
            <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
              <span className="text-2xl text-green-600">📅</span>
            </div>
            </div>
          </div>

        <div 
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
            onClick={() => navigate('/patients-list')}
          >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{dashData.patients || 0}</p>
              </div>
            <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
              <span className="text-2xl text-purple-600">👥</span>
            </div>
            </div>
          </div>
        </div>

        {/* Latest Bookings */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-xl text-blue-600">📋</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Latest Bookings</h3>
            </div>
              <button
                onClick={() => navigate('/all-appointments')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 text-sm shadow-md hover:shadow-lg"
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
                    return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>;
                    }
                    if (item.isCompleted) {
                    return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
                    }
                  return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
                  };
                  return (
                    <div className='flex items-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all duration-200' key={item._id || item.id || `appointment-${index}`}>
                      <img 
                        className='rounded-full w-12 h-12 object-cover border-2 border-gray-200' 
                      src={doctorData.image 
                        ? (doctorData.image.startsWith('http') 
                            ? doctorData.image 
                            : `${backendUrl}/uploads/${doctorData.image}`)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorData.name)}&background=random&size=256`
                      } 
                        alt={doctorData.name}
                        onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorData.name)}&background=random&size=256`;
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

      {/* WebSocket Test Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-xl text-green-600">🔌</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">WebSocket Connection Test</h3>
          </div>
        </div>
        <div className="p-6">
          <WebSocketTest />
        </div>
      </div>
    </div>
  )
}

export default Dashboard