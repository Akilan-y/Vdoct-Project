import { google } from 'googleapis';

// Google Meet API configuration
const googleMeetConfig = {
  // You'll need to set these environment variables
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/google-meet/auth/google/callback',
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ]
};

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  googleMeetConfig.clientId,
  googleMeetConfig.clientSecret,
  googleMeetConfig.redirectUri
);

// Create Google Calendar API instance
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export {
  oauth2Client,
  calendar,
  googleMeetConfig
}; 