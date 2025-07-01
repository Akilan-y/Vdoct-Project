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
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#515151] text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state}</p>
        <p>Please {state === 'Admin Login' ? 'login as admin' : 'login as doctor'}</p>
        <div className='w-full '>
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" required />
        </div>
        <div className='w-full '>
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" required />
        </div>
        <button className='bg-primary text-white w-full py-2 my-2 rounded-md text-base'>{state}</button>
        {state === 'Admin Login'
          ? <p>Login as Doctor? <span onClick={() => setState('Doctor Login')} className='text-primary underline cursor-pointer'>Click here</span></p>
          : <p>Login as Admin? <span onClick={() => setState('Admin Login')} className='text-primary underline cursor-pointer'>Click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login