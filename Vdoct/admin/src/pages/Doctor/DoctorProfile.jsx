import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const DoctorProfile = () => {

    const { doctorToken, profileData, setProfileData, getProfileData, backendUrl, dashData, getDashData } = useContext(DoctorContext)
    const { currencySymbol } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const updateProfile = async () => {
        try {
            const updateData = {
                address: profileData.address,
                fees: profileData.fees,
                about: profileData.about,
                available: profileData.available,
                licenseNumber: profileData.licenseNumber,
                registrationNumber: profileData.registrationNumber,
                notes: profileData.notes,
                upiId: profileData.upiId
            }

            console.log('Updating doctor profile with data:', updateData);

            const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, { headers: { dToken: doctorToken } })

            console.log('Profile update response:', data);

            if (data.success) {
                toast.success(data.message)
                setIsEdit(false)
                getProfileData()
            } else {
                toast.error(data.message)
            }

            setIsEdit(false)

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    useEffect(() => {
        if (doctorToken) {
            setLoading(true)
            // Data will be loaded by the context
            const timer = setTimeout(() => {
                setLoading(false)
            }, 1000) // Give some time for data to load
            
            return () => clearTimeout(timer)
        } else {
            setLoading(false)
        }
    }, [doctorToken])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading your profile...</p>
                </div>
            </div>
        )
    }

    if (!doctorToken) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
                    <p className="text-gray-600">Please login to view your profile</p>
                </div>
            </div>
        )
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600">Unable to load doctor profile</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                    >
                        Retry
                    </button>
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
                                className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-white"
                                src={profileData.image 
                                    ? (profileData.image.startsWith('http') 
                                        ? profileData.image 
                                        : `http://localhost:4000/uploads/${profileData.image}`)
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=random&size=128`}
                                alt={profileData.name}
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=random&size=128`;
                                }}
                            />
                            <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white shadow-lg ${
                                profileData.available ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                        </div>
                        
                        {/* Profile Info */}
                        <div className="flex-1 text-center lg:text-left">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">{profileData.name}</h1>
                            <p className="text-xl text-blue-600 font-semibold mb-3">{profileData.speciality}</p>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                                    profileData.available 
                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full mr-2 ${profileData.available ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                    {profileData.available ? 'Available' : 'Unavailable'}
                                </span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-600 font-medium">{profileData.experience} years experience</span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-600 font-medium">{profileData.degree}</span>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                                <button
                                    onClick={() => setIsEdit(!isEdit)}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    {isEdit ? 'Cancel Editing' : 'Edit Profile'}
                                </button>
                                <button
                                    onClick={() => navigate('/doctor-appointments')}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    View Appointments
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const newStatus = !profileData.available;
                                            const updateData = {
                                                ...profileData,
                                                available: newStatus
                                            };
                                            const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, { headers: { dToken: doctorToken } });
                                            if (data.success) {
                                                setProfileData(prev => ({ ...prev, available: newStatus }));
                                                toast.success(`Status updated to ${newStatus ? 'Available' : 'Unavailable'}`);
                                            } else {
                                                toast.error(data.message);
                                            }
                                        } catch (error) {
                                            toast.error('Failed to update status');
                                            console.log(error);
                                        }
                                    }}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                                        profileData.available 
                                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                                >
                                    {profileData.available ? 'Set Unavailable' : 'Set Available'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Stats Cards */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-xl">
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Patients</p>
                                        <p className="text-3xl font-bold text-gray-900">{dashData?.patients || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center">
                                    <div className="p-3 bg-green-100 rounded-xl">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 6h8" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Appointments</p>
                                        <p className="text-3xl font-bold text-gray-900">{dashData?.appointments || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center">
                                    <div className="p-3 bg-purple-100 rounded-xl">
                                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Consultation Fee</p>
                                        <p className="text-3xl font-bold text-gray-900">₹{profileData.fees || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center">
                                    <div className="p-3 bg-orange-100 rounded-xl">
                                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Experience</p>
                                        <p className="text-3xl font-bold text-gray-900">{profileData.experience || 0}y</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Personal Information
                                </h3>
                            </div>
                            <div className="p-8">
                                {isEdit ? (
                                    <form onSubmit={(e) => { e.preventDefault(); updateProfile(); }} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    disabled
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">Email</label>
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    disabled
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">Phone</label>
                                                <input
                                                    type="tel"
                                                    value={profileData.phone}
                                                    disabled
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">Specialization</label>
                                                <input
                                                    type="text"
                                                    value={profileData.speciality}
                                                    disabled
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">Experience (years)</label>
                                                <input
                                                    type="number"
                                                    value={profileData.experience}
                                                    disabled
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">Consultation Fee (₹)</label>
                                                <input
                                                    type="number"
                                                    value={profileData.fees}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">License Number</label>
                                                <input
                                                    type="text"
                                                    value={profileData.licenseNumber || ''}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">Registration Number</label>
                                                <input
                                                    type="text"
                                                    value={profileData.registrationNumber || ''}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">UPI ID</label>
                                                <input
                                                    type="text"
                                                    value={profileData.upiId || ''}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, upiId: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    placeholder="doctor@upi"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Leave empty to use default UPI ID</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">Address</label>
                                            <input
                                                type="text"
                                                value={profileData.address?.line1 || ''}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">About</label>
                                            <textarea
                                                value={profileData.about}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                                                rows={4}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">Notes</label>
                                            <textarea
                                                value={profileData.notes || ''}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, notes: e.target.value }))}
                                                rows={3}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                                placeholder="Additional notes or comments..."
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-4 pt-6">
                                            <button
                                                type="button"
                                                onClick={() => setIsEdit(false)}
                                                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-2">Full Name</p>
                                            <p className="text-lg text-gray-900 font-medium">{profileData.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-2">Email</p>
                                            <p className="text-lg text-gray-900 font-medium">{profileData.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-2">Phone</p>
                                            <p className="text-lg text-gray-900 font-medium">{profileData.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-2">Specialization</p>
                                            <p className="text-lg text-gray-900 font-medium">{profileData.speciality}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-2">Experience</p>
                                            <p className="text-lg text-gray-900 font-medium">{
                                                (typeof profileData.experience === 'string' && profileData.experience.toLowerCase().includes('year'))
                                                    ? profileData.experience
                                                    : `${profileData.experience} years`
                                            }</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-2">Consultation Fee</p>
                                            <p className="text-lg text-gray-900 font-medium">₹{profileData.fees}</p>
                                        </div>
                                        {profileData.licenseNumber && (
                                            <div>
                                                <p className="text-sm font-semibold text-gray-500 mb-2">License Number</p>
                                                <p className="text-lg text-gray-900 font-medium">{profileData.licenseNumber}</p>
                                            </div>
                                        )}
                                        {profileData.registrationNumber && (
                                            <div>
                                                <p className="text-sm font-semibold text-gray-500 mb-2">Registration Number</p>
                                                <p className="text-lg text-gray-900 font-medium">{profileData.registrationNumber}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-2">UPI ID</p>
                                            <p className="text-lg text-gray-900 font-medium">
                                                {profileData.upiId ? profileData.upiId : 'uthayakilan@okaxis (Default)'}
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-sm font-semibold text-gray-500 mb-2">Address</p>
                                            <p className="text-lg text-gray-900 font-medium">{profileData.address?.line1}, {profileData.address?.line2}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-sm font-semibold text-gray-500 mb-2">About</p>
                                            <p className="text-lg text-gray-900 leading-relaxed">{profileData.about}</p>
                                        </div>
                                        {profileData.notes && (
                                            <div className="md:col-span-2">
                                                <p className="text-sm font-semibold text-gray-500 mb-2">Notes</p>
                                                <p className="text-lg text-gray-900 leading-relaxed">{profileData.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Quick Stats
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Earnings</span>
                                    <span className="font-bold text-green-600">₹{dashData?.earnings || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Completed Appointments</span>
                                    <span className="font-bold text-blue-600">
                                        {Array.isArray(dashData?.appointments) ? 
                                            dashData.appointments.filter(a => a.isCompleted).length : 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* UPI ID Display */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Payment UPI ID
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="text-center">
                                    <div className="bg-gray-50 rounded-xl p-4 mb-3">
                                        <p className="text-sm text-gray-600 mb-1">Current UPI ID</p>
                                        <p className="text-lg font-mono font-bold text-purple-600 break-all">
                                            {profileData.upiId ? profileData.upiId : 'uthayakilan@okaxis (Default)'}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {profileData.upiId 
                                            ? 'Patients will pay to this UPI ID' 
                                            : 'Using system default UPI ID'
                                        }
                                    </p>
                                    <button
                                        onClick={() => setIsEdit(true)}
                                        className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {profileData.upiId ? 'Change UPI ID' : 'Set UPI ID'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Quick Actions
                                </h3>
                            </div>
                            <div className="p-6">
                                <button
                                    onClick={() => navigate('/doctor-appointments')}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 6h8" />
                                    </svg>
                                    View Appointments
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DoctorProfile