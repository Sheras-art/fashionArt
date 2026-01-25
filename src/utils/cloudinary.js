import cloudinary from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload on cloudinary
    const response = await cloudinary.v2.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(`File Upload Successfully: ${response.url}`);
    fs.unlinkSync(localFilePath);
    return response;
  } 
  catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };