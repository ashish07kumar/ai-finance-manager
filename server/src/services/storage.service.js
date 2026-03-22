const streamifier = require('streamifier');
const { v2: cloudinary } = require('cloudinary');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

let configured = false;

function configureCloudinary() {
  if (configured) return;
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    return;
  }

  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });

  configured = true;
}

async function uploadReceipt(file, userId) {
  configureCloudinary();

  if (!configured) {
    throw new ApiError(503, 'Receipt storage is not configured. Set Cloudinary credentials.');
  }

  if (!file || !file.buffer) {
    throw new ApiError(400, 'Receipt file is required');
  }

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: `finance-tracker/${userId}/receipts`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          providerId: result.public_id,
          mimeType: file.mimetype,
          name: file.originalname,
          size: file.size,
        });
      }
    );

    streamifier.createReadStream(file.buffer).pipe(upload);
  });
}

module.exports = { uploadReceipt };
