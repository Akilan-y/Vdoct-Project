import React, { useState, useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import MeetingInterface from './MeetingInterface';

const GoogleMeetButton = ({ appointmentId, appointment, isDoctor = false, onAppointmentUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const { backendUrl, adminToken } = useContext(AdminContext);
  const { doctorToken } = useContext(DoctorContext);
  const { userData } = useContext(AppContext);

  // Choose the correct token and header format
  const token = isDoctor ? doctorToken : adminToken;
  const headers = isDoctor 
    ? { 'Content-Type': 'application/json', 'dtoken': token }
    : { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const testServerConnectivity = async () => {
    try {
      console.log('=== TESTING SERVER CONNECTIVITY ===');
      console.log('Backend URL:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/health`, {
        method: 'GET'
      });

      console.log('Health check response status:', response.status);
      const data = await response.json();
      console.log('Health check response data:', data);

      if (data.success) {
        toast.success('Server is reachable!');
        return true;
      } else {
        toast.error('Server health check failed: ' + data.message);
        return false;
      }
    } catch (error) {
      console.error('Server connectivity test error:', error);
      toast.error('Server connectivity test failed: ' + error.message);
      return false;
    }
  };

  const testJWT = async () => {
    try {
      console.log('=== TESTING JWT FUNCTIONALITY ===');
      
      // First test server connectivity
      const serverOk = await testServerConnectivity();
      if (!serverOk) {
        console.log('Server connectivity test failed, skipping JWT test');
        return;
      }
      
      console.log('Headers:', headers);
      
      const response = await fetch(`${backendUrl}/api/google-meet/test-jwt`, {
        method: 'GET',
        headers
      });

      console.log('JWT Test response status:', response.status);
      console.log('JWT Test response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', contentType);
        const text = await response.text();
        console.error('Response text:', text.substring(0, 500));
        throw new Error(`Server returned non-JSON response: ${contentType}`);
      }
      
      const data = await response.json();
      console.log('JWT Test response data:', data);

      if (data.success) {
        toast.success('JWT verification successful!');
      } else {
        toast.error('JWT verification failed: ' + data.message);
      }
    } catch (error) {
      console.error('JWT Test error:', error);
      toast.error('JWT Test failed: ' + error.message);
    }
  };

  const handleJoinMeeting = async () => {
    setIsLoading(true);
    try {
      console.log('=== HANDLE JOIN MEETING CALLED ===');
      console.log('Is Doctor:', isDoctor);
      console.log('Doctor Token:', doctorToken ? doctorToken.substring(0, 20) + '...' : 'null');
      console.log('Admin Token:', adminToken ? adminToken.substring(0, 20) + '...' : 'null');
      console.log('Selected Token:', token ? token.substring(0, 20) + '...' : 'null');
      console.log('Headers:', headers);
      console.log('Appointment ID:', appointmentId);
      console.log('Backend URL:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/google-meet/join/${appointmentId}`, {
        method: 'POST',
        headers
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', contentType);
        const text = await response.text();
        console.error('Response text:', text.substring(0, 500));
        throw new Error(`Server returned non-JSON response: ${contentType}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        // Open built-in meeting interface instead of external Google Meet
        setShowMeeting(true);
        toast.success('Starting meeting...');
      } else {
        console.error('Join meeting failed:', data.message);
        toast.error(data.message || 'Failed to join meeting');
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error('Failed to join meeting: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorReady = async () => {
    setIsLoading(true);
    try {
      console.log('=== HANDLE DOCTOR READY CALLED ===');
      console.log('Appointment ID:', appointmentId);
      console.log('Headers:', headers);
      console.log('Backend URL:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/google-meet/ready/${appointmentId}`, {
        method: 'POST',
        headers
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

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
      <div className="flex gap-2">
        <button
          onClick={testServerConnectivity}
          className="flex items-center gap-1 bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          🧪 Test Server
        </button>
        <button
          onClick={testJWT}
          className="flex items-center gap-1 bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          🧪 Test JWT
        </button>
        <button
          onClick={handleJoinMeeting}
          disabled={isLoading}
          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              Joining...
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Join
            </>
          )}
        </button>
      </div>
    );
  }

  if (canSetReady()) {
    return (
      <button
        onClick={handleDoctorReady}
        disabled={isLoading}
        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
            Setting...
          </>
        ) : (
          <>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
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
      <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
        Waiting for doctor
      </div>
    );
  }

  if (!appointment?.payment) {
    return (
      <div className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
        Payment needed
      </div>
    );
  }

  if (appointment?.doctorReady) {
    return (
      <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
        Ready
      </div>
    );
  }

  return null;
};

export default GoogleMeetButton; 