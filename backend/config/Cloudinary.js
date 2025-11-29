// config/cloudinary.js
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dmaql185u",
  api_key: process.env.CLOUDINARY_API_KEY || "266551636532388",
  api_secret: process.env.CLOUDINARY_API_SECRET || "7RVTKaqUhseVEuD6fk_hcOc5Vrk",
});

module.exports = cloudinary;
