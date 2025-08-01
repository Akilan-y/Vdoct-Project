# Google Meet API Setup Guide for Vdoct

## Prerequisites
- Google Cloud Console account
- Billing enabled on your Google Cloud project
- Node.js and npm installed

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project (required for API usage)

## Step 2: Enable Google Calendar API

1. In Google Cloud Console, go to **"APIs & Services" > "Library"**
2. Search for **"Google Calendar API"**
3. Click on it and press **"Enable"**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "OAuth 2.0 Client IDs"**
3. Choose **"Web application"** as application type
4. Add these **Authorized redirect URIs**:
   - `http://localhost:4000/auth/google/callback` (development)
   - `https://your-domain.com/auth/google/callback` (production)
5. Click **"Create"**
6. **Download the client configuration file** (JSON format)

## Step 4: Set up OAuth Consent Screen

1. Go to **"APIs & Services" > "OAuth consent screen"**
2. Choose **"External"** (unless using Google Workspace)
3. Fill in required information:
   - **App name**: "Vdoct"
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add these **scopes**:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
5. Add test users (your email and any other test emails)

## Step 5: Environment Variables

Add these to your `.env` file in the backend directory:

```env
# Google Meet API Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:4000/auth/google/callback

# Other existing variables...
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_uri
CLOUDINARY_URL=your_cloudinary_url
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

## Step 6: Install Dependencies

The `googleapis` package is already installed in your project.

## Step 7: Authentication Flow

### For Development/Testing:

1. **Get Authorization URL**:
   ```javascript
   const authUrl = oauth2Client.generateAuthUrl({
     access_type: 'offline',
     scope: googleMeetConfig.scopes
   });
   ```

2. **Exchange Code for Tokens**:
   ```javascript
   const { tokens } = await oauth2Client.getToken(code);
   oauth2Client.setCredentials(tokens);
   ```

3. **Store Tokens** (for production, store securely in database):
   ```javascript
   // Store refresh token securely
   const refreshToken = tokens.refresh_token;
   ```

### For Production:

You'll need to implement a proper OAuth flow:
1. Redirect users to Google's consent screen
2. Handle the callback with authorization code
3. Exchange code for access and refresh tokens
4. Store refresh token securely
5. Use refresh token to get new access tokens when needed

## Step 8: Testing the Integration

1. Start your backend server
2. Create an appointment
3. Use the admin panel to generate a Google Meet link
4. Test joining the meeting

## API Endpoints Available

- `POST /api/google-meet/generate/:appointmentId` - Generate meeting link (Admin/Doctor)
- `GET /api/google-meet/details/:appointmentId` - Get meeting details
- `POST /api/google-meet/join/:appointmentId` - Join meeting
- `DELETE /api/google-meet/cancel/:appointmentId` - Cancel meeting

## Troubleshooting

### Common Issues:

1. **"Invalid Credentials" Error**:
   - Check your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - Ensure OAuth consent screen is properly configured

2. **"Access Denied" Error**:
   - Add your email to test users in OAuth consent screen
   - Check if the required scopes are added

3. **"Calendar API not enabled" Error**:
   - Enable Google Calendar API in Google Cloud Console

4. **"Redirect URI mismatch" Error**:
   - Check that your redirect URI matches exactly in OAuth credentials

### Testing with Postman:

1. Set up OAuth 2.0 authentication in Postman
2. Use your Google Client ID and Secret
3. Test the endpoints with proper authorization

## Security Considerations

1. **Never commit credentials to version control**
2. **Use environment variables for all sensitive data**
3. **Implement proper token storage and refresh mechanisms**
4. **Add rate limiting to prevent abuse**
5. **Validate user permissions before allowing meeting access**

## Production Deployment

1. Update redirect URIs to your production domain
2. Set up proper environment variables on your hosting platform
3. Implement secure token storage (database, not file system)
4. Add monitoring and logging for API usage
5. Set up proper error handling and fallbacks 