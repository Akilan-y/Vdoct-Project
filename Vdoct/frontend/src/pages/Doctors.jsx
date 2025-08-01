import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { specialityData } from '../assets/assets';
import menu_icon from '../assets/menu_icon.svg';

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [showSpecialties, setShowSpecialties] = useState(true); // visible by default
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { doctors, refreshDoctors } = useContext(AppContext);

  useEffect(() => {
    let docs = doctors;
    if (speciality) {
      docs = docs.filter(doc => doc.speciality === speciality);
    }
    if (search.trim()) {
      docs = docs.filter(doc =>
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.speciality.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilterDoc(docs);
  }, [doctors, speciality, search]);

  // Hide specialties list on mobile when burger is tapped
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setShowSpecialties(true); // always show on desktop
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setAnimateCards(true);
    await refreshDoctors();
    setTimeout(() => {
      setIsRefreshing(false);
      setAnimateCards(false);
    }, 700);
  };

  const getImageUrl = (doctor) => {
    if (doctor.image) {
      if (doctor.image.startsWith('http')) {
        return doctor.image;
      }
              return doctor.image;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random&size=256`;
  };

  const getVerificationBadge = (doctor) => {
    if (doctor.isVerified && doctor.verificationStatus === 'approved') {
      return (
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      {/* Back & Home & Refresh Buttons */}
      <div className="max-w-6xl mx-auto w-full px-4 pt-8 flex items-center gap-5">
        <button onClick={() => navigate(-1)} className="bg-white text-primary rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-accent hover:text-white transition mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button onClick={() => navigate('/')} className="bg-white text-primary rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-accent hover:text-white transition mb-4 ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4.5 10.5V19a1.5 1.5 0 001.5 1.5h3.75m6 0H18a1.5 1.5 0 001.5-1.5V10.5M9.75 21V15h4.5v6" />
          </svg>
        </button>
          <button 
            onClick={handleRefresh}
          className="bg-accent text-white rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-primary hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-4 ml-2"
            title="Refresh doctors list"
            disabled={isRefreshing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}> 
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      {/* Sticky Doctors Header */}
      <div className="sticky top-0 z-30 px-4 py-4 mb-8 rounded-2xl bg-white/90 shadow-lg max-w-2xl mx-auto mt-[-1.5rem] flex items-center justify-center relative animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight mx-auto">Find Your Doctor</h1>
        </div>
      <div className="max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Specialties List - Left Sidebar on Desktop, collapsible on mobile */}
          <div className="md:w-1/4 w-full md:sticky md:top-32">
            {/* Search Bar (now above burger menu) */}
            <div className="mb-6 flex justify-center md:justify-start">
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
                className="w-full max-w-lg px-5 py-3 border-2 border-primary/20 rounded-full focus:outline-none focus:ring-2 focus:ring-accent text-text bg-white shadow-md text-base"
          />
        </div>
            <div className="relative flex md:block justify-center mb-8 md:mb-0">
              <button
                className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md border-2 border-primary/10 hover:bg-primary/10 transition text-primary font-semibold w-full md:hidden"
                onClick={() => setShowSpecialties((v) => !v)}
                ref={dropdownRef}
              >
                <img src={menu_icon} alt="menu" className="w-6 h-6" />
                <span>{speciality || 'Specialties'}</span>
                <svg className={`w-4 h-4 ml-1 transition-transform ${!showSpecialties ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {/* Specialties List */}
              {(showSpecialties || window.innerWidth >= 768) && (
                <div className="w-full md:w-auto bg-white rounded-2xl shadow-lg border-2 border-primary/10 py-2 mt-4 md:mt-0 animate-fade-in-up">
                  {specialityData.map((item) => (
                    <button
                      key={item.speciality}
                      onClick={() => { setShowSpecialties(window.innerWidth >= 768); navigate(`/doctors/${item.speciality}`); }}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-primary/10 transition text-primary font-medium ${speciality === item.speciality ? 'bg-accent/10 text-accent' : ''}`}
                    >
                      <img src={item.image} alt={item.speciality} className="w-7 h-7" />
                      <span>{item.speciality}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowSpecialties(window.innerWidth >= 768); navigate('/doctors'); }}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-primary/10 transition text-primary font-medium ${!speciality ? 'bg-accent/10 text-accent' : ''}`}
                  >
                    <span className="w-7 h-7 flex items-center justify-center text-lg font-bold">&#9733;</span>
                    <span>All</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Doctors Grid - Right Side */}
          <div className="md:w-3/4 w-full">
        {filterDoc.length === 0 ? (
          <div className="text-center text-lg text-gray-400 py-20">
            <span>No doctors found for your search.</span>
          </div>
        ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-5">
            {filterDoc.map((item, idx) => (
              <div
                key={item._id}
                    className={`relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 pt-5 pb-5 px-4 flex flex-col items-center cursor-pointer group hover:-translate-y-1 border border-primary/10 ${animateCards ? 'animate-fade-in-up' : ''}`}
                style={animateCards ? { animationDelay: `${idx * 60}ms` } : {}}
                onClick={() => { navigate(`/doctor/${item._id}`); window.scrollTo(0, 0); }}
              >
                {/* Doctor image with availability badge */}
                    <div className="mb-2 flex flex-col items-center">
                  <div className="relative">
                    <img 
                          className='w-16 h-16 object-cover rounded-full border-4 border-white shadow bg-white' 
                      src={getImageUrl(item)} 
                      alt={item.name} 
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&size=256`;
                      }}
                    />
                    <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${(item?.available !== false) ? 'bg-success' : 'bg-gray-400'}`}></span>
                  </div>
                </div>
                <div className='w-full flex flex-col items-center'>
                      <p className='text-base font-bold text-primary text-center'>{item.name}</p>
                      <span className='inline-block bg-accent/10 text-accent text-xs font-semibold px-2 py-1 rounded-full my-1'>{item.speciality}</span>
                  <p className='text-text text-xs text-center'>{item.degree} &bull; {item.experience}</p>
                  <p className='text-gray-400 text-xs text-center'>{item.address.line1}</p>
                      <button className="mt-3 px-4 py-1.5 bg-accent text-white rounded-full font-semibold shadow hover:bg-primary transition w-full text-sm">View Profile</button>
                </div>
                {/* Verification Badge */}
                {getVerificationBadge(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
      </div>
    </div>
  );
};

export default Doctors;