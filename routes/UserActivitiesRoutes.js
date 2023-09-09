const express = require('express');
const router = express.Router();
const { verifyAccessToken, verifyUserToken } = require("../middlewares/auth")
const {
    getAllUserActivitiesOfUser
} = require('../controllers/UserActivitiesControllers')

// get user activities of any user
router.get('/api/v1/:token/userActivities/:userId', verifyAccessToken, verifyUserToken, getAllUserActivitiesOfUser)



module.exports = router;