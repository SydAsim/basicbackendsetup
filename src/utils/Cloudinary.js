import {v2 as cloudinary} from "cloudinary"
import fs from 'fs'

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if (!localFilePath)  return null ;
        
        //upload file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
             resource_type : "auto"
        })

        //file has been uloaded successfully
        // console.log("✅ File has uploaded on Cloudinary",
        //     response.url);

        fs.unlinkSync(localFilePath)
        return response;
        
    } catch (error) {

    // console.error("❌ Cloudinary upload failed:", error);
    fs.unlinkSync(localFilePath);
    return null;  // so controller knows it failed
        // console.error("❌ Cloudinary upload failed:", error);
        // fs.unlinkSync(localFilePath) // remove the locally saved temp saved file 
        // // as the upload operation got failed 
        
        
    }
}

export {uploadOnCloudinary}


// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;

//     // Upload file to Cloudinary
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });

//     console.log("✅ File uploaded on Cloudinary:", response.secure_url);

//     // remove temp file after successful upload
//     fs.unlinkSync(localFilePath);

//     return response;
//   } catch (error) {
//     console.error("❌ Cloudinary upload failed:", error);
//     // remove temp file if upload failed
//     if (fs.existsSync(localFilePath)) {
//       fs.unlinkSync(localFilePath);
//     }
//     return null;
//   }
// };
