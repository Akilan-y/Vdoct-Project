import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'

const Sidebar = () => {

  const { doctorToken } = useContext(DoctorContext)
  const { adminToken } = useContext(AdminContext)

  return (
    <div className='min-h-screen bg-white shadow-lg rounded-2xl mx-6 mt-4 mb-6 w-80'>
      {adminToken && (
        <div className='p-6'>
          <div className='mb-8'>
            <h2 className='text-lg font-bold text-gray-800 mb-2'>Admin Dashboard</h2>
            <p className='text-sm text-gray-600'>Manage your healthcare platform</p>
          </div>
          
          <nav className='space-y-2'>
            <NavLink 
              to={'/admin-dashboard'} 
              className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <img className='w-5 h-5' src={assets.home_icon} alt='' />
              <span className='font-medium'>Dashboard</span>
        </NavLink>
            
            <NavLink 
              to={'/all-appointments'} 
              className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <img className='w-5 h-5' src={assets.appointment_icon} alt='' />
              <span className='font-medium'>Appointments</span>
        </NavLink>
            
            <NavLink 
              to={'/add-doctor'} 
              className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <img className='w-5 h-5' src={assets.add_icon} alt='' />
              <span className='font-medium'>Add Doctor</span>
        </NavLink>
            
            <NavLink 
              to={'/doctor-verification'} 
              className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <img className='w-5 h-5' src={assets.verified_icon} alt='' />
              <span className='font-medium'>Doctor Verification</span>
        </NavLink>
            
            <NavLink 
              to={'/doctor-list'} 
              className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <img className='w-5 h-5' src={assets.people_icon} alt='' />
              <span className='font-medium'>Doctors List</span>
        </NavLink>
            
            <NavLink 
              to={'/patients-list'} 
              className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <img className='w-5 h-5' src={assets.patients_icon} alt='' />
              <span className='font-medium'>Patients</span>
        </NavLink>
          </nav>
        </div>
      )}

      {doctorToken && (
        <div className='p-6'>
          <div className='mb-8'>
            <h2 className='text-lg font-bold text-gray-800 mb-2'>Doctor Dashboard</h2>
            <p className='text-sm text-gray-600'>Manage your practice</p>
          </div>
          
          <nav className='space-y-2'>
            <NavLink 
              to={'/doctor-dashboard'} 
              className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <img className='w-5 h-5' src={assets.home_icon} alt='' />
              <span className='font-medium'>Dashboard</span>
        </NavLink>
            
            <NavLink 
              to={'/doctor-appointments'} 
              className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <img className='w-5 h-5' src={assets.appointment_icon} alt='' />
              <span className='font-medium'>Appointments</span>
        </NavLink>
            
            <NavLink 
              to={'/doctor-profile'} 
              className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <img className='w-5 h-5' src={assets.people_icon} alt='' />
              <span className='font-medium'>Profile</span>
        </NavLink>
          </nav>
        </div>
      )}
    </div>
  )
}

export default Sidebar