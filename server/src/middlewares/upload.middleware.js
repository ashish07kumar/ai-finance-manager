const multer = require('multer');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const storage = multer.memoryStorage();

const allowedTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
]);

const upload = multer({
  storage,
  limits: { fileSize: env.receiptMaxFileSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) {
      return cb(new ApiError(400, 'Unsupported file type. Allowed: PNG, JPG, WEBP, PDF.'));
    }
    return cb(null, true);
  },
});

module.exports = { upload };
