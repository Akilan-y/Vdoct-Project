import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const SimpleMeetLink = ({ appointment }) => {
  const [meetLink, setMeetLink] = useState(appointment?.meetLink || '');
  const { backendUrl, token } = useContext(AppContext);

  const generateMeetLink = () => {
    // Generate a simple Google Meet link
    const meetId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const link = `https://meet.google.com/${meetId}`;
    setMeetLink(link);
    
    // Save to backend (optional)
    if (appointment?._id) {
      saveMeetLinkToBackend(link);
    }
    
    console.log('Generated Meet Link:', link);
  };

  const saveMeetLinkToBackend = async (link) => {
    try {
      const response = await fetch(`${backendUrl}/api/user/update-appointment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: appointment._id,
          meetLink: link
        })
      });

      if (response.ok) {
        toast.success('Meet link saved successfully!');
      }
    } catch (error) {
      console.error('Error saving meet link:', error);
      // Don't show error toast as this is optional
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetLink);
    toast.success('Meet link copied to clipboard!');
  };

  const joinMeeting = () => {
    window.open(meetLink, '_blank');
  };

  if (!meetLink) {
    return (
      <button
        onClick={generateMeetLink}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
        Generate Meet Link
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={meetLink}
          readOnly
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
        />
        <button
          onClick={copyToClipboard}
          className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
        >
          Copy
        </button>
      </div>
      <button
        onClick={joinMeeting}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
        Join Meeting
      </button>
    </div>
  );
};

export default SimpleMeetLink; 