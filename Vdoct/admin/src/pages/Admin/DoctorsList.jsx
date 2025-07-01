import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const DoctorsList = () => {

  const { doctors, changeAvailability , adminToken , getDoctorsData} = useContext(AdminContext)
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
    setVerifying(prev => ({ ...prev, [doctor._id]: true }));
    try {
      await changeAvailability(doctor._id, { verificationStatus: doctor.verificationStatus === 'approved' ? 'pending' : 'approved' });
      setLocalAvailability(prev => ({ ...prev, [doctor._id]: !prev[doctor._id] }));
    } catch (error) {
      // Revert UI if backend call fails
      setLocalAvailability(prev => ({ ...prev, [doctor._id]: !prev[doctor._id] }));
    } finally {
      setVerifying(prev => ({ ...prev, [doctor._id]: false }));
    }
  };

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h1 className='text-lg font-medium'>All Doctors</h1>
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {doctors.map((item, index) => (
          <div className='border border-[#C9D8FF] rounded-xl w-56 h-80 flex flex-col overflow-hidden cursor-pointer group' key={index}>
            <img className='bg-[#EAEFFF] group-hover:bg-primary transition-all duration-500 h-40 w-full object-cover' 
              src={item.image 
                ? (item.image.startsWith('http') 
                    ? item.image 
                    : backendUrl + '/uploads/' + item.image)
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&size=256`}
              alt="" />
            <div className='p-4 flex-1 flex flex-col justify-between'>
              <div>
                <p className='text-[#262626] text-lg font-medium'>{item.name}</p>
                <p className='text-[#5C5C5C] text-sm'>{item.speciality}</p>
                <p className='text-[#5C5C5C] text-xs mt-1'>{item.degree}</p>
              </div>
              <div className='space-y-2'>
                {/* Verification Toggle Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerificationToggle(item);
                  }}
                  disabled={!!verifying[item._id]}
                  className={`w-full py-2 px-3 rounded text-xs font-medium transition-colors ${
                    item.verificationStatus === 'approved'
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } ${verifying[item._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {verifying[item._id] ? 'Processing...' : 
                    item.verificationStatus === 'approved' ? 'Revert to Pending' : 'Verify Doctor'
                  }
                </button>
                
                {/* Availability Toggle */}
                <div className='flex items-center gap-1 text-sm'>
                  <input 
                    onChange={() => handleToggle(item._id)} 
                    type="checkbox" 
                    checked={!!localAvailability[item._id]} 
                    disabled={!!toggling[item._id]} 
                  />
                  <p>{localAvailability[item._id] ? 'Available' : 'Unavailable'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorsList