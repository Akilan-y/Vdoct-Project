import express from "express"
import cors from 'cors'
import 'dotenv/config'
import path from 'path'
import connectDB from "./config/mongodb.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"

// Set fallback environment variables
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "mysecretkey12345678"
}

if (!process.env.ADMIN_EMAIL) {
    process.env.ADMIN_EMAIL = "admin@vdoct.com"
}

if (!process.env.ADMIN_PASSWORD) {
    process.env.ADMIN_PASSWORD = "admin123"
}

// app config
const app = express()
const port = process.env.PORT || 4000

// Connect to database
connectDB()

// middleware
app.use(express.json())

// CORS configuration for production
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.ADMIN_URL || 'http://localhost:5174',
    'https://your-project.vercel.app',
    'https://your-project.vercel.app/admin'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
// Cloudinary handles file serving, no need for local uploads route

// api endpoints
app.use('/api/user', userRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/admin', adminRouter)

app.get("/", (req, res) => {
  res.send("API Working")
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})