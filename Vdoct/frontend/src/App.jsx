import React from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import Appointment from './pages/Appointment'
import MyAppointments from './pages/MyAppointments'
import MyProfile from './pages/MyProfile'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify'
import DoctorProfile from './pages/DoctorProfile'

const App = () => {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith('/doctors');
  return (
    <div className='min-h-screen flex flex-col mx-4 sm:mx-[10%]'>
      <ToastContainer />
      {!hideHeader && <Navbar />}
      <div className="flex-1 my-6 rounded-2xl bg-white shadow p-4 sm:p-8 min-h-[60vh]">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/doctors/:speciality' element={<Doctors />} />
          <Route path='/login' element={<Login />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/appointment/:docId' element={<Appointment />} />
          <Route path='/my-appointments' element={<MyAppointments />} />
          <Route path='/my-profile' element={<MyProfile />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/doctor/:id' element={<DoctorProfile />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App