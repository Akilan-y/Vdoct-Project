import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const loaderStyle = `
@keyframes spin { 100% { transform: rotate(360deg); } }
.loader { border: 2px solid #f3f3f3; border-top: 2px solid #3498db; border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; }
`;

const MyProfile = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);
  const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext);
  const [saving, setSaving] = useState(false);

    // Function to calculate age from date of birth
    const calculateAge = (dob) => {
    if (!dob || dob === 'Not Selected') return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
        if (months < 0 || (months === 0 && days < 0)) {
      years--;
      months += 12;
        }
        if (days < 0) {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, birthDate.getDate());
      days = Math.floor((today - lastMonth) / (1000 * 60 * 60 * 24));
        }
    const totalDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;
    return { years, months, days, totalDays, totalHours, totalMinutes, totalSeconds };
  };

    // Function to update user profile data using API
    const updateUserProfileData = async () => {
    setSaving(true);
        try {
            if (!userData.name || userData.name.trim() === '') {
        toast.error("Please enter your name");
        setSaving(false);
        return;
            }
            if (!userData.phone || userData.phone.trim() === '') {
        toast.error("Please enter your phone number");
        setSaving(false);
        return;
            }
            if (!userData.dob || userData.dob === 'Not Selected') {
        toast.error("Please select your date of birth");
        setSaving(false);
        return;
            }
            if (!userData.gender || userData.gender === 'Not Selected') {
        toast.error("Please select your gender");
        setSaving(false);
        return;
            }
            if (!userData.address || !userData.address.line1 || userData.address.line1.trim() === '') {
        toast.error("Please provide your address");
        setSaving(false);
        return;
            }

            // Ensure address has proper structure
            const addressData = {
                line1: userData.address.line1 ? userData.address.line1.trim() : '',
                line2: userData.address.line2 ? userData.address.line2.trim() : ''
      };

            const formData = new FormData();

      formData.append('name', userData.name.trim());
      formData.append('phone', userData.phone.trim());
      formData.append('address', JSON.stringify(addressData));
      formData.append('gender', userData.gender);
      formData.append('dob', userData.dob);
      formData.append('bloodGroup', userData.bloodGroup || 'Not Selected');

      image && formData.append('image', image);

            // Debug: Log the data being sent
            console.log('Sending profile data:', {
                name: userData.name.trim(),
                phone: userData.phone.trim(),
                address: addressData,
                gender: userData.gender,
                dob: userData.dob,
                bloodGroup: userData.bloodGroup || 'Not Selected',
                hasImage: !!image
      });

            // Debug: Log FormData contents
            for (let [key, value] of formData.entries()) {
                console.log('FormData entry:', key, value);
            }

      const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } });

      console.log('Response from server:', data);

            if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
            } else {
        toast.error(data.message);
            }

        } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
        } finally {
      setSaving(false);
    }
  };

  const ageData = calculateAge(userData?.dob);

    if (userData === false) {
        return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-accent/5">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text">Loading profile data...</p>
                </div>
            </div>
    );
    }
    if (userData === null) {
        return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-accent/5">
                <div className="text-center">
                    <div className="text-2xl text-red-500 font-semibold mb-4">Failed to load profile.</div>
                    <p className="text-text">Please log in again or check your connection.</p>
                </div>
            </div>
    );
    }
    if (!userData.name || !userData.email) {
        return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-accent/5">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text">Loading profile data...</p>
                </div>
            </div>
    );
    }

    return userData ? (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
            {/* Hero Section */}
      <div className="relative w-full h-[260px] md:h-[320px] flex items-center justify-center overflow-hidden mb-20">
        <img
          src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80"
          alt="Profile hero background neutral"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-gray-200/70 backdrop-blur-sm z-10" />
        <div className="relative z-20 max-w-2xl mx-auto p-8 bg-white/90 rounded-3xl shadow-2xl flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">My <span className="text-accent">Profile</span></h1>
          <p className="text-lg text-text">Manage your personal information and preferences</p>
                </div>
            </div>

            {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center gap-6 relative z-20">
                            {/* Profile Image */}
            <div className="relative mb-2">
                                {isEdit ? (
                                    <label htmlFor='image' className="cursor-pointer">
                                        <div className='relative group'>
                                            <img 
                                                className='w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg group-hover:opacity-75 transition-opacity' 
                                                src={image ? URL.createObjectURL(image) : (userData.image ? userData.image : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.name) + '&background=random&size=128')} 
                                                alt={userData.name} 
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-black/50 rounded-full p-3">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden accept="image/*" />
                                    </label>
                                ) : (
                                    <img 
                                        className='w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg' 
                                        src={userData.image ? userData.image : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.name) + '&background=random&size=128'} 
                                        alt={userData.name} 
                                    />
                                )}
                            </div>
            {/* Name, Email */}
            <div className="text-center w-full">
                                {isEdit ? (
                                    <input 
                  className='text-2xl font-bold text-primary bg-transparent border-b-2 border-primary/30 focus:border-primary focus:outline-none text-center w-full mb-2'
                                        type="text" 
                                        onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} 
                                        value={userData.name} 
                                    />
                                ) : (
                <h2 className='text-2xl font-bold text-primary mb-1'>{userData.name}</h2>
                                )}
              <div className="text-accent font-medium mb-2">{userData.email}</div>
            </div>
            {/* Editable Fields or Display Fields */}
            <div className="w-full flex flex-col gap-4">
                                    {isEdit ? (
                                        <>
                                            <input 
                                                className='w-full p-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200' 
                                                type="tel" 
                                                onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} 
                                                value={userData.phone} 
                    placeholder="Phone number"
                                            />
                                                <input 
                                                    className='w-full p-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200' 
                                                    type="text" 
                                                    onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} 
                                                    value={userData.address.line1} 
                                                    placeholder="Address line 1"
                                                />
                                                <input 
                                                    className='w-full p-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200' 
                                                    type="text" 
                                                    onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} 
                                                    value={userData.address.line2} 
                                                    placeholder="Address line 2"
                                                />
                                        <select 
                                            className='w-full p-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200' 
                                            onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} 
                                            value={userData.gender}
                                        >
                            <option value="Not Selected">Not Selected</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                                        <select 
                                            className='w-full p-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200' 
                                            onChange={(e) => setUserData(prev => ({ ...prev, bloodGroup: e.target.value }))} 
                                            value={userData.bloodGroup || 'Not Selected'}
                                        >
                                            <option value="Not Selected">Not Selected</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                        <input 
                                            className='w-full p-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200' 
                                            type='date' 
                                            onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} 
                                            value={userData.dob} 
                                        />
                  <div className="flex gap-4 justify-center mt-2">
                    <button
                      onClick={updateUserProfileData}
                      disabled={saving}
                      className='bg-primary text-white px-6 py-2 rounded-full hover:bg-accent transition-all duration-200 font-semibold shadow-lg hover:shadow-xl'
                    >
                      {saving ? <span className="loader"></span> : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEdit(false);
                        setImage(false);
                        loadUserProfileData();
                      }}
                      className='border border-primary text-primary px-6 py-2 rounded-full hover:bg-primary hover:text-white transition-all duration-200 font-semibold'
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : null}
            </div>
            {/* Edit Profile Button - only show when not editing */}
            {!isEdit && (
              <button
                onClick={() => setIsEdit(true)}
                className='bg-accent text-white px-8 py-3 rounded-full hover:bg-primary transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-lg mt-2 z-30 relative'
                style={{ zIndex: 30 }}
                type="button"
              >
                Edit Profile
              </button>
            )}
            {/* My Appointments Button */}
            <a
              href="/my-appointments"
              className="inline-block px-8 py-3 bg-primary text-white font-semibold rounded-full shadow hover:bg-accent transition text-lg mt-4"
            >
              My Appointments
            </a>
          </div>

          {/* Profile Details */}
          <div className="flex flex-col gap-10">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-primary">Contact Information</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text">Phone:</span>
                  <span className="text-accent">{userData.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-text">Address:</span>
                  <span className="text-text">{userData.address.line1}, {userData.address.line2}</span>
                </div>
              </div>
            </div>
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                </div>
                <h3 className="text-xl font-bold text-accent">Basic Information</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text">Gender:</span>
                  <span className="text-text">{userData.gender}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text">Blood Group:</span>
                  <span className="text-text">{userData.bloodGroup || 'Not Selected'}</span>
                                        </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text">Date of Birth:</span>
                  <span className="text-text">{userData.dob}</span>
                                </div>
                            </div>
                        </div>
                        {/* Age Information */}
                        {ageData && (
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-primary">Age Information</h3>
                                </div>
                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/10">
                                        <div className="text-2xl font-bold text-primary">{ageData.years}</div>
                                        <div className="text-sm text-text">Years</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-accent/5 to-primary/5 p-4 rounded-lg border border-accent/10">
                                        <div className="text-2xl font-bold text-accent">{ageData.months}</div>
                                        <div className="text-sm text-text">Months</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/10">
                                        <div className="text-2xl font-bold text-primary">{ageData.days}</div>
                                        <div className="text-sm text-text">Days</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-accent/5 to-primary/5 p-4 rounded-lg border border-accent/10">
                                        <div className="text-2xl font-bold text-accent">{ageData.totalDays.toLocaleString()}</div>
                                        <div className="text-sm text-text">Total Days</div>
                                    </div>
                                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-lg font-semibold text-primary">{ageData.totalHours.toLocaleString()}</div>
                                        <div className="text-sm text-text">Hours Lived</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-lg font-semibold text-accent">{ageData.totalMinutes.toLocaleString()}</div>
                                        <div className="text-sm text-text">Minutes Lived</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-lg font-semibold text-primary">{ageData.totalSeconds.toLocaleString()}</div>
                                        <div className="text-sm text-text">Seconds Lived</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{loaderStyle}</style>
        </div>
  ) : null;
};

export default MyProfile;