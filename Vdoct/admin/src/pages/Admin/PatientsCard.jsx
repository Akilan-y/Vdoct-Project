import React from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const PatientsCard = ({ count }) => {
  const navigate = useNavigate()
  return (
    <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all' onClick={() => navigate('/patients-list')}>
      <img className='w-14' src={assets.patients_icon} alt="" />
      <div>
        <p className='text-xl font-semibold text-gray-600'>{count}</p>
        <p className='text-gray-400'>Patients</p>
      </div>
    </div>
  )
}

export default PatientsCard 