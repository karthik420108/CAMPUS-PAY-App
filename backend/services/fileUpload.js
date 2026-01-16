// Local File Upload Service for Campus Pay App
// This service handles file uploads using local storage only

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const CONFIG = require('../config');

class FileUploadService {
  constructor() {
    this.storage = this.configureStorage();
    this.upload = multer({ 
      storage: this.storage,
      limits: {
        fileSize: CONFIG.UPLOAD.MAX_FILE_SIZE
      },
      fileFilter: this.fileFilter.bind(this)
    });
  }

  // Configure multer storage for local files
  configureStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        // Try to get role from body, but have fallbacks
        let role = req.body?.role || req.query?.role || "uploads";
        
        // If no role, try to determine from field name
        if (!role || role === "uploads") {
          if (file.fieldname === "kycImage") {
            role = "kyc";
          } else if (file.fieldname === "profileImage") {
            role = "profileImage";
          } else if (file.fieldname === "photo") {
            role = "photos";
          } else if (file.fieldname === "screenshot") {
            role = "screenshots";
          }
        }
        
        console.log(`📁 Multer destination - Role: ${role}, Field: ${file.fieldname}`);

        const uploadPath = path.join(CONFIG.UPLOAD.DIR, role);
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName);
      }
    });
  }

  // File filter for allowed types
  fileFilter(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'), false);
    }
  }

  // Process file upload using local storage only
  async processFileUpload(req, res, options = {}) {
    try {
      const { role } = req.body;
      
      if (!req.file) {
        throw new Error("File not uploaded");
      }

      // Use local storage only
      const localFileUrl = this.getLocalFileUrl(`${role}/${req.file.filename}`);
      
      console.log(`File stored locally: ${localFileUrl}`);
      return localFileUrl;
      
    } catch (error) {
      console.error('Local file upload error:', error);
      throw error;
    }
  }

  // Get local file URL
  getLocalFileUrl(filePath) {
    const baseUrl = CONFIG.NODE_ENV === 'production' 
      ? process.env.DEPLOYED_BASE_URL || 'http://localhost:5000'
      : `http://localhost:${CONFIG.PORT}`;
    return `${baseUrl}/uploads/${filePath}`;
  }

  // Delete local file
  async deleteFile(fileUrl, options = {}) {
    try {
      // Delete local file
      const filePath = fileUrl.replace(/.*\/uploads\//, '');
      const fullPath = path.join(CONFIG.UPLOAD.DIR, filePath);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted local file: ${fullPath}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Get upload middleware for specific routes
  getUploadMiddleware(fieldName = 'file', options = {}) {
    return this.upload.single(fieldName);
  }
}

// Create singleton instance
const fileUploadService = new FileUploadService();

module.exports = fileUploadService;
