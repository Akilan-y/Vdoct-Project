import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import MeetingInterface from '../components/MeetingInterface';

const Meet = () => {
  const { backendUrl, token, slotDateFormat } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMeeting, setShowMeeting] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAppointments();
  }, [token, navigate]);

  // Hide footer when meeting is active
  useEffect(() => {
    if (showMeeting) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('meeting-active');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('meeting-active');
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('meeting-active');
    };
  }, [showMeeting]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token }
      });
      
      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        toast.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = (appointment) => {
    setSelectedAppointment(appointment);
    setShowMeeting(true);
  };

  const handleCloseMeeting = () => {
    setShowMeeting(false);
    setSelectedAppointment(null);
  };

  const isMeetingTime = (appointment) => {
    if (!appointment?.slotDate || !appointment?.slotTime) return false;
    
    const now = new Date();
    let meetingTime;
    
    try {
      if (typeof appointment.slotDate === 'number') {
        meetingTime = new Date(appointment.slotDate);
      } else {
        let dateStr = appointment.slotDate;
        if (dateStr.includes('_')) {
          const parts = dateStr.split('_');
          if (parts.length === 3) {
            dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
        const timeStr = appointment.slotTime || '00:00';
        const fullDateTimeStr = `${dateStr}T${timeStr}:00`;
        meetingTime = new Date(fullDateTimeStr);
      }
      
      if (isNaN(meetingTime.getTime())) {
        return false;
      }
      
      const timeDiff = Math.abs(now - meetingTime) / (1000 * 60);
      return timeDiff <= 15;
    } catch (error) {
      return false;
    }
  };

  const getUpcomingMeetings = () => {
    return appointments.filter(appointment => 
      appointment.meetLink && 
      !appointment.cancelled && 
      !appointment.isCompleted &&
      appointment.doctorReady &&
      appointment.payment
    );
  };

  const getScheduledMeetings = () => {
    return appointments.filter(appointment => 
      appointment.meetLink && 
      !appointment.cancelled && 
      !appointment.isCompleted &&
      !appointment.doctorReady &&
      appointment.payment
    );
  };

  const upcomingMeetings = getUpcomingMeetings();
  const scheduledMeetings = getScheduledMeetings();

  if (showMeeting && selectedAppointment) {
    console.log('Rendering MeetingInterface with appointment:', selectedAppointment);
    return (
      <MeetingInterface 
        appointment={selectedAppointment}
        onClose={handleCloseMeeting}
        isDoctor={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Video Consultations</h1>
          <p className="mt-2 text-gray-600">
            Connect with your doctors through secure video consultations
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Available Now */}
            {upcomingMeetings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Now</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingMeetings.map((appointment) => (
                    <div key={appointment._id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Dr. {appointment.docData?.name}
                          </h3>
                          <p className="text-sm text-gray-600">{appointment.docData?.speciality}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Available Now
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {slotDateFormat(appointment.slotDate)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {appointment.slotTime}
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinMeeting(appointment)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Join Meeting
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scheduled Meetings */}
            {scheduledMeetings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Scheduled Meetings</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {scheduledMeetings.map((appointment) => (
                    <div key={appointment._id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Dr. {appointment.docData?.name}
                          </h3>
                          <p className="text-sm text-gray-600">{appointment.docData?.speciality}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Scheduled
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {slotDateFormat(appointment.slotDate)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {appointment.slotTime}
                        </div>
                      </div>

                      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                        {appointment.doctorReady 
                          ? "Doctor is ready! You can join the meeting anytime."
                          : "Waiting for doctor to be ready..."
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Meetings */}
            {upcomingMeetings.length === 0 && scheduledMeetings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📹</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Video Consultations</h3>
                <p className="text-gray-600 mb-6">
                  You don't have any scheduled video consultations at the moment.
                </p>
                <a
                  href="/doctors"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Book a Consultation
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Meet; 