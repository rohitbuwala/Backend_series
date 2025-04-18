import { v2 as cloudinary} from "cloudinary"; // khud ka name de sakte ho 
import fs from "fs"

  // Configuration

  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if(!localfilepath) return null 
        //upload the file on clondinary
         const response = await cloudinary.uploader.upload(localfilepath ,{
            resource_type: "auto"
        })
        // file has been uploaded successfully 
        console.log("file is uploaded on cloudinary", response.url)
        return response;

    } catch (error) {
        fs.unlinkSync(localfilepath) // remove the locally saved file as the upload opration got failed 
        return null
    }
}

export {uploadOnCloudinary}