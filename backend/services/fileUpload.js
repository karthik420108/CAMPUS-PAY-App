// File Upload Service for Campus Pay App
// Supports local disk (dev) and Cloudinary (production) when configured

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const CONFIG = require('../config');
const cloudinary = require('cloudinary').v2;

class FileUploadService {
  constructor() {
    this.useCloudinary = Boolean(
      process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
    );

    if (this.useCloudinary && !process.env.CLOUDINARY_URL) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    }

    this.storage = this.useCloudinary ? multer.memoryStorage() : this.configureStorage();
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
        const role = this.resolveRole(req, file);
        console.log(`Multer destination - Role: ${role}, Field: ${file.fieldname}`);

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

  resolveRole(req, file) {
    let role = req.body?.role || req.query?.role || "uploads";

    if (!role || role === "uploads") {
      if (file?.fieldname === "kycImage") {
        role = "kyc";
      } else if (file?.fieldname === "profileImage") {
        role = "profileImage";
      } else if (file?.fieldname === "photo") {
        role = "photos";
      } else if (file?.fieldname === "screenshot") {
        role = "screenshots";
      }
    }

    return role || "uploads";
  }

  // Process file upload using local storage or Cloudinary
  async processFileUpload(req, res, options = {}) {
    try {
      if (!req.file) {
        throw new Error("File not uploaded");
      }

      const role = this.resolveRole(req, req.file);

      if (this.useCloudinary) {
        const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const uploadResult = await cloudinary.uploader.upload(fileBase64, {
          folder: `campus-pay/${role}`,
          resource_type: 'auto',
        });
        return uploadResult.secure_url;
      }

      const localFileUrl = this.getLocalFileUrl(`${role}/${req.file.filename}`);

      console.log(`File stored locally: ${localFileUrl}`);
      return localFileUrl;

    } catch (error) {
      console.error('Local file upload error:', error);
      throw error;
    }
  }

  // Get local file URL with cache-busting timestamp
  getLocalFileUrl(filePath) {
    const baseUrl = CONFIG.NODE_ENV === 'production'
      ? process.env.DEPLOYED_BASE_URL || 'http://localhost:5000'
      : `http://localhost:${CONFIG.PORT}`;

    const timestamp = Date.now();
    return `${baseUrl}/uploads/${filePath}?t=${timestamp}`;
  }

  // Delete local file
  async deleteFile(fileUrl, options = {}) {
    try {
      if (this.useCloudinary) {
        return;
      }

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
