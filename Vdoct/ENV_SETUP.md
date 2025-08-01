# Environment Variables Setup for Google Meet API

## Step 1: Create .env file

Create a `.env` file in the `Vdoct/backend/` directory with the following content:

```env
# Google Meet API Configuration
# Get these from Google Cloud Console: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:4000/api/google-meet/auth/google/callback

# Other existing variables (if you have them)
JWT_SECRET=mysecretkey12345678
ADMIN_EMAIL=admin@vdoct.com
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# MongoDB URI (if you have one)
# MONGODB_URI=your_mongodb_uri_here

# Cloudinary URL (if you have one)
# CLOUDINARY_URL=your_cloudinary_url_here
```

## Step 2: Get Google API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - **Important**: Add this exact redirect URI: `http://localhost:4000/api/google-meet/auth/google/callback`
   - Download the JSON file
5. Copy the `client_id` and `client_secret` from the downloaded JSON file
6. Replace `your_google_client_id_here` and `your_google_client_secret_here` in your `.env` file

## Step 3: OAuth Flow Setup

The redirect URI `http://localhost:4000/api/google-meet/auth/google/callback` is correct and will:

1. **Receive the authorization code** from Google after user consent
2. **Exchange the code for access tokens** 
3. **Store tokens securely** (you should implement database storage for production)
4. **Return success response** with token information

## Step 4: Test the Setup

After setting up the `.env` file, run:

```bash
cd Vdoct
node test_google_meet_setup.js
```

You should see all green checkmarks if everything is set up correctly.

## Step 5: Start Your Server

```bash
cd Vdoct/backend
npm start
```

## Step 6: Test OAuth Flow

1. **Get Authorization URL:**
   ```bash
   curl http://localhost:4000/api/google-meet/auth/google/url
   ```

2. **Open the returned URL** in your browser to authorize the application

3. **You'll be redirected** to the callback URL with tokens

## Step 7: Test Google Meet Integration

1. Start your admin panel
2. Create an appointment
3. Use the "Generate" button to create a Google Meet link
4. Test joining the meeting

## Troubleshooting

- If you get "Invalid Credentials" error, check your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- If you get "Access Denied" error, add your email to test users in OAuth consent screen
- If you get "Calendar API not enabled" error, enable Google Calendar API in Google Cloud Console
- If you get "Redirect URI mismatch" error, make sure the URI in Google Cloud Console exactly matches: `http://localhost:4000/api/google-meet/auth/google/callback`

## Production Notes

For production deployment:
1. Update the redirect URI to your production domain
2. Implement secure token storage in database
3. Add proper error handling and logging
4. Set up token refresh mechanisms 