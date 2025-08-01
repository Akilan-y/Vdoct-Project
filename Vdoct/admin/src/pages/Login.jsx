import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const [state, setState] = useState('Admin Login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const { backendUrl, adminToken, setAdminToken } = useContext(AdminContext)
  const { doctorToken, setDoctorToken } = useContext(DoctorContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (state === 'Admin Login') {

      const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })

      if (data.success) {
        localStorage.setItem('adminToken', data.token)
        setAdminToken(data.token)
        toast.success('Admin login successful!')
      } else {
        toast.error(data.message)
      }

    } else {

      const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })

      if (data.success) {
        localStorage.setItem('doctorToken', data.token)
        setDoctorToken(data.token)
        toast.success('Doctor login successful!')
      } else {
        toast.error(data.message)
      }

    }

  }

  useEffect(() => {
    if (adminToken) {
      navigate('/admin-dashboard')
    }
  }, [adminToken, navigate])

  useEffect(() => {
    if (doctorToken) {
      navigate('/doctor-dashboard')
    }
  }, [doctorToken, navigate])

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4'>
            👨‍⚕️
          </div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>{state}</h1>
          <p className='text-gray-600'>Welcome to vdoct healthcare management</p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmitHandler} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
            <input 
              onChange={(e) => setEmail(e.target.value)} 
              value={email} 
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200' 
              type="email" 
              placeholder="Enter your email"
              required 
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
            <input 
              onChange={(e) => setPassword(e.target.value)} 
              value={password} 
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200' 
              type="password" 
              placeholder="Enter your password"
              required 
            />
          </div>
          
          <button 
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
          >
            {state}
          </button>
        </form>

        {/* Toggle */}
        <div className='mt-6 text-center'>
          {state === 'Admin Login' ? (
            <p className='text-gray-600'>
              Login as Doctor? 
              <span 
                onClick={() => setState('Doctor Login')} 
                className='text-blue-600 hover:text-blue-700 underline cursor-pointer ml-1 font-medium'
              >
                Click here
              </span>
            </p>
          ) : (
            <p className='text-gray-600'>
              Login as Admin? 
              <span 
                onClick={() => setState('Admin Login')} 
                className='text-blue-600 hover:text-blue-700 underline cursor-pointer ml-1 font-medium'
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login