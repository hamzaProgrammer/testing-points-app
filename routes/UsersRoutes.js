const express = require('express');
const router = express.Router();
const { verifyAccessToken, verifyUserToken, verifyIpAddress } = require("../middlewares/auth")
const {
    LogInUser,
    LogInSuperAdmin,
    signUpUser,
    sendMailForgetPassword,
    verifyOtp,
    getProfileInfo,
    getProfileInfoByAdmin,
    getDashoardData,
    getDashboardGraphData
} = require('../controllers/UsersControllers')

// Sign up user only
router.post('/api/v1/:token/users/signup', verifyAccessToken, verifyIpAddress, signUpUser)

// Sign in admin/user
router.post('/api/v1/:token/users/signin', verifyAccessToken, verifyIpAddress, LogInUser)

// forgot password
router.put('/api/v1/:token/users/forgotPassword', verifyAccessToken, verifyIpAddress, sendMailForgetPassword)

// verify OTP
router.post('/api/v1/:token/users/verifyOTP', verifyAccessToken, verifyIpAddress, verifyOtp)

// getting user profile info
router.get('/api/v1/:token/users/getUserProfileInfo', verifyAccessToken, verifyUserToken, verifyIpAddress, getProfileInfo)

// getting user profile info by admin
router.get('/api/v1/:token/users/getUserInfoByAdmin/:userId', verifyAccessToken, verifyUserToken, verifyIpAddress, getProfileInfoByAdmin)

// Sign in super admin
router.post('/api/v1/users/superadmin/signin', verifyIpAddress, LogInSuperAdmin)

// get dashboard data
router.get('/api/v1/:token/users/getDashboardInfo', verifyAccessToken, verifyUserToken, verifyIpAddress, getDashoardData)

// get dashboard data
router.get('/api/v1/:token/users/getDashboardGraphData', verifyIpAddress, getDashboardGraphData)


module.exports = router;