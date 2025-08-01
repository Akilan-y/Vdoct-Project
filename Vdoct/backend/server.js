import express from "express"
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { createServer } from 'http'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import { configureCloudinaryStorage } from "./middleware/multer.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"
import paymentRouter from "./routes/paymentRoute.js"
import fs from 'fs'
import googleMeetRoute from './routes/googleMeetRoute.js';
import { createSignalingServer } from './signalingServer.js';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('DEBUG: CWD =', process.cwd());
console.log('DEBUG: .env exists =', fs.existsSync('.env'));
console.log('DEBUG: CLOUDINARY_URL =', process.env.CLOUDINARY_URL);
console.log('DEBUG: CLOUDINARY_CLOUD_NAME =', process.env.CLOUDINARY_CLOUD_NAME);
console.log('DEBUG: JWT_SECRET exists =', !!process.env.JWT_SECRET);
console.log('DEBUG: JWT_SECRET length =', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

// Set fallback environment variables
if (!process.env.JWT_SECRET) {
    console.log('WARNING: JWT_SECRET not found in environment, using fallback');
    process.env.JWT_SECRET = "mysecretkey12345678"
}

console.log('DEBUG: Final JWT_SECRET length =', process.env.JWT_SECRET.length);
console.log('DEBUG: JWT_SECRET first 10 chars =', process.env.JWT_SECRET.substring(0, 10) + '...');

if (!process.env.ADMIN_EMAIL) {
    process.env.ADMIN_EMAIL = "admin@vdoct.com"
}

if (!process.env.ADMIN_PASSWORD) {
    process.env.ADMIN_PASSWORD = "admin123"
}

// app config
const app = express()
const port = process.env.PORT || 4000

// Create HTTP server for WebSocket
const httpServer = createServer(app);

// Connect to database and Cloudinary
const startServer = async () => {
    try {
        await connectDB()
        await connectCloudinary()
        
        // Configure Cloudinary storage for multer
        configureCloudinaryStorage()
        
        // middleware
        app.use(express.json())

        // CORS configuration for production
        const corsOptions = {
          origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            
            const allowedOrigins = [
              process.env.FRONTEND_URL,
              process.env.ADMIN_URL,
              'http://localhost:5173',
              'http://localhost:5174',
              'http://localhost:3000',
              'http://localhost:4000'
            ].filter(Boolean); // Remove undefined values
            
            if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app') || origin.includes('onrender.com')) {
              callback(null, true);
            } else {
              console.log('CORS blocked origin:', origin);
              callback(new Error('Not allowed by CORS'));
            }
          },
          credentials: true,
          optionsSuccessStatus: 200
        }
        app.use(cors(corsOptions))
        // Cloudinary handles file serving, no need for local uploads route

        // api endpoints
        app.use('/api/user', userRouter)
        app.use('/api/doctor', doctorRouter)
        app.use('/api/admin', adminRouter)
        app.use('/api/payment', paymentRouter)
        app.use('/api/google-meet', googleMeetRoute);

        app.get("/", (req, res) => {
          res.send("API Working")
        });

        // Health check endpoint
        app.get("/health", (req, res) => {
          res.json({ 
            success: true, 
            message: "Server is running",
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
          });
        });

        // API health check
        app.get("/api/health", (req, res) => {
          res.json({ 
            success: true, 
            message: "API is working",
            timestamp: new Date().toISOString(),
            jwtSecretExists: !!process.env.JWT_SECRET,
            jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
          });
        });

        // 404 handler for API routes - return JSON instead of HTML
        app.use('/api/*', (req, res) => {
          console.log('404 - API route not found:', req.method, req.originalUrl);
          res.status(404).json({ 
            success: false, 
            message: 'API endpoint not found',
            path: req.originalUrl,
            method: req.method
          });
        });

        // Global error handler
        app.use((err, req, res, next) => {
          console.error('GLOBAL ERROR:', err);
          console.error('Request URL:', req.originalUrl);
          console.error('Request method:', req.method);
          console.error('Request headers:', req.headers);
          
          // Ensure we always return JSON
          res.status(500).json({ 
            success: false, 
            message: err.message, 
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            path: req.originalUrl,
            method: req.method
          });
        });

        // Create WebSocket signaling server
        const io = createSignalingServer(httpServer);
        console.log('WebSocket signaling server created');

        httpServer.listen(port, () => {
            console.log(`Server is running on port ${port}`)
            console.log(`WebSocket server is ready for WebRTC signaling`)
        })
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();