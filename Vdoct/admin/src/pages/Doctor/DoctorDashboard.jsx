import React from 'react'
import { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'

const DoctorDashboard = () => {

  const { doctorToken, dashData, getDashData, cancelAppointment, completeAppointment, profileData, getProfileData } = useContext(DoctorContext)
  const { currencySymbol } = useContext(AppContext)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate();

  useEffect(() => {
    if (!doctorToken) {
      navigate('/');
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([getDashData(), getProfileData()]);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [doctorToken, getDashData, getProfileData, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Dashboard Data</h2>
          <p className="text-gray-600">Unable to load dashboard information</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Profile Image */}
            <div className="relative">
              <img
                className="w-24 h-24 rounded-full object-cover shadow-xl border-4 border-white"
                src={profileData?.image 
                  ? (profileData.image.startsWith('http') 
                      ? profileData.image 
                      : `http://localhost:4000/uploads/${profileData.image}`)
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.name || 'Doctor')}&background=random&size=128`}
                alt={profileData?.name}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.name || 'Doctor')}&background=random&size=128`;
                }}
              />
              <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-3 border-white shadow-lg ${
                profileData?.available ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>
            
            {/* Welcome Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profileData?.name || 'Doctor'}!</h1>
              <p className="text-lg text-blue-600 font-semibold mb-3">{profileData?.speciality}</p>
              <p className="text-gray-600">Here's what's happening with your practice today</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">{currencySymbol} {dashData.earnings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate('/doctor-appointments')}
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 6h8" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Appointments</p>
                <p className="text-3xl font-bold text-gray-900">{dashData.appointments || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
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
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Latest Bookings
              </h3>
              <button
                onClick={() => navigate('/doctor-appointments')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
              >
                View All
              </button>
            </div>
          </div>

          <div className="p-6">
            {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
              <div className="space-y-4">
                {dashData.latestAppointments.slice(0, 5).map((item, index) => {
                  // Fix date formatting - slotDate is in "DD_MM_YYYY" format
                  const formatSlotDate = (slotDate) => {
                    if (!slotDate || typeof slotDate !== 'string') return 'Invalid Date';
                    const parts = slotDate.split('_');
                    if (parts.length !== 3) return 'Invalid Date';
                    const [day, month, year] = parts;
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return `${day} ${months[parseInt(month) - 1]} ${year}`;
                  };

                  // Get user name safely
                  const getUserName = (item) => {
                    if (item.userId && item.userId.name) return item.userId.name;
                    if (item.userData && item.userData.name) return item.userData.name;
                    return 'Unknown User';
                  };

                  // Get user image safely
                  const getUserImage = (item) => {
                    if (item.userId && item.userId.image) {
                      if (item.userId.image.startsWith('http')) return item.userId.image;
                      return `http://localhost:4000/uploads/${item.userId.image}`;
                    }
                    if (item.userData && item.userData.image) {
                      if (item.userData.image.startsWith('http')) return item.userData.image;
                      return `http://localhost:4000/uploads/${item.userData.image}`;
                    }
                    return 'https://ui-avatars.com/api/?name=User&background=random&size=40';
                  };

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
                    <div className='flex items-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all duration-200' key={item._id || index}>
                      <img 
                        className='rounded-full w-12 h-12 object-cover border-2 border-gray-200' 
                        src={getUserImage(item)}
                        alt="" 
                      />
                      <div className='flex-1 ml-4'>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className='text-gray-900 font-semibold'>{getUserName(item)}</p>
                            <p className='text-gray-600 text-sm'>Booking on {formatSlotDate(item.slotDate)} at {item.slotTime}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(item)}
                            {!item.cancelled && !item.isCompleted && (
                              <div className='flex gap-2'>
                                <button
                                  onClick={() => cancelAppointment(item._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                  title="Cancel Appointment"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => completeAppointment(item._id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                  title="Mark Complete"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='text-center py-12'>
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Appointments Yet</h3>
                <p className="text-gray-500">You don't have any appointments scheduled at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard