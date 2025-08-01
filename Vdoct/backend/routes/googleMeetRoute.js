import express from 'express';
import { 
  generateMeetLink, 
  doctorReady, 
  startMeeting, 
  endMeeting, 
  getMeetingDetails, 
  joinMeeting, 
  cancelMeeting 
} from '../controllers/googleMeetController.js';
import authAdminOrDoctor from '../middleware/authAdminOrDoctor.js';
import authUser from '../middleware/authUser.js';
import { oauth2Client, googleMeetConfig } from '../config/googleMeet.js';
import jwt from 'jsonwebtoken';

const googleMeetRouter = express.Router();

// Custom middleware for join meeting that accepts both user and admin/doctor tokens
const authForJoinMeeting = async (req, res, next) => {
    console.log('=== authForJoinMeeting middleware called ===');
    console.log('Headers:', req.headers);
    
    // Check for admin token first (Authorization: Bearer <token>)
    const authHeader = req.headers['authorization'];
    let adminToken = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        adminToken = authHeader.substring(7);
    }
    
    // Check for doctor token (dtoken header)
    const doctorToken = req.headers['dtoken'];
    
    // Check for user token (token header)
    const userToken = req.headers['token'];
    
    console.log('Admin token found:', adminToken ? 'yes' : 'no');
    console.log('Doctor token found:', doctorToken ? 'yes' : 'no');
    console.log('User token found:', userToken ? 'yes' : 'no');
    
    if (!adminToken && !doctorToken && !userToken) {
        console.log('No tokens found in headers');
        return res.status(401).json({ success: false, message: 'Not Authorized Login Again' })
    }
    
    try {
        let token_decode;
        let userType;
        let tokenToVerify = null;
        
        if (adminToken) {
            // Try to verify as admin token
            console.log('Attempting to verify admin token...');
            tokenToVerify = adminToken;
            userType = 'admin';
        } else if (doctorToken) {
            // Try to verify as doctor token
            console.log('Attempting to verify doctor token...');
            tokenToVerify = doctorToken;
            userType = 'doctor';
        } else if (userToken) {
            // Try to verify as user token
            console.log('Attempting to verify user token...');
            tokenToVerify = userToken;
            userType = 'user';
        }
        
        if (!tokenToVerify) {
            console.log('No valid token to verify');
            return res.status(401).json({ success: false, message: 'Invalid token format' });
        }
        
        // Verify the token
        token_decode = jwt.verify(tokenToVerify, process.env.JWT_SECRET);
        console.log('Token verified successfully');
        console.log('Decoded token:', token_decode);
        
        if (!token_decode || !token_decode.id) {
            console.log('Token decoded but no id found:', token_decode);
            return res.status(401).json({ success: false, message: 'Invalid token structure' })
        }
        
        req.user = { id: token_decode.id, type: userType }
        console.log('Set req.user:', req.user);
        next()
    } catch (error) {
        console.log('JWT verification error:', error.message);
        console.log('JWT verification error details:', error);
        
        // Provide more specific error messages
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token format' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired' });
        } else if (error.name === 'NotBeforeError') {
            return res.status(401).json({ success: false, message: 'Token not active yet' });
        } else {
            return res.status(401).json({ success: false, message: 'Token verification failed' });
        }
    }
};

// Test endpoint to check configuration
googleMeetRouter.get('/test-config', (req, res) => {
  res.json({
    success: true,
    config: {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasRedirectUri: !!process.env.GOOGLE_REDIRECT_URI,
      clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not Set',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not Set',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'Default'
    }
  });
});

// Test endpoint to verify JWT functionality
googleMeetRouter.get('/test-jwt', authAdminOrDoctor, (req, res) => {
  res.json({
    success: true,
    message: 'JWT verification successful',
    user: req.user,
    jwtSecretExists: !!process.env.JWT_SECRET,
    jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
  });
});

// Generate meeting link (admin or doctor)
googleMeetRouter.post('/generate/:appointmentId', authAdminOrDoctor, generateMeetLink);

// Doctor ready for meeting
googleMeetRouter.post('/ready/:appointmentId', authAdminOrDoctor, doctorReady);

// Start meeting
googleMeetRouter.post('/start/:appointmentId', authAdminOrDoctor, startMeeting);

// End meeting
googleMeetRouter.post('/end/:appointmentId', authAdminOrDoctor, endMeeting);

// Get meeting details
googleMeetRouter.get('/details/:appointmentId', authUser, getMeetingDetails);

// Join meeting (admin, doctor, or user) - Updated to use custom middleware
googleMeetRouter.post('/join/:appointmentId', authForJoinMeeting, joinMeeting);

// Cancel meeting (admin or doctor)
googleMeetRouter.post('/cancel/:appointmentId', authAdminOrDoctor, cancelMeeting);

// OAuth routes
googleMeetRouter.get('/auth/google/url', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: googleMeetConfig.scopes,
  });
  res.json({ authUrl });
});

googleMeetRouter.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.json({ success: true, message: 'Authentication successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
});

export default googleMeetRouter; 