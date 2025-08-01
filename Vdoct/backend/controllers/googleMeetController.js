import { google } from 'googleapis';
import { oauth2Client, calendar, googleMeetConfig } from '../config/googleMeet.js';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';

// Generate Google Meet link for an appointment
const generateMeetLink = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    // Find the appointment
    const appointment = await appointmentModel.findById(appointmentId)
      .populate('userData', 'name email')
      .populate('docData', 'name email');
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check if meeting link already exists
    if (appointment.meetLink) {
      return res.status(400).json({ 
        success: false, 
        message: 'Meeting link already exists for this appointment' 
      });
    }

    // Parse and format the date properly
    let meetingDateTime;
    try {
      // Check if slotDate is a timestamp (number) or date string
      if (typeof appointment.slotDate === 'number') {
        // If it's a timestamp, convert to Date object
        meetingDateTime = new Date(appointment.slotDate);
      } else {
        // If it's a string, try to parse it
        // Assuming slotDate is in format like "2025-01-30" or "30_01_2025"
        let dateStr = appointment.slotDate;
        
        // If it's in format "30_01_2025", convert to "2025-01-30"
        if (dateStr.includes('_')) {
          const parts = dateStr.split('_');
          if (parts.length === 3) {
            // Format: DD_MM_YYYY -> YYYY-MM-DD
            dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
        
        // Create the full datetime string
        const timeStr = appointment.slotTime || '00:00';
        const fullDateTimeStr = `${dateStr}T${timeStr}:00`;
        meetingDateTime = new Date(fullDateTimeStr);
      }
      
      // Validate the date
      if (isNaN(meetingDateTime.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch (dateError) {
      console.error('Date parsing error:', dateError);
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment date/time format',
        error: dateError.message
      });
    }

    // Create Google Meet event
    const event = {
      summary: `Medical Consultation - ${appointment.docData.name} & ${appointment.userData.name}`,
      description: `Virtual consultation appointment between Dr. ${appointment.docData.name} and ${appointment.userData.name}`,
      start: {
        dateTime: meetingDateTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: new Date(meetingDateTime.getTime() + (30 * 60 * 1000)).toISOString(), // 30 minutes duration
        timeZone: 'Asia/Kolkata',
      },
      attendees: [
        { email: appointment.userData.email },
        { email: appointment.docData.email }
      ],
      conferenceData: {
        createRequest: {
          requestId: `meet-${appointmentId}-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    };

    // Insert the event into Google Calendar
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });

    const meetLink = response.data.conferenceData.entryPoints[0].uri;
    
    // Update appointment with meet link
    appointment.meetLink = meetLink;
    appointment.meetingId = response.data.id;
    await appointment.save();

    res.json({
      success: true,
      message: 'Google Meet link generated successfully',
      data: {
        meetLink,
        meetingId: response.data.id,
        startTime: response.data.start.dateTime,
        endTime: response.data.end.dateTime
      }
    });

  } catch (error) {
    console.error('Error generating meet link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate meeting link',
      error: error.message
    });
  }
};

// Doctor ready for meeting
const doctorReady = async (req, res) => {
  try {
    console.log('=== DOCTOR READY FUNCTION CALLED ===');
    console.log('Appointment ID:', req.params.appointmentId);
    console.log('User:', req.user);
    
    const { appointmentId } = req.params;
    
    const appointment = await appointmentModel.findById(appointmentId)
      .populate('userData', 'name email')
      .populate('docData', 'name email');
    
    console.log('Found appointment:', appointment ? 'yes' : 'no');
    
    if (!appointment) {
      console.log('Appointment not found');
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    console.log('Appointment details:', {
      payment: appointment.payment,
      cancelled: appointment.cancelled,
      isCompleted: appointment.isCompleted,
      doctorReady: appointment.doctorReady,
      meetLink: appointment.meetLink,
      slotDate: appointment.slotDate,
      slotTime: appointment.slotTime,
      userData: appointment.userData,
      docData: appointment.docData
    });

    // If no meeting link exists, create a simple one
    if (!appointment.meetLink) {
      console.log('No meeting link exists, creating simple meeting link');
      const meetingId = `meet-${appointmentId}-${Date.now()}`;
      const meetLink = `https://meet.google.com/${meetingId}`;
      
      // Update appointment with meeting link
      appointment.meetLink = meetLink;
      appointment.meetingId = meetingId;
    }

    console.log('Updating doctor ready status...');
    // Update doctor ready status
    appointment.doctorReady = true;
    appointment.meetingStatus = 'scheduled';
    await appointment.save();

    console.log('Doctor ready status updated successfully');

    res.json({
      success: true,
      message: 'Doctor is ready for the meeting',
      data: {
        doctorReady: true,
        meetingStatus: 'scheduled',
        meetLink: appointment.meetLink,
        meetingId: appointment.meetingId
      }
    });

  } catch (error) {
    console.error('Error setting doctor ready:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set doctor ready status',
      error: error.message
    });
  }
};

// Start meeting
const startMeeting = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await appointmentModel.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Update meeting status
    appointment.meetingStarted = true;
    appointment.meetingStartTime = new Date();
    appointment.meetingStatus = 'in-progress';
    await appointment.save();

    res.json({
      success: true,
      message: 'Meeting started successfully',
      data: {
        meetingStarted: true,
        meetingStartTime: appointment.meetingStartTime,
        meetingStatus: 'in-progress'
      }
    });

  } catch (error) {
    console.error('Error starting meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start meeting',
      error: error.message
    });
  }
};

// End meeting
const endMeeting = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await appointmentModel.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Update meeting status
    appointment.meetingStarted = false;
    appointment.meetingEndTime = new Date();
    appointment.meetingStatus = 'completed';
    appointment.isCompleted = true;
    await appointment.save();

    res.json({
      success: true,
      message: 'Meeting ended successfully',
      data: {
        meetingEnded: true,
        meetingEndTime: appointment.meetingEndTime,
        meetingStatus: 'completed'
      }
    });

  } catch (error) {
    console.error('Error ending meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end meeting',
      error: error.message
    });
  }
};

// Get meeting details
const getMeetingDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await appointmentModel.findById(appointmentId)
      .populate('userData', 'name email')
      .populate('docData', 'name email');
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (!appointment.meetLink) {
      return res.status(404).json({ success: false, message: 'No meeting link found for this appointment' });
    }

    res.json({
      success: true,
      data: {
        meetLink: appointment.meetLink,
        meetingId: appointment.meetingId,
        appointmentDate: appointment.slotDate,
        appointmentTime: appointment.slotTime,
        doctorName: appointment.docData.name,
        patientName: appointment.userData.name,
        status: appointment.status,
        doctorReady: appointment.doctorReady,
        meetingStarted: appointment.meetingStarted,
        meetingStatus: appointment.meetingStatus
      }
    });

  } catch (error) {
    console.error('Error getting meeting details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get meeting details',
      error: error.message
    });
  }
};

// Join meeting
const joinMeeting = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    // Get user ID from authenticated user (set by middleware)
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    const appointment = await appointmentModel.findById(appointmentId)
      .populate('userData', 'name email')
      .populate('docData', 'name email');
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (!appointment.meetLink) {
      return res.status(404).json({ success: false, message: 'No meeting link found for this appointment' });
    }

    // Check if user is authorized to join this meeting
    if (appointment.userData._id.toString() !== userId && 
        appointment.docData._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to join this meeting' });
    }

    // Check if doctor is ready (for patients)
    if (appointment.userData._id.toString() === userId && !appointment.doctorReady) {
      return res.status(400).json({ 
        success: false, 
        message: 'Doctor is not ready yet. Please wait for the doctor to join.' 
      });
    }

    // Check if it's meeting time (within 15 minutes of scheduled time)
    const now = new Date();
    let meetingTime;
    
    try {
      // Parse the meeting time similar to generateMeetLink
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
    } catch (dateError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment date/time format'
      });
    }
    
    const timeDiff = Math.abs(now - meetingTime) / (1000 * 60); // Difference in minutes
    
    if (timeDiff > 15) {
      return res.status(400).json({ 
        success: false, 
        message: 'Meeting is only available 15 minutes before and after the scheduled time' 
      });
    }

    res.json({
      success: true,
      message: 'Meeting link retrieved successfully',
      data: {
        meetLink: appointment.meetLink,
        meetingId: appointment.meetingId,
        appointmentDate: appointment.slotDate,
        appointmentTime: appointment.slotTime,
        doctorName: appointment.docData.name,
        patientName: appointment.userData.name,
        doctorReady: appointment.doctorReady,
        meetingStarted: appointment.meetingStarted,
        meetingStatus: appointment.meetingStatus
      }
    });

  } catch (error) {
    console.error('Error joining meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join meeting',
      error: error.message
    });
  }
};

// Cancel meeting
const cancelMeeting = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await appointmentModel.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (!appointment.meetingId) {
      return res.status(404).json({ success: false, message: 'No meeting found for this appointment' });
    }

    // Delete the event from Google Calendar
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: appointment.meetingId
    });

    // Update appointment
    appointment.meetLink = null;
    appointment.meetingId = null;
    appointment.doctorReady = false;
    appointment.meetingStarted = false;
    appointment.meetingStatus = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Meeting cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel meeting',
      error: error.message
    });
  }
};

export {
  generateMeetLink,
  doctorReady,
  startMeeting,
  endMeeting,
  getMeetingDetails,
  joinMeeting,
  cancelMeeting
}; 