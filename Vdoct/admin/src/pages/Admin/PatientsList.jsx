import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';

const PatientsList = () => {
  const { users, getUsersData } = useContext(AdminContext);
  const navigate = useNavigate();

  useEffect(() => {
    getUsersData();
  }, [getUsersData]);

  return (
    <div className='w-full max-w-6xl m-5'>
      <div className='flex justify-between items-center mb-3'>
        <p className='text-lg font-medium'>All Patients</p>
        <button
          className='bg-primary text-white px-5 py-2 rounded-full hover:bg-accent transition font-semibold shadow'
          onClick={() => navigate('/add-patient')}
        >
          + Add Patient
        </button>
      </div>
      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='hidden sm:grid grid-cols-[0.5fr_2fr_2fr_2fr_1fr_1fr_2fr] grid-flow-col py-3 px-6 border-b font-semibold bg-gray-50'>
          <p>#</p>
          <p>Name</p>
          <p>Email</p>
          <p>Phone</p>
          <p>Gender</p>
          <p>DOB</p>
          <p>Address</p>
        </div>
        {users.map((user, idx) => (
          <div key={user._id} className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_2fr_2fr_1fr_1fr_2fr] items-center text-gray-700 py-3 px-6 border-b hover:bg-gray-50'>
            <p className='max-sm:hidden'>{idx + 1}</p>
            <div className='flex items-center gap-2'>
              <img
                src={
                  user.image
                    ? user.image.startsWith('http')
                      ? user.image
                      : user.image.startsWith('data:image')
                        ? user.image
                        : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/uploads/${user.image}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=64`
                }
                className='w-8 h-8 rounded-full object-cover bg-gray-100'
                alt={user.name}
              />
              <p>{user.name}</p>
            </div>
            <p>{user.email}</p>
            <p>{user.phone}</p>
            <p>{user.gender}</p>
            <p>{user.dob}</p>
            <p>{user.address?.line1} {user.address?.line2}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientsList; 