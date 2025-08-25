import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (filePath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    if (!filePath) {
      return null;
    }
    const uploadResult = await cloudinary.uploader.upload(filePath);
    // Only delete if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return uploadResult.secure_url;
  } catch (error) {
    // Only try to delete if file exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}
    }
    console.log("Cloudinary upload error:", error.message, error);
    throw error;
  }
};
export default uploadOnCloudinary;
