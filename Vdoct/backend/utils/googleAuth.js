import { oauth2Client, googleMeetConfig } from '../config/googleMeet.js';

// Generate authorization URL for OAuth flow
const generateAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: googleMeetConfig.scopes,
    prompt: 'consent' // Force consent screen to get refresh token
  });
};

// Exchange authorization code for tokens
const getTokensFromCode = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens from code:', error);
    throw error;
  }
};

// Set credentials from stored tokens
const setCredentials = (tokens) => {
  oauth2Client.setCredentials(tokens);
};

// Refresh access token using refresh token
const refreshAccessToken = async (refreshToken) => {
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
};

// Check if tokens are valid
const areTokensValid = (tokens) => {
  if (!tokens || !tokens.access_token) return false;
  
  // Check if token is expired (with 5 minute buffer)
  if (tokens.expiry_date && Date.now() > tokens.expiry_date - 300000) {
    return false;
  }
  
  return true;
};

export {
  generateAuthUrl,
  getTokensFromCode,
  setCredentials,
  refreshAccessToken,
  areTokensValid,
  oauth2Client
}; 