// API Utility Functions for Campus Pay App
// This file provides centralized API calling functionality using axios

import axios from 'axios';
import API_CONFIG from '../config/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Methods for common endpoints
export const API = {
  // Authentication
  login: (data) => api.post(API_CONFIG.ENDPOINTS.LOGIN, data),
  register: (data) => api.post(API_CONFIG.ENDPOINTS.REGISTER, data),
  sendOtp: (data) => api.post(API_CONFIG.ENDPOINTS.SEND_OTP, data),
  verifyOtp: (data) => api.post(API_CONFIG.ENDPOINTS.VERIFY_OTP, data),
  resendOtp: (data) => api.post(API_CONFIG.ENDPOINTS.RESEND_OTP, data),
  forgotOtp: (data) => api.post(API_CONFIG.ENDPOINTS.FORGOT_OTP, data),
  
  // User Management
  getUserProfile: (vendorId) => api.post(API_CONFIG.ENDPOINTS.USER_PROFILE, { vendorId }),
  getUserStatus: (userId) => api.get(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.USER_STATUS}/${userId}`)),
  
  // Transactions
  getTransactions: (userId) => api.get(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.TRANSACTIONS}/${userId}`)),
  createVendorQR: (data) => api.post(API_CONFIG.ENDPOINTS.VENDOR_CREATE_QR, data),
  getVendorDetails: (vendorId) => api.get(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.VENDOR_DETAILS}/${vendorId}`)),
  
  // File Uploads (using FormData)
  uploadFile: (formData, onUploadProgress) => {
    return api.post(API_CONFIG.ENDPOINTS.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },
  
  uploadSubadminFile: (formData, onUploadProgress) => {
    return api.post(API_CONFIG.ENDPOINTS.UPLOAD_SUBADMIN, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },
  
  uploadScreenshot: (formData, onUploadProgress) => {
    return api.post(API_CONFIG.ENDPOINTS.UPLOAD_SCREENSHOT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },
  
  // Notifications
  getNotifications: (params) => api.get(API_CONFIG.getUrlWithParams(API_CONFIG.ENDPOINTS.NOTIFICATIONS, params)),
  getUserNotifications: (userId, params) => api.get(API_CONFIG.getUrlWithParams(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${userId}`, params)),
  markNotificationRead: (notificationId, data) => api.post(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`, data),
  
  // Admin
  getAdminNotifications: () => api.get(API_CONFIG.ENDPOINTS.ADMIN_NOTIFICATIONS),
  addAdminNotification: (data) => api.post(API_CONFIG.ENDPOINTS.ADMIN_ADD_NOTIFICATION, data),
  addInstituteFunds: (data) => api.post(API_CONFIG.ENDPOINTS.ADD_INSTITUTE_FUNDS, data),
  
  // Redeem
  getRedeemHistory: (userId) => api.get(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.REDEEM_HISTORY}/${userId}`)),
};

export default api;
