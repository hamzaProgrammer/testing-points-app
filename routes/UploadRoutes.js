const multer = require("multer")
const path = require('path');
const express = require('express');
const router = express.Router();
const { verifyAccessToken, verifyUserToken } = require("../middlewares/auth")
const { uploadFile } = require("../controllers/UploadControllers")

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './tmp/'); // Destination folder where files will be stored
    },
    filename: (req, file, callback) => {
        // Generate a unique filename (you can use a UUID library for more uniqueness)
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        callback(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });


// upload/update image in any collection
router.post('/api/v1/:token/uploadFiles/:collectionName/:id', verifyAccessToken, verifyUserToken, upload.single('file'), uploadFile)


module.exports = router;