// API Configuration for Campus Pay App
// This file centralizes all API endpoints and configuration

const API_CONFIG = {
  // Backend API base URL - will be set from environment variable
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/login',
    REGISTER: '/register',
    SEND_OTP: '/send-otp',
    VERIFY_OTP: '/verify-both-otp',
    RESEND_OTP: '/resend-otp',
    FORGOT_OTP: '/forgot-otp',
    
    // User Management
    USER_PROFILE: '/usere/profile',
    USER_STATUS: '/user',
    
    // Transactions
    TRANSACTIONS: '/transactions',
    VENDOR_CREATE_QR: '/vendor/create-qr',
    VENDOR_DETAILS: '/vendor',
    
    // File Uploads
    UPLOAD: '/upload',
    UPLOAD_SUBADMIN: '/upload/subadmin',
    UPLOAD_SCREENSHOT: '/c-screenshot',
    
    // OTP and MPIN Reset
    SEND_OTP: '/send-otp',
    VERIFY_OTP: '/verify-both-otp',
    RESEND_OTP: '/resend-otp',
    FORGOT_OTP: '/forgot-otp',
    
    // MPIN Reset Endpoints
    SEND_MPIN_OTP: '/send-mpin-otp',
    VERIFY_MPIN_OTP: '/verify-mpin-otp',
    RESEND_MPIN_OTP: '/resend-mpin-otp',
    
    // Complaints
    COMPLAINTS: '/complaints',
    C_SCREENSHOT: '/c-screenshot',
    
    // KYC
    UPLOAD_KYC: '/upload-kyc',
    
    // Admin
    ADD_INSTITUTE_FUNDS: '/add-institute-funds',
    
    // Redeem
    REDEEM_HISTORY: '/redeem/history',
  },
  
  // Helper method to get full URL for any endpoint
  getUrl: function(endpoint) {
    const fullUrl = `${this.BASE_URL}${endpoint}`;
    console.log('🔗 API URL:', fullUrl, 'BASE_URL:', this.BASE_URL);
    return fullUrl;
  },
  
  // Helper method to get URL with parameters
  getUrlWithParams: function(endpoint, params) {
    let url = `${this.BASE_URL}${endpoint}`;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }
    return url;
  }
};

export default API_CONFIG;
