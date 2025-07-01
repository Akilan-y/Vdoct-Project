import React, { useState, useEffect, useContext } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorSchedule = () => {
  const { backendUrl, doctorToken } = useContext(DoctorContext);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ date: '', startTime: '', endTime: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/schedule-session`, {
        headers: { dtoken: doctorToken }
      });
      if (data.success) {
        setSlots(data.slots);
      } else {
        toast.error(data.message || 'Failed to fetch slots');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch slots');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/schedule-session`,
        form,
        { headers: { dtoken: doctorToken } }
      );
      if (data.success) {
        toast.success('Slot added!');
        setForm({ date: '', startTime: '', endTime: '' });
        fetchSlots();
      } else {
        toast.error(data.message || 'Failed to add slot');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add slot');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/doctor/schedule-session/${id}`,
        { headers: { dtoken: doctorToken } }
      );
      if (data.success) {
        toast.success('Slot deleted');
        fetchSlots();
      } else {
        toast.error(data.message || 'Failed to delete slot');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete slot');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Manage Your Session Slots</h2>
      <form onSubmit={handleAddSlot} className="bg-white rounded-xl shadow p-6 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div className="text-right">
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {submitting ? 'Adding...' : 'Add Slot'}
          </button>
        </div>
      </form>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Your Slots</h3>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No slots added yet.</div>
        ) : (
          <ul className="divide-y">
            {slots.map(slot => (
              <li key={slot._id} className="flex items-center justify-between py-3">
                <div>
                  <span className="font-medium">{slot.date}</span> &nbsp;
                  <span className="text-gray-600">{slot.startTime} - {slot.endTime}</span>
                </div>
                <button onClick={() => handleDelete(slot._id)} className="text-red-600 hover:underline text-sm">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DoctorSchedule; 