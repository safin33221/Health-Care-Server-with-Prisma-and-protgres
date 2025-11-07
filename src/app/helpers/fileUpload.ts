import multer from 'multer'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary';
import config from '../../config';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), "/uploads"))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage: storage })

const uploadCloudinary = async (file: Express.Multer.File) => {
    // Configuration
    cloudinary.config({
        cloud_name: config.cloud_name,
        api_key: config.api_key,
        api_secret: config.api_secret // Click 'View API Keys' above to copy your API secret
    });


    // Upload an image
    const uploadResult = await cloudinary.uploader
        .upload(
            file.path, {
            public_id: file.filename,
        }
        )
        .catch((error) => {
            console.log(error);
        });

    return uploadResult
}





export const fileUploader = {
    upload,
    uploadCloudinary
}