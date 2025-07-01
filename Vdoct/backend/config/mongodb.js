import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Use fallback if MONGODB_URI is not set
        const mongoURI = process.env.MONGODB_URI || "mongodb+srv://Akill:3ZKDb2QZL5vjK6Pq@cluster0.rat0lii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        
        mongoose.connection.on('connected', () => console.log("Database Connected"))
        mongoose.connection.on('error', (err) => console.log("Database Connection Error:", err))
        await mongoose.connect(`${mongoURI}/vdoct`)
    } catch (error) {
        console.log("MongoDB Connection Error:", error.message)
        process.exit(1)
    }
}

export default connectDB;

// Do not use '@' symbol in your databse user's password else it will show an error.