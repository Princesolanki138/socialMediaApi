import { v2 as cloudinary } from "cloudinary";

import fs from "fs";


// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dbhsrtwax',
  api_key: '193146164521743',
  api_secret: '8lTTckuMO5d7u8yQbsp5W2iOZxQ'
});

export const uploadFile = async (localFilePath) => {
  try {
    if (!localFilePath) return null

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("file is uploaded on cloudinery", response.url)



    return response
  } catch (error) {
    console.log("Error while uploading file:", error);

    fs.unlinkSync(localFilePath);

    return null;
  }
};

export default uploadFile;
