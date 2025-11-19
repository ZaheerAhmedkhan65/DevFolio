const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'profiles') => {
  try {
    const isGif = filePath.toLowerCase().endsWith('.gif');

    const uploadOptions = {
      folder,
      resource_type: isGif ? "auto" : "image"   // <-- IMPORTANT FIX
    };

    // Apply transformations ONLY if NOT GIF
    if (!isGif) {
      uploadOptions.quality = "auto:best";
      uploadOptions.fetch_format = "auto";      // <-- FIXED TYPO
    }

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    fs.unlinkSync(filePath);
    return result;

  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw error;
  }
};


// Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};