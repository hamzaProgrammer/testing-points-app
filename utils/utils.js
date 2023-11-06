const mongoose = require("mongoose");
const Users = require('../models/UsersSchema')
const Tokens = require('../models/TokensSchema')
const Vehicles = require('../models/VehicleSchema')
const Activities = require('../models/ActivitySchema')
const UserActivities = require('../models/UserActivitySchema')
const UserLocations = require('../models/UserLocationSchema')
const WithDrawalRequests = require('../models/WidthdrawlRequestSchema')
const Notifications = require('../models/NotificationsSchema')
const Transactions = require('../models/TransactionsSchema')
const Settings = require('../models/SettingsSchema')
const Points = require('../models/PointsSchema')
const WithDrawlComments = require('../models/WithdrawlCommentsSchama')
const UserNotes = require('../models/UsersNotesSchema')

// getting name of collection based on collection name sent in params, also verifying if valid collection name is sent
const getCollectionName = (name) => {
    if (name == "UniversexUsers") {
        return Users
    } else if (name == "UniversexTokens") {
        return Tokens
    } else if (name == "UniversexVehicles") {
        return Vehicles
    } else if (name == "UniversexActivities") {
        return Activities
    } else if (name == "UniversexUserActivities") {
        return UserActivities
    } else if (name == "UniversexUserLocations") {
        return UserLocations
    } else if (name == "UniversexWithdrawalRequests") {
        return WithDrawalRequests
    } else if (name == "UniversexNotifications") {
        return Notifications
    } else if (name == "UniversexTransactions") {
        return Transactions
    } else if (name == "UniversexSettings") {
        return Settings
    } else if (name == "UniversexPoints") {
        return Points
    } else if (name == "UniversexWithdrawalComments") {
        return WithDrawlComments
    } else if (name == "UniversexUsersNotes") {
        return UserNotes
    }
    // returning null if user has sent name of collection which does not exist in our db
    return null
}

// this is used to verify if record being added exists already or not, against specified collection name
const verifyIfRecordExists = async (collectionName, collection, data) => {
    let checkRecordExists = null
    if (collectionName == "UniversexUsers") {
        const newEmail = data?.email.toLowerCase();
        const _username = data?.username?.toLowerCase()
        checkRecordExists = await collection.findOne({
            $or: [{ email: newEmail }, { username: _username }]
        })
    } else if (collectionName == "UniversexTokens") {
        const newName = data?.name;
        checkRecordExists = await collection.findOne({
            name: newName
        })
    } else if (collectionName == "UniversexVehicles") {
        checkRecordExists = await collection.findOne({
            title: data?.title
        })
    } else if (collectionName == "UniversexActivities") {
        checkRecordExists = await collection.findOne({
            title: data?.title
        })
    } else if (collectionName == "UniversexPoints") {
        checkRecordExists = await collection.findOne({
            $and: [{ user: data?.user }, { activity: data?.activity }, { vehicleType: data?.vehicleType }, { pointTransferred: data?.pointTransferred }, { startingCoordinates: data?.startingCoordinates }, { endingCoordinates: data?.endingCoordinates }]
        })
    }
    // if record exist
    if (checkRecordExists) {
        return true
    }

    // returning false, if no existing record found
    return false
}

// verify required fields are being sent in body while creating record, in this we will check for only required fields not others
const verifyRequiredFields = async (collectionName, data, userId, role) => {
    if (collectionName == "UniversexUsers") {  // verifying in case users on basis of email and username
        if (!data?.username || !data?.email || !data?.password) {
            return {
                success: false,
                message: "Please provide all required fields"
            }
        }
    } else if (collectionName == "UniversexTokens") {
        if (!data?.name) {
            return {
                success: false,
                message: "Please provide all required fields"
            }
        }
    } else if (collectionName == "UniversexVehicles") {
        console.log("==data?.imageOfVehicle===", data?.title)
        if (!data?.title || !data?.type) {
            return {
                success: false,
                message: "Please provide all required fields"
            }
        }
    } else if (collectionName == "UniversexActivities") {
        if (!data?.title || !data?.description || !data?.defaultPoints || !data?.minPoints || !data?.maxPoints || !data?.limits || !data?.diffLevel) {
            return {
                success: false,
                message: "Please provide all required fields"
            }
        }
    } else if (collectionName == "UniversexUserActivities") {
        if (!data?.activity || !data?.user || !data?.startDateTime || !data?.startingCoordinates) {
            return {
                success: false,
                message: "Please provide all required fields"
            }
        }
        if (!isValidMongooseId(data?.activity) || !isValidMongooseId(data?.user)) {
            return {
                success: false,
                message: "InValid Ids provided"
            }
        }
        // checking if provided ids exist in our db or not
        let isActivityExists = await Activities.findById(data.activity)
        if (!isActivityExists) {
            return {
                success: false,
                message: "Please provide correct Activity Id"
            }
        }
        let isUserExists = await Users.findById(data.user)
        if (!isUserExists) {
            return {
                success: false,
                message: "Please provide correct User Id"
            }
        }
        if (!isValidDateTime(data?.startDateTime)) {
            return {
                success: false,
                message: "Please provide correct Date Time format"
            }
        }
        // verifying if userId is same as sent in jwt token
        if (role == "user") {
            if (userId != data?.user) {
                return {
                    success: false,
                    message: "Access Denied!"
                }
            }
        }
    } else if (collectionName == "UniversexUserLocations") {
        if (!data?.activity || !data?.user || !data?.vehicle || !data?.latitude || !data?.longitude) {
            return {
                success: false,
                message: "Please provide all required fields"
            }
        }
        if (!isValidMongooseId(data?.activity) || !isValidMongooseId(data?.user)) {
            return {
                success: false,
                message: "InValid Ids provided"
            }
        }
        // checking if provided ids exist in our db or not
        let isActivityExists = await Activities.findById(data.activity)
        if (!isActivityExists) {
            return {
                success: false,
                message: "Please provide correct Activity Id"
            }
        }
        let isUserExists = await Users.findById(data.user)
        if (!isUserExists) {
            return {
                success: false,
                message: "Please provide correct User Id"
            }
        }
        let isVehicleExists = await Users.findById(data.vehicle)
        if (!isVehicleExists) {
            return {
                success: false,
                message: "Please provide correct Vehicle Id"
            }
        }
        // verifying if userId is same as sent in jwt token
        if (role == "user") {
            if (userId != data?.user) {
                return {
                    success: false,
                    message: "Access Denied!"
                }
            }
        }
    } else if (collectionName == "UniversexWithdrawalRequests") {
        if (!data?.tokens || !data?.user) {
            return {
                success: false,
                message: "Please provide all required fields"
            }
        }
        if (!isValidMongooseId(data?.user)) {
            return {
                success: false,
                message: "User InValid Id provided"
            }
        }
        // checking if provided ids exist in our db or not
        let isUserExists = await Users.findById(data.user)
        if (!isUserExists) {
            return {
                success: false,
                message: "Please provide correct User Id"
            }
        }
        if (isUserExists.tokens < data?.tokens) {
            return {
                success: false,
                message: "Insufficient Tokens"
            }
        }

        // verifying if userId is same as sent in jwt token
        if (role == "user") {
            if (userId != data?.user) {
                return {
                    success: false,
                    message: "Access Denied!"
                }
            }
        }
    } else if (collectionName == "UniversexPoints") {
        if (!data?.vehicleType || !data?.user || !data?.activity || !data?.pointTransferred || Object.keys(data?.startingCoordinates).length == 0 || Object.keys(data?.endingCoordinates).length == 0) {
            return {
                success: false,
                message: "Please provide all required fields"
            }
        }
        // verifying role
        if (role == "user") {
            return {
                success: false,
                message: "Access Denied!"
            }
        }
        if (!isValidMongooseId(data?.user)) {
            return {
                success: false,
                message: "User InValid Id provided"
            }
        }
        if (!isValidMongooseId(data?.activity)) {
            return {
                success: false,
                message: "Activity InValid Id provided"
            }
        }
        let isActivityExist = await Activities.findById(data?.activity)
        if (!isActivityExist) {
            return {
                success: false,
                message: "Activity does not exist"
            }
        }
        let isUserIdExist = await Users.findById(data?.user)
        if (!isUserIdExist) {
            return {
                success: false,
                message: "User does not exist"
            }
        }
    } else if (collectionName == "UniversexWithdrawalComments") {
        if (!data?.withdrawlRequest || !data?.comment) {
            return {
                success: false,
                message: "Please provide all required fields"
            }
        }
        // verifying role
        if (role == "user") {
            return {
                success: false,
                message: "Access Denied!"
            }
        }
        if (!isValidMongooseId(data?.withdrawlRequest)) {
            return {
                success: false,
                message: "Activity InValid Id provided"
            }
        }
        let isActivityExist = await WithDrawalRequests.findById(data?.withdrawlRequest)
        if (!isActivityExist) {
            return {
                success: false,
                message: "Withdrawl Request Id does not exist"
            }
        }
    } else if (collectionName == "UniversexUsersNotes") {
        if (!data?.user || !data?.comment) {
            return {
                success: false,
                message: "Please provide all required fields"
            }
        }
        // verifying role
        if (role == "user") {
            return {
                success: false,
                message: "Access Denied!"
            }
        }
        if (!isValidMongooseId(data?.user)) {
            return {
                success: false,
                message: "Activity InValid Id provided"
            }
        }
        let isUserExist = await Users.findById(data?.user)
        if (!isUserExist) {
            return {
                success: false,
                message: "User  does not exist"
            }
        }
    }
    // returning true if all required fields against any of specified collections have been provided
    return true
}

// check if provided id is valid mongoose _id
const isValidMongooseId = (id) => {
    return mongoose.isValidObjectId(id);
};

// verifying if valid date time is provided
function isValidDateTime(dateTimeString) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+\d{2}:\d{2}$/;

    if (!dateRegex.test(dateTimeString)) {
        return false; // Invalid format
    }

    const timestamp = Date.parse(dateTimeString);

    if (isNaN(timestamp)) {
        return false; // Invalid date format
    }

    const date = new Date(dateTimeString);

    if (isNaN(date.getTime())) {
        return false; // Invalid date
    }

    return true;
}

// verify token for each api call
const verifyToken = async (token, collectionName) => { // receiving token as param from api
    // allowing user to proceed without token in case of creating new token
    if (collectionName && collectionName == "UniversexTokens") {
        return {
            success: true,
            message: "Token Verified"
        }
    }

    if (!token) {
        return { success: false, message: "Token is required" }
    }

    const isTokenExists = await Tokens.findOne({ hashedKey: token });

    if (!isTokenExists) {
        return { success: false, message: "Invalid Access Token found" }
    }

    let currentDate = new Date();
    let tokenExpiryDate = new Date(isTokenExists?.expireAt);
    if (currentDate >= tokenExpiryDate) {
        return { success: false, message: "Token Expired" }
    }

    return {
        success: true,
        message: "Token Verified"
    }
}

const formatDateToCustomString = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based, so add 1
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}-${hour}-${minute}-${second}`;
    return formattedDate;
}

module.exports = {
    getCollectionName,
    verifyIfRecordExists,
    verifyToken,
    verifyRequiredFields,
    formatDateToCustomString
}