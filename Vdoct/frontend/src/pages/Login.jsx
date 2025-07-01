import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const { backendUrl, token, setToken } = useContext(AppContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (state === 'Sign Up') {
      const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password })
      if (data.success) {
        localStorage.setItem('token', data.token)
        setToken(data.token)
        toast.success('Account created successfully!')
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } else {
      const { data } = await axios.post(backendUrl + '/api/user/login', { email, password })
      if (data.success) {
        localStorage.setItem('token', data.token)
        setToken(data.token)
        toast.success('Login successful!')
        navigate('/')
      } else {
        toast.error(data.message)
      }
    }
  }

  useEffect(() => {
    if (token) {
      toast.info('You are already logged in. Redirecting to home...')
      setTimeout(() => {
        navigate('/')
      }, 2000)
    }
  }, [token, navigate])

  // If already logged in, show a message
  if (token) {
    return (
      <div className='min-h-[80vh] flex items-center justify-center bg-background'>
        <div className='w-full max-w-md bg-white border-2 border-primary/20 rounded-2xl shadow-xl p-8 flex flex-col gap-6 text-center'>
          <h1 className='text-3xl font-bold text-primary'>Already Logged In</h1>
          <p className='text-text'>You are already logged in. Redirecting to home page...</p>
          <button 
            onClick={() => navigate('/')}
            className='w-full bg-primary text-white py-3 rounded-lg font-semibold text-lg shadow hover:bg-accent transition'
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center justify-center bg-background'>
      <div className='w-full max-w-md bg-white border-2 border-primary/20 rounded-2xl shadow-xl p-8 flex flex-col gap-6'>
        <h1 className='text-3xl font-bold text-primary text-center mb-2'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</h1>
        <p className='text-center text-text mb-2'>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book an appointment</p>
        {state === 'Sign Up' && (
          <div className='w-full'>
            <label className='block text-sm font-medium text-text mb-1'>Full Name</label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-primary'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
              </span>
              <input onChange={(e) => setName(e.target.value)} value={name} className='pl-10 pr-3 py-2 border border-primary/20 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary' type="text" required />
            </div>
          </div>
        )}
        <div className='w-full'>
          <label className='block text-sm font-medium text-text mb-1'>Email</label>
          <div className='relative'>
            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-primary'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M16 12H8m8 0a8 8 0 11-16 0 8 8 0 0116 0z' /></svg>
            </span>
            <input onChange={(e) => setEmail(e.target.value)} value={email} className='pl-10 pr-3 py-2 border border-primary/20 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary' type="email" required />
          </div>
        </div>
        <div className='w-full'>
          <label className='block text-sm font-medium text-text mb-1'>Password</label>
          <div className='relative'>
            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-primary'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M12 15v2m0 0a2 2 0 100-4 2 2 0 000 4zm6 2V7a2 2 0 00-2-2H8a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2z' /></svg>
            </span>
            <input onChange={(e) => setPassword(e.target.value)} value={password} className='pl-10 pr-3 py-2 border border-primary/20 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary' type="password" required />
          </div>
        </div>
        <button className='w-full bg-primary text-white py-3 rounded-lg font-semibold text-lg shadow hover:bg-accent transition'>{state === 'Sign Up' ? 'Create account' : 'Login'}</button>
        <div className='text-center text-sm mt-2'>
          {state === 'Sign Up'
            ? <span>Already have an account? <button type="button" onClick={() => setState('Login')} className='text-accent underline font-semibold hover:text-primary transition'>Login here</button></span>
            : <span>Don&apos;t have an account? <button type="button" onClick={() => setState('Sign Up')} className='text-accent underline font-semibold hover:text-primary transition'>Create one</button></span>
          }
        </div>
      </div>
    </form>
  )
}

export default Login