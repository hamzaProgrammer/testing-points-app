const express = require('express');
const router = express.Router();
const { verifyAccessToken, verifyUserToken } = require("../middlewares/auth")
const {
    LogInUser,
    LogInSuperAdmin,
    signUpUser,
    sendMailForgetPassword,
    verifyOtp,
    getProfileInfo,
    getProfileInfoByAdmin
} = require('../controllers/UsersControllers')

// Sign up user only
router.post('/api/v1/:token/users/signup', verifyAccessToken, signUpUser)

// Sign in admin/user
router.post('/api/v1/:token/users/signin', verifyAccessToken, LogInUser)

// forgot password
router.put('/api/v1/:token/users/forgotPassword', verifyAccessToken, sendMailForgetPassword)

// verify OTP
router.post('/api/v1/:token/users/verifyOTP', verifyAccessToken, verifyOtp)

// getting user profile info
router.get('/api/v1/:token/users/getUserProfileInfo', verifyAccessToken, verifyUserToken, getProfileInfo)

// getting user profile info by admin
router.get('/api/v1/:token/users/getUserInfoByAdmin/:userId', verifyAccessToken, verifyUserToken, getProfileInfoByAdmin)

// Sign in super admin
router.post('/api/v1/users/superadmin/signin', LogInSuperAdmin)

module.exports = router;