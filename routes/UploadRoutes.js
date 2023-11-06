const multer = require("multer")
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const express = require('express');
const router = express.Router();
const { verifyAccessToken, verifyUserToken } = require("../middlewares/auth")
const { uploadFile } = require("../controllers/UploadControllers")
const { formatDateToCustomString } = require("../utils/utils")

// cloudinary.config({
//     cloud_name: 'hamza-store',
//     api_key: '555344286478932',
//     api_secret: 'e29ILHc_vrGqW0vER0gJEVi1ZVQ'
// });

// // Configure Multer to use Cloudinary as storage
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     folder: 'universex-images',
//     allowedFormats: ['jpg', 'png', 'jpeg', 'svg'],
// });

// const parser = multer({ storage: storage });

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads/'); // Destination folder where files will be stored
    },
    filename: (req, file, callback) => {
        // Generate a unique filename (you can use a UUID library for more uniqueness)
        // const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const uniqueSuffix = formatDateToCustomString(Date.now());
        callback(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });


// upload/update image in any collection
// router.post('/api/v1/:token/uploadFiles/:collectionName/:id', verifyAccessToken, verifyUserToken, parser.single('file'), uploadFile)
router.post('/api/v1/:token/uploadFiles/:collectionName/:id', verifyAccessToken, verifyUserToken, upload.single('file'), uploadFile)


module.exports = router;