import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { AdminContext } from '../../context/AdminContext';

const AddPatient = () => {
  const [image, setImage] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('Not Selected');
  const [dob, setDob] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');

  const { backendUrl } = useContext(AppContext);
  const { adminToken, getUsersData } = useContext(AdminContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (!name || !email || !password || !phone || !gender || !dob || !address1) {
        return toast.error('Please fill all required fields');
      }
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('phone', phone);
      formData.append('gender', gender);
      formData.append('dob', dob);
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }));
      if (image) formData.append('image', image);
      const { data } = await axios.post(backendUrl + '/api/admin/add-patient', formData, { headers: { atoken: adminToken } });
      if (data.success) {
        toast.success(data.message);
        await getUsersData();
        navigate('/patients-list');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
      console.log(error);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='m-5 w-full max-w-2xl mx-auto'>
      <p className='mb-3 text-lg font-medium'>Add Patient</p>
      <div className='bg-white px-8 py-8 border rounded w-full'>
        <div className='flex items-center gap-4 mb-8 text-gray-500'>
          <label htmlFor="patient-img">
            <img className='w-16 bg-gray-100 rounded-full cursor-pointer' src={image ? URL.createObjectURL(image) : 'https://ui-avatars.com/api/?name=Patient&background=random&size=128'} alt="" />
          </label>
          <input onChange={(e) => setImage(e.target.files[0])} type="file" id="patient-img" hidden accept="image/*" />
          <p>Upload patient <br /> picture</p>
        </div>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <p>Name</p>
            <input onChange={e => setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder='Name' required />
          </div>
          <div className='flex flex-col gap-1'>
            <p>Email</p>
            <input onChange={e => setEmail(e.target.value)} value={email} className='border rounded px-3 py-2' type="email" placeholder='Email' required />
          </div>
          <div className='flex flex-col gap-1'>
            <p>Password</p>
            <input onChange={e => setPassword(e.target.value)} value={password} className='border rounded px-3 py-2' type="password" placeholder='Set a password' required />
          </div>
          <div className='flex flex-col gap-1'>
            <p>Phone</p>
            <input onChange={e => setPhone(e.target.value)} value={phone} className='border rounded px-3 py-2' type="text" placeholder='Phone' required />
          </div>
          <div className='flex flex-col gap-1'>
            <p>Gender</p>
            <select onChange={e => setGender(e.target.value)} value={gender} className='border rounded px-2 py-2'>
              <option value="Not Selected">Not Selected</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className='flex flex-col gap-1'>
            <p>Date of Birth</p>
            <input onChange={e => setDob(e.target.value)} value={dob} className='border rounded px-3 py-2' type="date" required />
          </div>
          <div className='flex flex-col gap-1'>
            <p>Address</p>
            <input onChange={e => setAddress1(e.target.value)} value={address1} className='border rounded px-3 py-2' type="text" placeholder='Address 1' required />
            <input onChange={e => setAddress2(e.target.value)} value={address2} className='border rounded px-3 py-2' type="text" placeholder='Address 2' />
          </div>
        </div>
        <button type='submit' className='bg-primary px-10 py-3 mt-6 text-white rounded-full'>Add Patient</button>
      </div>
    </form>
  );
};

export default AddPatient; 