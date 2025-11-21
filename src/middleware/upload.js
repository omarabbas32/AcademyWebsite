const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Configure multer to use memory storage
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Middleware to upload to Cloudinary after multer processes the file
const uploadToCloudinary = (req, res, next) => {
  if (req.file) {
    try {
      // Convert buffer to data URI for Cloudinary
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'team-members',
            transformation: [
              { width: 500, height: 500, crop: 'limit' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        // Handle stream errors
        stream.on('error', (error) => {
          reject(error);
        });

        // Pipe the buffer to the stream
        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(stream);
      });

      uploadPromise
        .then((result) => {
          // Store Cloudinary URL in req.file.path
          req.file.path = result.secure_url;
          req.file.cloudinaryId = result.public_id;
          next();
        })
        .catch((error) => {
          console.error('Cloudinary upload error:', error);
          if (!res.headersSent) {
            return res.status(500).json({ 
              message: 'Image upload to Cloudinary failed', 
              error: error.message 
            });
          }
        });
    } catch (error) {
      console.error('Upload middleware error:', error);
      if (!res.headersSent) {
        return res.status(500).json({ 
          message: 'Image upload failed', 
          error: error.message 
        });
      }
    }
  } else {
    next();
  }
};

module.exports = { upload, uploadToCloudinary, handleMulterError };

