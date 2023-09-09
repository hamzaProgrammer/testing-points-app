const bcrypt = require('bcryptjs')
const crypto = require('crypto');
const Users = require('../models/UsersSchema')
const Activities = require('../models/ActivitySchema')
const Vehicles = require('../models/VehicleSchema')
const Notifications = require('../models/NotificationsSchema')
const Transactions = require('../models/TransactionsSchema')
const Settings = require('../models/SettingsSchema')
const Points = require('../models/PointsSchema')
const WidthdrwalRequests = require('../models/WidthdrawlRequestSchema')
const { getCollectionName, verifyIfRecordExists, verifyRequiredFields } = require("../utils/utils")


// add new record
const addNewRecord = async (_collectionName, receivedData, adminId, role) => {
    let sendingData = receivedData
    let collectionName = getCollectionName(_collectionName)
    if (!collectionName) {
        return {
            success: false,
            message: "No Such Collections Found"
        }
    }
    // verifying if all required fields have been sent in body
    let isAllReqFieldProvided = await verifyRequiredFields(_collectionName, receivedData, adminId, role)
    if (isAllReqFieldProvided?.success == false) {
        return isAllReqFieldProvided
    } else {
        // verifying if record exist in our db related to specified collection
        let isRecordExisted = await verifyIfRecordExists(_collectionName, collectionName, receivedData);
        if (isRecordExisted) {
            return {
                success: false,
                message: 'Record already exists'
            }
        } else {
            // encrypting password in case of users registering
            if (_collectionName == "UniversexUsers") {
                sendingData.password = await bcrypt.hash(receivedData?.password, 12); // hashing password
                sendingData.isActive = true
                sendingData.isVerified = true
                if (sendingData.role == "superAdmin") {
                    return {
                        success: true,
                        message: 'You can not create super admin'
                    }
                }
            }
            if (_collectionName == "UniversexTokens") {
                sendingData.hashedKey = crypto.randomBytes(Math.ceil(25)).toString('hex').slice(0, 25).toUpperCase(); // random string added
                let date = new Date(); // Now
                date.setDate(date.getDate() + 30); // adding 30 days, expiration time of token
                sendingData.expireAt = date
            }
            if (_collectionName == "UniversexVehicles" || _collectionName == "UniversexActivities") {
                sendingData.addedBy = adminId
            }
            if (_collectionName == "UniversexSettings") {
                if (role == "user") {
                    return {
                        success: false,
                        message: "Access Denied!"
                    }
                }

                let isSettingsExists = await Settings.find({})
                if (isSettingsExists?.length > 0) {
                    return {
                        success: false,
                        message: "Access Denied! Settings object already exists. You can now only update that one",
                    }
                }

                sendingData.lastUpdatedBy = adminId
            }
            // sending notification in case of starting any activity
            if (_collectionName == "UniversexUserActivities") {
                await generateNewNotification(receivedData?.user, receivedData?.activity, "New Activity has been started by you", "Activity")
            }
            if (_collectionName == "UniversexActivities") {
                if (role == "user") {
                    return {
                        success: false,
                        message: "Access Denied!",
                    }
                }
            }
            if (_collectionName == "UniversexPoints") {
                if (role == "user") {
                    return {
                        success: false,
                        message: "Access Denied!",
                    }
                }
            }
            if (_collectionName == "UniversexWithdrawalComments") {
                receivedData.addedBy = adminId
            }

            // creating new record
            const newRecord = new collectionName({ ...sendingData })
            try {
                let isAdded = await newRecord.save();
                if (isAdded) {
                    if (_collectionName == "UniversexWithdrawalComments") {
                        // adding comment id to withdrawl request comments array
                        await WidthdrwalRequests.findByIdAndUpdate(receivedData?.withdrawlRequest, { $push: { adminComments: isAdded._id } }, { $new: true })
                    }
                    // sending notification in case of starting any activity
                    if (_collectionName == "UniversexWithdrawalRequests") {
                        console.log("===sendting ===")
                        await generateNewNotification(receivedData?.user, isAdded?._id, "You have sent withdrawl request to admin", "Widthdrwal")
                    }
                    return {
                        success: true,
                        message: 'New record added successfully'
                    }
                }
            } catch (error) {
                console.log("Error in addNewRecord and error is : ", error)
                return {
                    success: false,
                    message: "Something went wrong, Please try again"
                }
            }
        }
    }
}

// fetching record single
const fetchSingleRecord = async (_collectionName, id, userId, role) => { // receiving id of record and name of collection sequentially
    if (!id || !_collectionName) {
        return { success: false, message: "Please fill required fields" }
    } else {
        try {
            // getting name of collection by generic function
            let collectionName = getCollectionName(_collectionName)
            if (!collectionName) { // if user hs sent a collection name which does not exist in our db, this will prevent users from creating useless collections
                return {
                    success: false,
                    message: "No Such Collections Found"
                }
            }

            if (_collectionName == "UniversexSettings") {
                return { success: false, message: "Access Denied" }
            }

            const isRecordExists = await collectionName.findById(id);

            if (!isRecordExists) {
                return { success: false, message: "No Record found" }
            }

            if (_collectionName == "UniversexNotifications" || _collectionName == "UniversexNotifications" || _collectionName == "UniversexUserActivities" || _collectionName == "UniversexUserLocations" || _collectionName == "UniversexWithdrawalRequests") {
                if (role == "user") {
                    if (isRecordExists?.user?._id != userId) {
                        return {
                            success: false,
                            message: "Access Denied!",
                        }
                    }
                }
            }

            return {
                success: true,
                Record: isRecordExists,
            }
        } catch (error) {
            console.log("Error in fetchSingleRecord and error is : ", error)
            return {
                success: false,
                message: "Something went wrong, Please try again"
            }
        }
    }
}

// fetching record all
const fetchAllRecords = async (_collectionName, skip, _conditions, userId = "", role = "") => { // receiving name of collection and skip to fetch records sequentially
    if (!_collectionName) {
        return { success: false, message: "Please fill required fields" }
    } else {
        try {
            // getting name of collection by generic function
            let collectionName = getCollectionName(_collectionName);
            if (!collectionName) { // if user hs sent a collection name which does not exist in our db, this will prevent users from creating useless collections
                return {
                    success: false,
                    message: "No Such Collections Found"
                }
            }

            let conditions = _conditions
            // checking if role is user in these collections then we will add condition so that only that user record is fetched
            if (_collectionName == "UniversexWithdrawalRequests" || _collectionName == "UniversexNotifications" || _collectionName == "UniversexTransactions" || _collectionName == "UniversexUserActivities" || _collectionName == "UniversexUserLocations") {
                if (role == "user") {
                    conditions = { user: userId }
                }
            }

            if (_collectionName == "UniversexUsers") {
                if (role == "user") {
                    return {
                        success: false,
                        message: "You can not access this api"
                    }
                }
                if (role == "admin" && conditions?.role == "superAdmin") {
                    return {
                        success: false,
                        message: "You can not access this api"
                    }
                }
            }

            if (_collectionName == "UniversexSettings") {
                if (role == "user") {
                    return { success: false, message: "Access Denied!" }
                }
            }

            if (_collectionName == "UniversexPoints") {
                if (role == "user") {
                    conditions = { user: userId }
                }
            }


            const isRecordExists = await collectionName.find(conditions, { createdAt: 0, __v: 0, password: 0 })
                .sort({ createdAt: -1 }).skip(skip).limit(10).select('-password');

            if (!isRecordExists) {
                return { success: false, message: "No Record found" }
            }

            return {
                success: true,
                Record: isRecordExists
            }
        } catch (error) {
            console.log("Error in fetchAllRecords and error is : ", error)
            return {
                success: false,
                message: "Something went wrong, Please try again"
            }
        }
    }
}

// update record single
const updateSingleRecord = async (_collectionName, id, updatedData, userId = "", role) => { // receiving name of collection , id of record and updated data sequentially
    if (!id || !updatedData || !_collectionName) {
        return { success: false, message: "Please fill required fields" }
    } else {
        try {
            // getting name of collection by generic function
            let collectionName = getCollectionName(_collectionName);
            if (!collectionName) { // if user has sent a collection name which does not exist in our db, this will prevent users from creating useless collections
                return {
                    success: false,
                    message: "No such collection Found"
                }
            }
            const isRecordExists = await collectionName.findById(id);

            if (!isRecordExists) {
                return { success: false, message: "No Record found" }
            }

            console.log("==updatedData?.withdrawlRequest==", updatedData?.withdrawlRequest)

            if (_collectionName == "UniversexSettings") {
                if (role == "user") {
                    return { success: false, message: "Access Denied" }
                }

                updatedData.lastUpdatedBy = userId
            }
            if (_collectionName == "UniversexUserActivities") {
                if (isRecordExists?.endingCoordinates?.length > 0) {
                    return {
                        success: false,
                        message: "You have already provided ending time and coordinates for this activity",
                    }
                }
                let IsValidActivity = await Activities.findById(isRecordExists?.activity)
                if (!IsValidActivity) {
                    return {
                        success: false,
                        message: "InValid Activity id"
                    }
                }

                if (updatedData?.endDateTime && updatedData?.endingCoordinates?.length > 0) {
                    let settingsRes = await Settings.find({})
                    if (settingsRes?.length == 0) {
                        return {
                            success: false,
                            message: "Please set up token per 10 points via settings first"
                        }
                    } else {
                        let NoOfTokensGot = Number(isRecordExists?.activity?.maxPoints) / Number(settingsRes[0]?.tokensPerTenPoint)  // dividing toytal points got by an actvity with token per 10 points in settings
                        console.log("==NoOfTokensGot ===", settingsRes[0]?.tokensPerTenPoint, ":::", isRecordExists?.activity?.maxPoints, "::::", NoOfTokensGot)
                        //  this means activity has been closed by user, so calculating user tokens, for now we are adding ten in previous tokens
                        let IsUserUpdated = await Users.findByIdAndUpdate(isRecordExists?.user, { $inc: { tokens: Number(NoOfTokensGot) } }, { $new: true })
                        if (!IsUserUpdated) {
                            return {
                                success: false,
                                message: "Something went wrong"
                            }
                        }
                    }
                }

                if (_collectionName == "UniversexUserActivities") {
                    await generateNewNotification(isRecordExists?.user._id, isRecordExists?._id, "Your activity has been ended", "Activity")
                }
            }
            if (_collectionName == "UniversexNotifications") {
                if (role == "user") {
                    if (isRecordExists?.user?._id != userId) {
                        return {
                            success: false,
                            message: "Access Denied!",
                        }
                    }
                }
            }
            if (_collectionName == "UniversexUserLocations") {
                let IsValidActivity = await Activities.findById(isRecordExists?.activity)
                if (!IsValidActivity) {
                    return {
                        success: false,
                        message: "InValid Activity Id"
                    }
                }
                let IsValidUser = await Users.findById(isRecordExists?.user)
                if (!IsValidUser) {
                    return {
                        success: false,
                        message: "InValid User Id"
                    }
                }
                let IsValidVehicle = await Vehicles.findById(isRecordExists?.vehicle)
                if (!IsValidVehicle) {
                    return {
                        success: false,
                        message: "InValid Vehicle Id"
                    }
                }
            }
            if (_collectionName == "UniversexWithdrawalRequests") {
                if (role == "user") {
                    return {
                        success: false,
                        message: "You can not perform this action"
                    }
                }

                if (!updatedData.status || !updatedData?.approvedTokens) {
                    return {
                        success: false,
                        message: "Status and no of approved tokens are required"
                    }
                }

                if (updatedData?.approvedTokens > isRecordExists.tokens)
                    if (isRecordExists.status != "Pending") {
                        return {
                            success: false,
                            message: "You can not update status now"
                        }
                    }

                // if status is accepted
                if (updatedData.status == "Approved") {
                    // deduct tokens from user account
                    let isUserExists = await Users.findById(isRecordExists.user)
                    if (!isUserExists) {
                        return {
                            success: false,
                            message: "User of this request does not exist"
                        }
                    }
                    let isUserUpdated = await Users.findByIdAndUpdate(isRecordExists.user, { $inc: { tokens: -updatedData?.approvedTokens } }, { $new: true });
                    if (isUserUpdated) {
                        // sending notification in case of accepting transaction
                        await generateTransactionRecord(isRecordExists?.user._id, updatedData?.approvedTokens)
                    }
                }

                // sending notification in case of starting any activity
                if (_collectionName == "UniversexWithdrawalRequests") {
                    await generateNewNotification(isRecordExists?.user._id, isRecordExists?._id, "Your withdrawl status has been changed", "Widthdrwal")
                }
            }
            if (_collectionName == "UniversexVehicles" || _collectionName == "UniversexActivities") {
                if (role == "user") {
                    return {
                        success: false,
                        message: "Access Denied!",
                    }
                }
            }
            if (_collectionName == "UniversexPoints" || _collectionName == "UniversexWithdrawalComments") {
                if (role == "user") {
                    return {
                        success: false,
                        message: "Access Denied!",
                    }
                }

                if (updatedData?.withdrawlRequest) {
                    if (updatedData?.withdrawlRequest != isRecordExists.withdrawlRequest) {
                        return {
                            success: false,
                            message: "UnAuthorized Action!",
                        }
                    }
                }
            }

            // updating
            let updated = await collectionName.findByIdAndUpdate(id, { $set: { ...updatedData } }, { $new: true })

            const _updated = await collectionName.findById(updated._id);

            if (_updated) {
                return {
                    success: true,
                    UpdatedRecord: _updated,
                }
            }
        } catch (error) {
            console.log("Error in updateSingleRecord and error is : ", error)
            return {
                success: false,
                message: "Something went wrong, Please try again"
            }
        }
    }
}

// delete record single
const deleteSingleRecord = async (_collectionName, id, userId = "", role) => { // receiving name of collection and id of record  sequentially
    if (!id || !_collectionName) {
        return { success: false, message: "Please fill required fields" }
    } else {
        try {
            // getting name of collection by generic function
            let collectionName = getCollectionName(_collectionName);
            if (!collectionName) { // if user hs sent a collection name which does not exist in our db, this will prevent users from creating useless collections
                return {
                    success: false,
                    message: "No Such Collections Found"
                }
            }
            if (_collectionName == "UniversexSettings") {
                if (role == "user") {
                    return { success: false, message: "Access Denied" }
                }
                return { success: false, message: "Access Denied! You can not delete settings object" }
            }
            // restricting action in case of is user is performing these collections
            if (_collectionName == "UniversexNotifications" || _collectionName == "UniversexTransactions" || _collectionName == "UniversexVehicles" || _collectionName == "UniversexUserActivities" || _collectionName == "UniversexUserLocations") {
                if (role == "user") {
                    if (userId != isRecordExists.user._id) {
                        return { success: false, message: "Access Denied!" }
                    }
                }
            }
            if (_collectionName == "UniversexPoints") {
                if (role == "user") {
                    return {
                        success: false,
                        message: "Access Denied!",
                    }
                }
            }

            if (_collectionName == "UniversexWithdrawalComments") {
                if (role == "user") {
                    return {
                        success: false,
                        message: "Access Denied!",
                    }
                }
            }

            const isRecordExists = await collectionName.findByIdAndDelete(id);

            if (!isRecordExists) {
                return { success: false, message: "No Record found" }
            }


            return {
                success: true,
                message: "Record deleted successfully"
            }
        } catch (error) {
            console.log("Error in deleteSingleRecord and error is : ", error)
            return {
                success: false,
                message: "Something went wrong, Please try again"
            }
        }
    }
}

// generating new notification
const generateNewNotification = async (user, id, description, type) => {
    if (!user || !id || !description || !type) {
        return false
    }

    let sendingData = {
        user: user,
        description: description,
    }

    if (type == "Activity") {
        sendingData = { ...sendingData, activity: id }
    } else if (type == "widthDrawl") {
        sendingData = { ...sendingData, withdrawl: id }
    }

    const newNotification = new Notifications({ ...sendingData })
    try {
        let isCreated = await newNotification.save();
        if (isCreated) {
            return true
        }
    } catch (err) {
        console.log("===error ehile generating notifcation", err)
        return false
    }

}

// generating new transaction record
const generateTransactionRecord = async (user, token) => {
    if (!user || !token) {
        return false
    }

    let sendingData = {
        user: user,
        noOfTokens: token,
        isWithdraw: true
    }

    const newTransaction = new Transactions({ ...sendingData })
    try {
        let isCreated = await newTransaction.save();
        if (isCreated) {
            return true
        }
    } catch (err) {
        console.log("===error while making transaction", err)
        return false
    }

}



module.exports = {
    addNewRecord,
    fetchSingleRecord,
    fetchAllRecords,
    updateSingleRecord,
    deleteSingleRecord
}