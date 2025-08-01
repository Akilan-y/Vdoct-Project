import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const DoctorsList = () => {

  const { doctors, changeAvailability, changeVerificationStatus, adminToken , getDoctorsData} = useContext(AdminContext)
  const { backendUrl } = useContext(AppContext)
  const [toggling, setToggling] = useState({});
  const [localAvailability, setLocalAvailability] = useState({});
  const [verifying, setVerifying] = useState({});

  useEffect(() => {
    if (adminToken) {
        getDoctorsData()
    }
}, [adminToken, getDoctorsData])

  // Sync local availability with doctors list
  useEffect(() => {
    const avail = {};
    doctors.forEach(doc => {
      avail[doc._id] = !!doc.available;
    });
    setLocalAvailability(avail);
  }, [doctors]);

  const handleToggle = async (doctorId) => {
    setToggling(prev => ({ ...prev, [doctorId]: true }));
    setLocalAvailability(prev => {
      const newValue = !prev[doctorId];
      return { ...prev, [doctorId]: newValue };
    });
    try {
      await changeAvailability(doctorId);
    } catch (error) {
      // Revert UI if backend call fails
      setLocalAvailability(prev => {
        const reverted = !prev[doctorId];
        return { ...prev, [doctorId]: reverted };
      });
    } finally {
      setToggling(prev => ({ ...prev, [doctorId]: false }));
    }
  };

  const handleVerificationToggle = async (doctor) => {
    console.log('=== DOCTOR VERIFICATION TOGGLE ===');
    console.log('Doctor object:', doctor);
    console.log('Current doctor status:', doctor.verificationStatus);
    console.log('Doctor ID:', doctor._id);
    
    setVerifying(prev => ({ ...prev, [doctor._id]: true }));
    try {
      let newStatus;
      if (doctor.verificationStatus === 'pending') {
        newStatus = 'approved';
      } else if (doctor.verificationStatus === 'approved') {
        newStatus = 'verified';
      } else if (doctor.verificationStatus === 'verified') {
        newStatus = 'pending';
      } else {
        // Handle case where verificationStatus might be undefined/null
        console.log('Unknown verification status:', doctor.verificationStatus);
        newStatus = 'pending';
      }
      
      console.log('Changing status from', doctor.verificationStatus, 'to', newStatus);
      console.log('Calling changeVerificationStatus with:', { doctorId: doctor._id, status: newStatus });
      
      await changeVerificationStatus(doctor._id, newStatus);
      console.log('Status change completed, refreshing data...');
      await getDoctorsData(); // Refresh the doctors list to update UI
      console.log('Data refreshed');
    } catch (error) {
      console.error('Error in handleVerificationToggle:', error);
      // Optionally handle error UI
    } finally {
      setVerifying(prev => ({ ...prev, [doctor._id]: false }));
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-2xl shadow-lg p-6'>
        <div className='flex items-center gap-4'>
          <div className='p-3 bg-blue-100 rounded-xl'>
            <span className='text-2xl text-blue-600'>👨‍⚕️</span>
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>All Doctors</h1>
            <p className='text-gray-600'>Manage doctor profiles and verification status</p>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {doctors.map((item, index) => (
          <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1' key={index}>
            {/* Doctor Image */}
            <div className='relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50'>
              <img 
                className='w-full h-full object-cover' 
              src={item.image 
                ? (item.image.startsWith('http') 
                    ? item.image 
                    : backendUrl + '/uploads/' + item.image)
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&size=256`}
                alt={item.name}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&size=256`;
                }}
              />
              {/* Status Badge */}
              <div className='absolute top-3 right-3'>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  localAvailability[item._id] 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {localAvailability[item._id] ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            {/* Doctor Info */}
            <div className='p-6 space-y-4'>
              <div>
                <h3 className='text-lg font-bold text-gray-900 mb-1'>{item.name}</h3>
                <p className='text-blue-600 font-medium text-sm mb-1'>{item.speciality}</p>
                <p className='text-gray-600 text-sm'>{item.degree}</p>
              </div>

              {/* UPI ID */}
              <div className='bg-gray-50 rounded-lg p-3'>
                <p className='text-xs text-gray-600 mb-1 font-medium'>UPI ID</p>
                <p className='text-sm text-gray-900 font-mono'>
                  {item.upiId ? item.upiId : 'uthayakilan@okaxis (Default)'}
                  </p>
              </div>

              {/* Action Buttons */}
              <div className='space-y-3'>
                {/* Verification Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerificationToggle(item);
                  }}
                  disabled={!!verifying[item._id]}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                    item.verificationStatus === 'approved'
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md'
                      : item.verificationStatus === 'verified'
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
                  } ${verifying[item._id] ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'}`}
                >
                  {verifying[item._id] ? (
                    <span className='flex items-center justify-center gap-2'>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                      Processing...
                    </span>
                  ) : (
                    item.verificationStatus === 'pending' ? 'Verify Doctor' :
                    item.verificationStatus === 'approved' ? 'Approve Doctor' :
                    'Revert to Pending'
                  )}
                </button>
                
                {/* Availability Toggle */}
                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <span className='text-sm font-medium text-gray-700'>Availability</span>
                  <label className='relative inline-flex items-center cursor-pointer'>
                  <input 
                    onChange={() => handleToggle(item._id)} 
                    type="checkbox" 
                    checked={!!localAvailability[item._id]} 
                    disabled={!!toggling[item._id]} 
                      className='sr-only peer'
                  />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${toggling[item._id] ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {doctors.length === 0 && (
        <div className='bg-white rounded-2xl shadow-lg p-12 text-center'>
          <div className='text-gray-400 text-6xl mb-4'>👨‍⚕️</div>
          <h3 className='text-lg font-semibold text-gray-600 mb-2'>No Doctors Found</h3>
          <p className='text-gray-500'>No doctors have been registered yet.</p>
        </div>
      )}
    </div>
  )
}

export default DoctorsList