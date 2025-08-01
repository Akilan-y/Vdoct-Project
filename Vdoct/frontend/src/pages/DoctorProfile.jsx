import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const funFacts = {
  'doc1': 'Enjoys hiking and nature photography.',
  'doc2': 'Volunteers at local women\'s health camps.',
  'doc3': 'Has published 10+ research papers on skincare.',
  'doc4': 'Loves painting and children\'s storybooks.',
  'doc5': 'Chess enthusiast and marathon runner.',
  'doc6': 'Speaks three languages fluently.',
  'doc7': 'Hosts a weekly radio show on digestive health.',
  'doc8': 'Plays the violin in a community orchestra.',
  'doc9': 'Certified yoga instructor.',
  'doc10': 'Runs a blog for new parents.',
  'doc11': 'Enjoys mountain biking.',
  'doc12': 'Collects rare medical books.',
  'doc13': 'Gardening is her favorite weekend activity.',
  'doc14': 'Has traveled to 20+ countries.',
  'doc15': 'Bakes custom cakes for charity events.',
  'doc8b': 'Organizes free digestive health camps.'
};

const DoctorProfile = () => {
  const { id } = useParams();
  const { doctors, backendUrl } = useContext(AppContext);
  
  console.log('DoctorProfile id:', id, 'Available doctors:', doctors.length);
  const doctor = doctors.find(doc => doc._id === id);

  if (!doctor) {
    return <div className="text-center py-20 text-xl text-red-500">Doctor not found.</div>;
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

  const getVerificationStatus = () => {
    if (doctor.isVerified && doctor.verificationStatus === 'approved') {
      return (
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified Doctor
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto bg-surface rounded-xl shadow p-8 mt-10 mb-10">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <img 
          src={getImageUrl(doctor)} 
          alt={doctor.name} 
          className="w-40 h-40 rounded-full object-cover border-4 border-accent" 
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random&size=256`;
          }}
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primary mb-2">{doctor.name}</h1>
          {getVerificationStatus()}
          <div className="text-accent font-semibold mb-2">{doctor.speciality}</div>
          <div className="mb-2 text-text">{doctor.degree} &bull; {doctor.experience}</div>
          {doctor.phone && (
            <div className="mb-2 text-text">
              <b>Phone:</b> <a href={`tel:${doctor.phone}`} className="text-accent hover:underline">{doctor.phone}</a>
            </div>
          )}
          <div className="mb-2 text-text">
            <b>Address:</b> {doctor.address.line1}, {doctor.address.line2}
          </div>
          <div className="mb-2 text-text">
            <b>Fee:</b> ${doctor.fees}
          </div>
          {doctor.upiId && (
            <div className="mb-2 text-text">
              <b>Payment UPI ID:</b> <span className="font-mono text-accent">{doctor.upiId}</span>
            </div>
          )}
          {doctor.licenseNumber && (
            <div className="mb-2 text-text">
              <b>License:</b> {doctor.licenseNumber}
            </div>
          )}
          {doctor.registrationNumber && (
            <div className="mb-2 text-text">
              <b>Registration:</b> {doctor.registrationNumber}
            </div>
          )}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2 text-primary">About the Doctor</h2>
        <p className="text-text mb-6">{doctor.about}</p>
        <Link to={`/appointment/${doctor._id}`} className="inline-block px-8 py-3 bg-primary text-surface font-semibold rounded shadow hover:bg-accent transition">Book Appointment</Link>
      </div>
    </div>
  );
};

export default DoctorProfile; 