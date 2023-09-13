const express = require('express');
const router = express.Router();
const { verifyAccessToken, verifyUserToken } = require("../middlewares/auth")
const {
    updateReadByOfAnyNotification
} = require('../controllers/NotificationsController')

// update ready by of any notification
router.put('/api/v1/:token/notifications', verifyAccessToken, verifyUserToken, updateReadByOfAnyNotification)



module.exports = router;