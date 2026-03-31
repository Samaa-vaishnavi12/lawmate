import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/legal-search';

// Connection event listeners
mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err.message);
});
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  Mongoose disconnected from MongoDB');
});

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // 10 second timeout
            socketTimeoutMS: 45000,
        });
        console.log(`🍃 MongoDB Connected: ${conn.connection.host} | DB: ${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.error('👉 Make sure MongoDB is running: run  net start MongoDB  in Command Prompt');
        process.exit(1);
    }
};

export default connectDB;
