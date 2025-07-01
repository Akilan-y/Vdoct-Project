import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const DoctorVerification = () => {
    const [pendingDoctors, setPendingDoctors] = useState([])
    const [selectedDoctor, setSelectedDoctor] = useState(null)
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const [verificationData, setVerificationData] = useState({
        status: 'approved',
        notes: '',
        licenseNumber: '',
        registrationNumber: ''
    })
    const [loading, setLoading] = useState(true)

    const { backendUrl } = useContext(AppContext)
    const { adminToken, refreshAllData } = useContext(AdminContext)

    const getPendingDoctors = async () => {
        try {
            console.log('Fetching pending doctors from API...');
            console.log('Backend URL:', backendUrl);
            console.log('Admin token exists:', !!adminToken);
            
            const { data } = await axios.get(backendUrl + '/api/admin/pending-doctors', {
                headers: { atoken: adminToken }
            })
            
            console.log('API response:', data);
            
            if (data.success) {
                console.log(`Received ${data.doctors.length} pending doctors`);
                setPendingDoctors(data.doctors)
            } else {
                console.log('API returned error:', data.message);
                toast.error(data.message)
            }
        } catch (error) {
            console.log('Error fetching pending doctors:', error);
            console.log('Error response:', error.response?.data);
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleVerification = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/verify-doctor', {
                doctorId: selectedDoctor._id,
                ...verificationData
            }, {
                headers: { atoken: adminToken }
            })

            if (data.success) {
                toast.success(data.message)
                setShowVerificationModal(false)
                setSelectedDoctor(null)
                setVerificationData({
                    status: 'approved',
                    notes: '',
                    licenseNumber: '',
                    registrationNumber: ''
                })
                await getPendingDoctors()
                await refreshAllData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    const openVerificationModal = (doctor) => {
        setSelectedDoctor(doctor)
        setVerificationData({
            status: 'approved',
            notes: '',
            licenseNumber: doctor.licenseNumber || '',
            registrationNumber: doctor.registrationNumber || ''
        })
        setShowVerificationModal(true)
    }

    useEffect(() => {
        if (adminToken) {
            getPendingDoctors()
        }
    }, [adminToken])

    if (loading) {
        return <div className='m-5'>Loading pending verifications...</div>
    }

    return (
        <div className='m-5'>
            <div className='flex items-center gap-2 mb-5'>
                <img src={assets.verified_icon} alt="" className='w-8 h-8' />
                <h1 className='text-2xl font-semibold'>Doctor Verification</h1>
            </div>

            {pendingDoctors.length === 0 ? (
                <div className='text-center py-10'>
                    <p className='text-gray-500 text-lg'>No doctors pending verification</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {pendingDoctors.map((doctor) => (
                        <div key={doctor._id} className='border rounded-lg p-4 bg-white shadow-sm'>
                            <div className='flex items-center gap-3 mb-3'>
                                <img 
                                    src={doctor.image ? `${backendUrl}/uploads/${doctor.image}` : assets.doctor_icon} 
                                    alt={doctor.name} 
                                    className='w-16 h-16 rounded-full object-cover'
                                />
                                <div>
                                    <h3 className='font-semibold text-lg'>{doctor.name}</h3>
                                    <p className='text-gray-600'>{doctor.speciality}</p>
                                    <p className='text-sm text-gray-500'>{doctor.degree}</p>
                                </div>
                            </div>
                            
                            <div className='space-y-2 mb-4'>
                                <p><span className='font-medium'>Experience:</span> {doctor.experience}</p>
                                <p><span className='font-medium'>Fees:</span> ${doctor.fees}</p>
                                <p><span className='font-medium'>Email:</span> {doctor.email}</p>
                                <p><span className='font-medium'>About:</span> {doctor.about.substring(0, 100)}...</p>
                            </div>

                            <div className='flex gap-2'>
                                <button
                                    onClick={() => openVerificationModal(doctor)}
                                    className='flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors'
                                >
                                    Review & Verify
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Verification Modal */}
            {showVerificationModal && selectedDoctor && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                    <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
                        <h2 className='text-xl font-semibold mb-4'>Verify Doctor</h2>
                        
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium mb-1'>Verification Status</label>
                                <select
                                    value={verificationData.status}
                                    onChange={(e) => setVerificationData({...verificationData, status: e.target.value})}
                                    className='w-full border rounded px-3 py-2'
                                >
                                    <option value="approved">Approve</option>
                                    <option value="rejected">Reject</option>
                                </select>
                            </div>

                            <div>
                                <label className='block text-sm font-medium mb-1'>License Number</label>
                                <input
                                    type="text"
                                    value={verificationData.licenseNumber}
                                    onChange={(e) => setVerificationData({...verificationData, licenseNumber: e.target.value})}
                                    className='w-full border rounded px-3 py-2'
                                    placeholder="Enter license number"
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium mb-1'>Registration Number</label>
                                <input
                                    type="text"
                                    value={verificationData.registrationNumber}
                                    onChange={(e) => setVerificationData({...verificationData, registrationNumber: e.target.value})}
                                    className='w-full border rounded px-3 py-2'
                                    placeholder="Enter registration number"
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium mb-1'>Notes</label>
                                <textarea
                                    value={verificationData.notes}
                                    onChange={(e) => setVerificationData({...verificationData, notes: e.target.value})}
                                    className='w-full border rounded px-3 py-2 h-20'
                                    placeholder="Add verification notes..."
                                />
                            </div>
                        </div>

                        <div className='flex gap-3 mt-6'>
                            <button
                                onClick={() => setShowVerificationModal(false)}
                                className='flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleVerification}
                                className={`flex-1 py-2 px-4 rounded transition-colors ${
                                    verificationData.status === 'approved' 
                                        ? 'bg-green-500 text-white hover:bg-green-600' 
                                        : 'bg-red-500 text-white hover:bg-red-600'
                                }`}
                            >
                                {verificationData.status === 'approved' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DoctorVerification 