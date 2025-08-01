import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {

  const { doctorToken, setDoctorToken } = useContext(DoctorContext)
  const { adminToken, setAdminToken } = useContext(AdminContext)

  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    doctorToken && setDoctorToken('')
    doctorToken && localStorage.removeItem('doctorToken')
    adminToken && setAdminToken('')
    adminToken && localStorage.removeItem('adminToken')
  }

  return (
    <div className='bg-white shadow-lg rounded-2xl mx-6 mt-6 mb-4 px-6 py-4 flex justify-between items-center'>
      <div className='flex items-center gap-4'>
        <div 
          onClick={() => navigate('/')} 
          className='flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity'
        >
          <span className='text-2xl font-bold text-blue-600 tracking-tight'>vdoct</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
          <span className='text-sm font-medium text-gray-600 px-3 py-1 bg-gray-100 rounded-full'>
            {adminToken ? 'Admin Panel' : 'Doctor Panel'}
          </span>
        </div>
      </div>
      
      <button 
        onClick={logout} 
        className='bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar