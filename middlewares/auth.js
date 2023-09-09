const jwt = require('jsonwebtoken');
const Admins = require("../models/UsersSchema")
const AccessTokens = require("../models/TokensSchema")
// Map to store timestamps of recent requests
const requestTimestamps = new Map();

let timeStamps = []


const superAdminOnly = ["UniversexTokens", "UniversexUsers", "UniversexVehicles", "UniversexActivities", "UniversexUserActivities", "UniversexUserLocations", "UniversexWithdrawalRequests", "UniversexNotifications", "UniversexTransactions", "UniversexSettings", "UniversexPoints", "UniversexWithdrawalComments"]
const adminsOnly = ["UniversexUsers", "UniversexVehicles", "UniversexWithdrawalRequests", "UniversexNotifications", "UniversexTransactions", "UniversexUserLocations", "UniversexActivities", "UniversexUserActivities", "UniversexSettings", "UniversexPoints", "UniversexWithdrawalComments"]
const adminAndUsersBoth = ["UniversexActivities", "UniversexVehicles", "UniversexUserActivities", "UniversexUserLocations", "UniversexWithdrawalRequests", "UniversexNotifications", "UniversexTransactions", "UniversexPoints"]

const allowedMethods = [
    {
        UniversexTokens: {
            superAdmin: ["GET", "POST", "PUT", "DELETE"],
        },
    },
    {
        UniversexUsers: {
            superAdmin: ["GET", "POST", "PUT", "DELETE"],
            admin: ["GET", "POST", "PUT", "DELETE"],
        },
    },
    {
        UniversexVehicles: {
            superAdmin: ["GET", "POST", "PUT", "DELETE"],
            admin: ["GET", "POST", "PUT", "DELETE"],
        },
    },
    {
        UniversexActivities: {
            superAdmin: ["GET", "POST", "PUT", "DELETE"],
            user: ["GET", "POST", "PUT", "DELETE"],
        },
    },
    {
        UniversexUserActivities: {
            superAdmin: ["GET", "POST", "PUT", "DELETE"],
            user: ["GET", "POST", "PUT", "DELETE"],
        },
    },
    {
        UniversexUserLocations: {
            superAdmin: ["GET", "POST", "PUT", "DELETE"],
            admin: ["GET", "POST", "PUT", "DELETE"],
            user: ["GET", "POST"],
        },
    },
    {
        UniversexWithdrawalRequests: {
            superAdmin: ["GET", "POST", "PUT", "DELETE"],
            admin: ["GET", "POST", "PUT", "DELETE"],
        },
    },
]

const validRoles = ["user", "admin", "superAdmin"]

// for verifying if valid auth token provided
const verifyUserToken = (req, res, next) => {
    const token = req.header('universex-token');
    const { collectionName } = req.params


    // Check if not token
    if (!token) {
        return res.status(401).json({ success: false, msg: 'No authorization token found, access denied' });
    }

    // Verify token
    try {
        jwt.verify(token, process.env.JWT_SECRET_ACCESS_KEY, async (error, decoded) => {
            if (error) {
                console.log("error : ", error)
                return res.status(401).json({ success: false, isTokenExpired: true, msg: 'Access Denied, Token is expired or In-valid' });
            } else {
                req.userId = decoded.id;
                req.role = decoded.role
                console.log("====decoded role====", req.userId, ":::", decoded?.role)
                const isUser = await Admins.findById(req.userId);

                if (!isUser) {
                    return res.json({ success: false, message: 'Authorization Denied! You are not recognized as Registered member of App.' });
                }

                if (!validRoles?.includes(decoded?.role)) {
                    return res.status(401).json({ success: false, message: 'Authorization Denied! Your role is not defined in our App.' });
                }

                if (decoded?.role == "superAdmin") {
                    if (!superAdminOnly?.includes(collectionName)) {
                        return res.status(401).json({ success: false, message: 'Authorization Denied! You can not access this api' });
                    }
                } else if (decoded?.role == "admin") {
                    if (!adminsOnly?.includes(collectionName)) {
                        if (req.route.path.split("/")[5] == "getUserProfileInfo" || req.route.path.split("/")[5] == "getUserInfoByAdmin" || req.route.path.split("/")[4] == "transactions" || req.route.path.split("/")[4] == "userActivities" || req.route.path.split("/")[5] == "getDashboardInfo") {

                        } else {
                            return res.status(401).json({ success: false, message: 'Authorization Denied! You can not access this api' });
                        }
                    }
                } else {
                    if (!adminAndUsersBoth?.includes(collectionName)) {
                        if (req.route.path.split("/")[4] == "uploadFiles" || req.route.path.split("/")[5] == "getUserProfileInfo") {
                        } else {
                            return res.status(401).json({ success: false, message: 'Authorization Denied! You can not access this api' });
                        }
                    }
                }

                // checking if status is active or not , in case of simple user
                if (decoded?.role == "user") {
                    if (isUser?.isActive == false)
                        return res.status(401).json({ success: false, message: 'Please verify your account first' });
                }
                next();
            }
        });
    } catch (err) {
        console.error('something wrong with auth middleware');
        res.status(500).json({ msg: 'Server Error' });
    }
}

// checking if api call being made by same ip is less than 2 seconds or nt
const verifyIpAddress = async (req, res, next) => {
    // Check if the endpoint matches the current request
    const clientId = req.ip; // Replace with your client identifier
    const currentTime = Date.now();

    //console.log("==timeStamps====", timeStamps)

    let isFound = timeStamps.find(item => item?.ip == req.ip && item.reqUrl == req.originalUrl)
    if (isFound) {
        //console.log("===checking ===", (new Date().getTime() / 1000 - new Date(isFound.time).getTime() / 1000))
        let diff = new Date().getTime() / 1000 - new Date(isFound.time).getTime() / 1000
        let _temp = timeStamps.filter(item => item.ip != req.ip)
        _temp.push({ ip: clientId, time: Date.now(), reqUrl: req.originalUrl })
        timeStamps = _temp
        const minTimeInterval = 2
        console.log("==diff====",diff)
        if (diff < minTimeInterval) {
            console.log("***** Delaying api *****")
            setTimeout(() => { next() }, 2000)
        } else {
            next()
        }
    } else {
        timeStamps.push({ ip: clientId, time: currentTime, reqUrl: req.originalUrl })
        next()
    }
}

// for verifying access token
const verifyAccessToken = async (req, res, next) => {
    const { token } = req.params

    // Check if not token
    if (!token) {
        return res.status(401).json({ success: false, msg: 'No access token found, access denied' });
    }

    // Verify access token
    try {
        const isValidToken = await AccessTokens.findOne({ hashedKey: token });
        if (!isValidToken) {
            return res.status(401).json({ success: false, message: "InValid access token " })
        } else {
            let currentDate = new Date();
            let tokenExpiryDate = new Date(isValidToken?.expireAt);
            if (currentDate >= tokenExpiryDate) {
                return res.status(401).json({ success: false, message: "Token Expired" })
            }

            next();
        }
    } catch (err) {
        console.error('something wrong with auth middleware');
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}

module.exports = {
    verifyUserToken,
    verifyAccessToken,
    verifyIpAddress
};