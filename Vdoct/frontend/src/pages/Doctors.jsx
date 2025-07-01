import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import { specialityData } from '../assets/assets'

const Doctors = () => {
  const { speciality } = useParams()
  const [filterDoc, setFilterDoc] = useState([])
  const [search, setSearch] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [animateCards, setAnimateCards] = useState(false)
  const navigate = useNavigate();
  const { doctors, refreshDoctors, backendUrl } = useContext(AppContext)

  useEffect(() => {
    let docs = doctors
    if (speciality) {
      docs = docs.filter(doc => doc.speciality === speciality)
    }
    if (search.trim()) {
      docs = docs.filter(doc =>
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.speciality.toLowerCase().includes(search.toLowerCase())
      )
    }
    setFilterDoc(docs)
  }, [doctors, speciality, search])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setAnimateCards(true)
    await refreshDoctors()
    setTimeout(() => {
      setIsRefreshing(false)
      setAnimateCards(false)
    }, 700) // keep spin and animation for a short time for effect
  }

  // Construct image URL properly
  const getImageUrl = (doctor) => {
    if (doctor.image) {
      // If it's a full URL, use it as is
      if (doctor.image.startsWith('http')) {
        return doctor.image;
      }
      // If it's a filename, construct the full URL
      return `${backendUrl}/uploads/${doctor.image}`;
    }
    // Fallback to avatar service
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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Back Button at far left of main body, above sticky header */}
      <div className="max-w-6xl mx-auto w-full px-4 pt-8 flex items-center gap-5">
        <button onClick={() => navigate(-1)} className="bg-white text-primary rounded-full w-9 h-9 flex items-center justify-center shadow hover:bg-accent hover:text-white transition mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button onClick={() => navigate('/')} className="bg-white text-primary rounded-full w-9 h-9 flex items-center justify-center shadow hover:bg-accent hover:text-white transition mb-4 ml-5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4.5 10.5V19a1.5 1.5 0 001.5 1.5h3.75m6 0H18a1.5 1.5 0 001.5-1.5V10.5M9.75 21V15h4.5v6" />
          </svg>
        </button>
      </div>
      {/* Sticky Doctors Header */}
      <div className="sticky top-0 z-30 px-4 py-3 mb-6 rounded-xl backdrop-blur bg-primary/60 shadow-lg shadow-primary/10 border-b border-primary/20 max-w-xl mx-auto mt-[-1.5rem] flex items-center justify-center relative">
        <h1 className="text-xl sm:text-2xl font-bold text-surface tracking-tight mx-auto">Find Your Doctor</h1>
      </div>
      <div className="max-w-6xl mx-auto w-full px-4 py-8">
        {/* Header with refresh button on the right */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-text">Browse and book appointments with top specialists.</p>
          <button 
            onClick={handleRefresh}
            className="bg-primary text-white rounded-full p-3 shadow-lg hover:bg-accent hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            title="Refresh doctors list"
            disabled={isRefreshing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}> 
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
        {/* Specialties Bar */}
        <div className="flex overflow-x-auto gap-4 pb-4 mb-6 border-b border-primary/10">
          {specialityData.map((item) => (
            <button
              key={item.speciality}
              onClick={() => navigate(`/doctors/${item.speciality}`)}
              className={`flex flex-col items-center px-4 py-2 rounded-lg border transition-all min-w-[110px] ${speciality === item.speciality ? 'bg-primary text-surface border-primary shadow' : 'bg-surface text-primary border-primary/30 hover:bg-primary/10'}`}
            >
              <img src={item.image} alt={item.speciality} className="w-10 h-10 mb-1" />
              <span className="text-xs font-semibold">{item.speciality}</span>
            </button>
          ))}
          <button
            onClick={() => navigate('/doctors')}
            className={`flex flex-col items-center px-4 py-2 rounded-lg border transition-all min-w-[110px] ${!speciality ? 'bg-primary text-surface border-primary shadow' : 'bg-surface text-primary border-primary/30 hover:bg-primary/10'}`}
          >
            <span className="w-10 h-10 mb-1 flex items-center justify-center text-2xl font-bold">&#9733;</span>
            <span className="text-xs font-semibold">All</span>
          </button>
        </div>
        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text bg-surface shadow-sm"
          />
        </div>
        {/* Doctors Grid */}
        {filterDoc.length === 0 ? (
          <div className="text-center text-lg text-gray-400 py-20">
            <span>No doctors found for your search.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 mt-5">
            {filterDoc.map((item, idx) => (
              <div
                key={item._id}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 pt-8 pb-8 px-6 flex flex-col items-center cursor-pointer group hover:-translate-y-1 border border-primary/10 ${animateCards ? 'animate-fade-in-up' : ''}`}
                style={animateCards ? { animationDelay: `${idx * 60}ms` } : {}}
                onClick={() => { navigate(`/doctor/${item._id}`); window.scrollTo(0, 0); }}
              >
                {/* Doctor image with availability badge */}
                <div className="mb-4 flex flex-col items-center">
                  <div className="relative">
                    <img 
                      className='w-20 h-20 object-cover rounded-full border-4 border-white shadow-md bg-white' 
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
                  <p className='text-lg font-bold text-primary text-center'>{item.name}</p>
                  <span className='inline-block bg-accent/10 text-accent text-xs font-semibold px-3 py-1 rounded-full my-2'>{item.speciality}</span>
                  <p className='text-text text-xs text-center'>{item.degree} &bull; {item.experience}</p>
                  <p className='text-gray-400 text-xs text-center'>{item.address.line1}</p>
                  <button className="mt-5 px-5 py-2 bg-accent text-white rounded-full font-semibold shadow hover:bg-primary transition w-full">View Profile</button>
                </div>
                {/* Verification Badge */}
                {getVerificationBadge(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Doctors