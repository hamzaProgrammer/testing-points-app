const Users = require('../models/UsersSchema')
const UserActivities = require('../models/UserActivitySchema')
const Activities = require('../models/ActivitySchema')
const UserPoints = require('../models/PointsSchema')
const Tokens = require('../models/TokensSchema')
const Points = require('../models/PointsSchema')
const Transactions = require('../models/TransactionsSchema')
const Settings = require('../models/SettingsSchema')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const nodeMailer = require("nodemailer");
const fs = require("fs")


// Sign Up new user
const signUpUser = async (req, res) => {
    const { email, password, username } = req.body;
    if (!password || !email || !username) {
        return res.json({
            success: false,
            message: "Please fill all required fields"
        });
    } else {
        const newEmail = email.toLowerCase();
        const checkUserExists = await Users.findOne({
            email: newEmail
        })
        if (checkUserExists) {
            return res.json({
                success: false,
                message: 'User with same email already exists'
            })
        } else {
            console.log("==req.body?.role===", req.body?.role)
            if (req.body?.role && req.body?.role != "user") {
                return res.json({
                    success: false,
                    message: 'Your role type must be user for signing up'
                })
            }
            req.body.password = await bcrypt.hash(password, 12); // hashing password
            req.body.username = username.charAt(0).toUpperCase() + username.slice(1);
            req.body.email = email.toLowerCase();
            req.body.isActive = false

            const newUser = new Users({ ...req.body })
            try {
                await newUser.save();

                // sending email for verification
                let isEmailSent = await sendEmail(req.body.email)
                if (isEmailSent) {

                }

                res.status(201).json({
                    success: true,
                    message: ' Account created successfully'
                })
            } catch (error) {
                console.log("Error in signUpUser and error is : ", error)
                res.status(201).json({
                    success: false,
                    message: "Something went wrong, Please try again"
                })
            }
        }
    }
}

// sending email
const sendEmail = async (email) => {
    if (!email) {
        return {
            success: false,
            message: "Email is required"
        };
    } else {
        try {
            let isUser = await Users.findOne({ email: email })
            if (!isUser) {
                return {
                    success: false,
                    message: "No user found with provided Email"
                };
            }
            let randomNo = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
            const curntDateTime = new Date();
            isUser.codeSentTime = curntDateTime;
            isUser.verificationCode = randomNo;
            let updated = await Users.findOneAndUpdate({ email: email }, { $set: { ...isUser } }, { new: true });

            // step 01
            const transport = nodeMailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.JWT_ADMIN_EMAIL, //own email
                    pass: process.env.JWT_ADMIN_PASSWORD, // own password
                }
            })
            // step 02
            const mailOption = {
                from: process.env.JWT_ADMIN_EMAIL, // admin email
                //to: isUser.email, // receiver eamil
                to: email, // receiver eamil
                subject: "Email Verification code",
                text: `Dear ${updated.username},\nYour Verification Code is ${updated.verificationCode}.\n Thanks.`
            }
            // step 03
            transport.sendMail(mailOption, (err, info) => {
                if (err) {
                    console.log("Error ocurred : ", err)
                    return { success: false, message: " Error in sending mail", err }
                } else {
                    console.log("Email Sent and info is : ", info.response)
                    return { success: true, message: 'Email Sent to your Gmail account successfully' }
                }
            })

            return {
                success: true,
                message: 'Email Sent successfully.'
            }
        } catch (error) {
            console.log("Error in updateEmailOfUser and error is : ", error)
            return {
                success: false,
                message: "Something went wrong, Please try again"
            }
        }
    }
}

// sending email in case of forget password
const sendMailForgetPassword = async (req, res) => {
    if (!req.params.email) {
        return res.json({
            success: false,
            message: "Email is required"
        });
    } else {
        try {
            let isUser = await Users.findOne({ email: req.params.email, role: "user" })
            if (!isUser) {
                return res.json({
                    success: false,
                    message: "No user found with provided Email"
                });
            }


            let isEmailSent = await sendEmail(req.params.email)

            if (isEmailSent) {

            }

            res.status(201).json({
                success: true,
                message: 'Email Sent successfully.'
            })
        } catch (error) {
            console.log("Error in updateEmailOfUser and error is : ", error)
            res.status(201).json({
                success: false,
                message: "Something went wrong, Please try again"
            })
        }
    }
}

// verifying otp in case of new account verification and forget password
const verifyOtp = async (req, res) => {
    if (!req.body.email || !req.body.verificationCode) {
        return res.json({
            success: false,
            message: "Please provide all required fields"
        });
    } else {
        try {
            let isUser = await Users.findOne({ email: req.body.email, role: "user" })
            if (!isUser) {
                return res.json({
                    success: false,
                    message: "No user found with provided Email"
                });
            }

            if (isUser.verificationCode != req.body.verificationCode) {
                return res.json({
                    success: false,
                    message: "In valid verification code"
                });
            }

            isUser.verificationCode = null
            isUser.isActive = true
            let isUpdated = await Users.findByIdAndUpdate(isUser?._id, { $set: { ...isUser } }, { $new: true })
            if (isUpdated) {
                res.status(200).json({
                    success: true,
                    message: 'Account verified successfully, you can login now'
                })
            }

        } catch (error) {
            console.log("Error in updateEmailOfUser and error is : ", error)
            res.status(201).json({
                success: false,
                message: "Something went wrong, Please try again"
            })
        }
    }
}

// Logging In user
const LogInUser = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.json({ success: false, message: "Please fill required fields" })
    } else {
        try {
            const newEmail = email.toLowerCase();
            let isUserExists = await Users.findOne({ email: newEmail }, { createdAt: 0, updatedAt: 0, __v: 0 });

            if (!isUserExists) {
                return res.json({ success: false, message: "User not found" })
            }

            if (isUserExists.role == "user" && isUserExists.isActive == false) {
                return res.json({ success: false, message: "Please verify your account" })
            }

            const isPasswordCorrect = await bcrypt.compare(password, isUserExists.password); // comparing password
            if (!isPasswordCorrect) {
                return res.json({
                    success: false,
                    message: 'Invalid credentials'
                })
            }

            // updating last login, in case of user
            if (isUserExists.role == "user") {
                isUserExists.lastLogin = new Date();
                await Users.findByIdAndUpdate(isUserExists?._id, { $set: { ...isUserExists } }, { $new: true })
            }

            const access_token = jwt.sign({ id: isUserExists._id, role: isUserExists.role }, process.env.JWT_SECRET_ACCESS_KEY, { expiresIn: process.env.JWT_ACCESS_KEY_EXPIRY_TIME }); // generating access token

            return res.json({
                success: true,
                User: {
                    Id: isUserExists._id,
                    Email: isUserExists.email,
                    UserName: isUserExists.username,
                    Role: isUserExists.role
                },
                Token: access_token,
            });
        } catch (error) {
            console.log("Error in LogInUser and error is : ", error)
            return res.json({
                success: false,
                message: "Something went wrong, Please try again"
            });
        }
    }
}

// Logging In super admin only
const LogInSuperAdmin = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.json({ success: false, message: "Please fill required fields" })
    } else {
        try {
            const newEmail = email.toLowerCase();
            const isUserExists = await Users.findOne({ $and: [{ email: newEmail }, { role: "superAdmin" }] }, { createdAt: 0, updatedAt: 0, __v: 0 });
            if (!isUserExists) {
                return res.json({ success: false, message: "User not found" })
            }

            const isPasswordCorrect = await bcrypt.compare(password, isUserExists.password); // comparing password
            if (!isPasswordCorrect) {
                return res.json({
                    success: false,
                    message: 'Invalid credentials'
                })
            }

            const access_token = jwt.sign({ id: isUserExists._id, role: isUserExists.role }, process.env.JWT_SECRET_ACCESS_KEY, { expiresIn: process.env.JWT_ACCESS_KEY_EXPIRY_TIME }); // generating access token

            return res.json({
                success: true,
                User: {
                    Email: isUserExists.email,
                    UserName: isUserExists.username,
                    Id: isUserExists?._id
                },
                Token: access_token,
                // Refresh_Token : refresh_token
            });
        } catch (error) {
            console.log("Error in LogInSuperAdmin and error is : ", error)
            return res.json({
                success: false,
                message: "Something went wrong, Please try again"
            });
        }
    }
}

// get user profile information
const getProfileInfo = async (req, res) => {
    if (!req.userId) {
        return res.json({ success: false, message: "Please fill required fields" })
    } else {
        try {
            let isUserExists = await Users.findOne({ _id: req.userId }, { createdAt: 0, updatedAt: 0, __v: 0 })

            if (!isUserExists) {
                return res.json({ success: false, message: "User not found" })
            }

            // updating last login, in case of user
            if (isUserExists.role == "superAdmin") {
                return res.json({ success: false, message: "Access Denied!" })
            }

            // getting user activities
            const isActivities = await UserActivities.find({ user: req.userId })

            // getting user points
            const isPoints = await UserPoints.find({ user: req.userId })

            // getting user transactions
            const isTransactions = await Transactions.find({ user: req.userId })

            return res.json({
                success: true,
                User: {
                    Id: isUserExists._id,
                    Email: isUserExists.email,
                    UserName: isUserExists.username,
                    Role: isUserExists.role,
                    Tokens: isUserExists.tokens
                },
                Activities: isActivities,
                Points: isPoints,
                Transactions: isTransactions,
            });
        } catch (error) {
            console.log("Error in getProfileInfo and error is : ", error)
            return res.json({
                success: false,
                message: "Something went wrong, Please try again"
            });
        }
    }
}

// get user profile information by admin
const getProfileInfoByAdmin = async (req, res) => {
    if (!req.userId || !req.params.userId) {
        return res.json({ success: false, message: "Please fill required fields" })
    } else {
        try {
            if (req.role == "user") {
                return res.json({ success: false, message: "Acess Denied!" })
            }

            let isUserExists = await Users.findOne({ _id: req.params.userId }, { createdAt: 0, updatedAt: 0, __v: 0 })

            if (!isUserExists) {
                return res.json({ success: false, message: "User not found" })
            }

            // getting user activities
            const isActivities = await UserActivities.find({ user: req.params.userId })

            // getting user points
            const isPoints = await UserPoints.find({ user: req.params.userId })

            // getting user transactions
            const isTransactions = await Transactions.find({ user: req.params.userId })

            return res.json({
                success: true,
                User: isUserExists,
                Activities: isActivities,
                TotalPoints: isPoints,
                TokensWithDrawn: isTransactions,
                TotalTokens: isUserExists.tokens,
            });
        } catch (error) {
            console.log("Error in getProfileInfoByAdmin and error is : ", error)
            return res.json({
                success: false,
                message: "Something went wrong, Please try again"
            });
        }
    }
}

// getting dashboard data
const getDashoardData = async (req, res) => {
    if (!req.userId || !req.role) {
        return res.json({
            success: false,
            message: "Please fill all required fields"
        });
    } else {
        if (req.role == "user") {
            return res.json({
                message: 'Access Denied!',
                success: false,
            })
        }
        try {
            const currentMonth = new Date().getMonth() + 1

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const twelvveMonthsAgo = new Date();
            twelvveMonthsAgo.setMonth(twelvveMonthsAgo.getMonth() - 12);

            const settings = await Settings.find({})

            const totalActivities = await Activities.find({}).count()

            const totalTokens = await Tokens.find({}).count()

            const totalUsers = await Users.find({}).count()

            const totalUsersLastSevenDays = await Users.find({ createdAt: { $gte: sevenDaysAgo } }).count()

            const totalUsersThisMonth = await Users.find({ $and: [{ createdAt: { $gte: new Date(new Date().getFullYear(), currentMonth - 1, 1) } }, { createdAt: { $lt: new Date(new Date().getFullYear(), currentMonth, 1) } }] }).count()

            const totalUsersLast12Months = await Users.find({ createdAt: { $gte: twelvveMonthsAgo } }).count()

            const totalPoints = await Points.find({}).count()

            const totalPointsLastSevenDays = await Points.find({ createdAt: { $gte: sevenDaysAgo } }).count()

            const totalPointsThisMonth = await Points.find({ $and: [{ createdAt: { $gte: new Date(new Date().getFullYear(), currentMonth - 1, 1) } }, { createdAt: { $lt: new Date(new Date().getFullYear(), currentMonth, 1) } }] }).count()

            const totalPointsLast12Months = await Points.find({ createdAt: { $gte: twelvveMonthsAgo } }).count()

            const _activeActivities = await UserActivities.find({ endDateTime: null })

            let activeActivities = [];
            // Use the filter method to iterate through the array
            const uniqueRecords = _activeActivities.filter((record) => {
                const id = record.activity._id;

                // If the id is not in the uniqueRecords object, add it and return true (keep the record)
                let isFound = activeActivities.find(item => item.activity._id == id)
                if (!isFound) {
                    //activeActivities.push(record.activity);
                    activeActivities.push({
                        activity: {
                            _id: record.activity._id,
                            title: record.activity.name,
                            description: record.activity.description,
                            requireGPSTracking: record.activity.requireGPSTracking,
                            defaultPoints: record.activity.defaultPoints,
                            minPoints: record.activity.minPoints,
                            maxPoints: record.activity.maxPoints,
                            diffLevel: record.activity.diffLevel,
                            image: record.activity.image,
                        },
                        users: [{
                            _id: record.user._id,
                            name: record.user.username,
                            image: record.user.image
                        }],
                        Tokens: record.activity.maxPoints / settings[0].tokensPerTenPoint
                    })
                    return true;
                } else {
                    isFound.users.push({
                        _id: record.user._id,
                        name: record.user.username,
                        image: record.user.image
                    })
                    activeActivities.map(item => item._id == id ? isFound : item)
                }

                // If the id is already in activeActivities, return false (remove the duplicate record)
                return false;
            })

            const _closedActivitiesThisMonth = await UserActivities.find({ $and: [{ endDateTime: { $ne: null } }, { updatedAt: { $gte: new Date(new Date().getFullYear(), currentMonth - 1, 1) } }, { updatedAt: { $lt: new Date(new Date().getFullYear(), currentMonth, 1) } }] })

            let closedActivitiesThisMonth = [];
            // Use the filter method to iterate through the array
            const uniqueClosedRecordsThisMonth = _closedActivitiesThisMonth.filter((record) => {
                const id = record.activity._id;

                // If the id is not in the uniqueClosedRecordsThisMonth object, add it and return true (keep the record)
                if (!closedActivitiesThisMonth.find(item => item.activity._id == id)) {
                    closedActivitiesThisMonth.push(record);
                    return true;
                }

                // If the id is already in uniqueClosedRecordsThisMonth, return false (remove the duplicate record)
                return false;
            })

            const _closedActivities = await UserActivities.find({ endDateTime: { $ne: null } })

            let closedActivities = [];
            // Use the filter method to iterate through the array
            const uniqueClosedRecords = _closedActivities.filter((record) => {
                const id = record.activity._id;

                // If the id is not in the uniqueClosedRecords object, add it and return true (keep the record)
                if (!closedActivities.find(item => item.activity._id == id)) {
                    closedActivities.push(record);
                    return true;
                }

                // If the id is already in closedActivities, return false (remove the duplicate record)
                return false;
            })

            const allUserActivities = await UserActivities.find({})


            return res.status(201).json({
                success: true,
                message: 'Data fetched successfully',
                totalTokens,
                totalUsers,
                totalUsersLastSevenDays,
                totalUsersThisMonth,
                totalUsersLast12Months,
                currentMonthUsersPercentage: totalUsers / totalUsersThisMonth,
                userLastYearPercentage: totalUsers / totalUsersLast12Months,
                totalPoints,
                totalPointsLastSevenDays,
                totalPointsThisMonth,
                totalPointsLast12Months,
                totalActivities,
                activeActivitiesCount: activeActivities.length,
                closedActivitiesCount: closedActivities.length,
                doneActivitiesThisMonth: closedActivitiesThisMonth.length,
                avtiveActivitiesPercentage: totalActivities / activeActivities.length,
                activeActivities,
                allUserActivities: allUserActivities.length
            })
        } catch (error) {
            console.log("Error in getDahsboardData and error is : ", error)
            res.status(201).json({
                success: false,
                message: "Something went wrong, Please try again"
            })
        }
    }
}

// getting dashboard graph data
const getDashboardGraphData = async (req, res) => {
    if (!req.userId || !req.role) {
        return res.json({
            success: false,
            message: "Please fill all required fields"
        });
    } else {
        if (req.role == "user") {
            return res.json({
                message: 'Access Denied!',
                success: false,
            })
        }
        try {
            const currentDate = new Date();

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const twelveMonthsAgo = new Date(currentDate);
            twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const lastThirtyAgo = new Date();
            lastThirtyAgo.setDate(lastThirtyAgo.getDate() - 7);

            ///  ==== Users ====== ////
            const monthlyRecord = await Users.aggregate([
                {
                    $match: {
                        createdAt: { $gte: twelveMonthsAgo, $lte: currentDate },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m', date: '$createdAt' },
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ]);

            const weeklyRecord = await Users.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sevenDaysAgo, $lte: currentDate },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m', date: '$createdAt' },
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ]);

            const sixMonthsRecord = await Users.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sixMonthsAgo, $lte: currentDate },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m', date: '$createdAt' },
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ]);

            const lastThirtyDaysRecord = await Users.aggregate([
                {
                    $match: {
                        createdAt: { $gte: lastThirtyAgo, $lte: currentDate },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m', date: '$createdAt' },
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ]);


            /// ==== Points ====== ////
            const monthlyPointsRecord = await Points.aggregate([
                {
                    $match: {
                        createdAt: { $gte: twelveMonthsAgo, $lte: currentDate },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m', date: '$createdAt' },
                        },
                        count: { $sum: '$pointTransferred' },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ]);

            const weeklyPointsRecord = await Points.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sevenDaysAgo, $lte: currentDate },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m', date: '$createdAt' },
                        },
                        count: { $sum: '$pointTransferred' },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ]);

            const sixMonthsPointsRecord = await Points.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sixMonthsAgo, $lte: currentDate },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m', date: '$createdAt' },
                        },
                        count: { $sum: '$pointTransferred' },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ]);

            const lastThirtyDaysPointsRecord = await Points.aggregate([
                {
                    $match: {
                        createdAt: { $gte: lastThirtyAgo, $lte: currentDate },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m', date: '$createdAt' },
                        },
                        count: { $sum: '$pointTransferred' },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ]);

            return res.status(201).json({
                success: true,
                message: 'Data fetched successfully',
                Users: {
                    last12monthsRecords: monthlyRecord,
                    last6MonthsRecord: sixMonthsRecord,
                    last30daysRecord: lastThirtyDaysRecord,
                    last7DaysRecords: weeklyRecord,
                },
                Points: {
                    last12monthsRecords: monthlyPointsRecord,
                    last6MonthsRecord: weeklyPointsRecord,
                    last30daysRecord: sixMonthsPointsRecord,
                    last7DaysRecords: lastThirtyDaysPointsRecord,
                }
            })
        } catch (error) {
            console.log("Error in getDashboardGraphData and error is : ", error)
            res.status(201).json({
                success: false,
                message: "Something went wrong, Please try again"
            })
        }
    }
}


module.exports = {
    LogInUser,
    LogInSuperAdmin,
    signUpUser,
    sendMailForgetPassword,
    verifyOtp,
    getProfileInfo,
    getProfileInfoByAdmin,
    getDashoardData,
    getDashboardGraphData
}