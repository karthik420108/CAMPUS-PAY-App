// Backend Configuration for Campus Pay App
// This file centralizes all backend configuration using environment variables

require('dotenv').config();

const CONFIG = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://root:123@campuspay.i8ucsny.mongodb.net/',
  
  // Email Configuration
  EMAIL: {
    SERVICE: process.env.EMAIL_SERVICE || 'gmail',
    USER: process.env.EMAIL_USER || 'campuspay0@gmail.com',
    PASS: process.env.EMAIL_PASS || 'jlvhymspuqdqhqxb'
  },
  
  // File Upload Configuration
  UPLOAD: {
    DIR: process.env.UPLOAD_DIR || './uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
  },
  
  // Security Configuration
  SECURITY: {
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    SESSION_SECRET: process.env.SESSION_SECRET || 'your_session_secret_key_here'
  },
  
  // CORS Configuration
  CORS: {
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
  },
  
  // Application Constants
  APP: {
    INSTITUTE_TOTAL_BALANCE: 100000,
    QR_EXPIRY_MINUTES: 5,
    OTP_EXPIRY_MINUTES: 5
  }
};

module.exports = CONFIG;
