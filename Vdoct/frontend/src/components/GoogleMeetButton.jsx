import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import MeetingInterface from './MeetingInterface';

const GoogleMeetButton = ({ appointmentId, appointment, isDoctor = false, onAppointmentUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const { backendUrl, token, userData } = useContext(AppContext);

  const handleJoinMeeting = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/google-meet/join/${appointmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token  // Changed from 'Authorization': `Bearer ${token}` to 'token': token
        },
        body: JSON.stringify({
          userId: userData._id
        })
      });

      const data = await response.json();

      if (data.success) {
        // Open built-in meeting interface instead of external Google Meet
        setShowMeeting(true);
        toast.success('Starting meeting...');
      } else {
        toast.error(data.message || 'Failed to join meeting');
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast.error('Failed to join meeting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorReady = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/google-meet/ready/${appointmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('You are now ready for the meeting!');
        // Call the callback to refresh appointment data
        if (onAppointmentUpdate) {
          onAppointmentUpdate();
        } else {
          // Fallback: reload the page
          window.location.reload();
        }
      } else {
        toast.error(data.message || 'Failed to set ready status');
      }
    } catch (error) {
      console.error('Error setting ready status:', error);
      toast.error('Failed to set ready status');
    } finally {
      setIsLoading(false);
    }
  };

  const isMeetingTime = () => {
    if (!appointment?.slotDate || !appointment?.slotTime) return false;
    
    const now = new Date();
    let meetingTime;
    
    try {
      // Parse the meeting time
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
      
      const timeDiff = Math.abs(now - meetingTime) / (1000 * 60); // Difference in minutes
      return timeDiff <= 15; // Within 15 minutes
    } catch (error) {
      console.error('Error parsing meeting time:', error);
      return false;
    }
  };

  const canJoinMeeting = () => {
    return appointment?.meetLink && 
           appointment?.payment && 
           !appointment?.cancelled && 
           !appointment?.isCompleted &&
           (isDoctor || appointment?.doctorReady);
  };

  const canSetReady = () => {
    return isDoctor && 
           appointment?.payment && 
           !appointment?.doctorReady && 
           !appointment?.cancelled &&
           !appointment?.isCompleted;
  };

  const handleCloseMeeting = () => {
    setShowMeeting(false);
  };

  if (showMeeting) {
    return (
      <MeetingInterface 
        appointment={appointment}
        onClose={handleCloseMeeting}
        isDoctor={isDoctor}
      />
    );
  }

  if (canJoinMeeting()) {
    return (
      <button
        onClick={handleJoinMeeting}
        disabled={isLoading}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Joining...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Join Meeting
          </>
        )}
      </button>
    );
  }

  if (canSetReady()) {
    return (
      <button
        onClick={handleDoctorReady}
        disabled={isLoading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Setting Ready...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Ready
          </>
        )}
      </button>
    );
  }

  if (appointment?.meetLink && appointment?.payment && !appointment?.doctorReady && !isDoctor) {
    return (
      <div className="text-sm text-blue-600 bg-blue-100 px-3 py-2 rounded-lg">
        Waiting for doctor to be ready...
      </div>
    );
  }

  if (appointment?.cancelled) {
    return (
      <div className="text-sm text-red-600 bg-red-100 px-3 py-2 rounded-lg">
        Appointment Cancelled
      </div>
    );
  }

  if (appointment?.isCompleted) {
    return (
      <div className="text-sm text-green-600 bg-green-100 px-3 py-2 rounded-lg">
        Appointment Completed
      </div>
    );
  }

  if (!appointment?.payment) {
    return (
      <div className="text-sm text-yellow-600 bg-yellow-100 px-3 py-2 rounded-lg">
        Payment Required
      </div>
    );
  }

  if (appointment?.doctorReady) {
    return (
      <div className="text-sm text-green-600 bg-green-100 px-3 py-2 rounded-lg">
        Ready
      </div>
    );
  }

  return null;
};

export default GoogleMeetButton; 