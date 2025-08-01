import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import Appointment from './pages/Appointment';
import MyAppointments from './pages/MyAppointments';
import MyProfile from './pages/MyProfile';
import Meet from './pages/Meet';
import Verify from './pages/Verify';
import DoctorProfile from './pages/DoctorProfile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';

const App = () => {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith('/doctors');
  const hideFooter = location.pathname === '/meet';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex flex-col items-center">
      <ToastContainer />
      {!hideHeader && <Navbar />}
      <main className="flex-1 w-full max-w-6xl mx-auto my-8 rounded-3xl bg-white/90 shadow-lg p-0 sm:p-10 min-h-[60vh] animate-fade-in-up">
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
          <Route path='/meet' element={<Meet />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/doctor/:id' element={<DoctorProfile />} />
          <Route path='/privacy-policy' element={<PrivacyPolicy />} />
          <Route path='/terms' element={<Terms />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default App;