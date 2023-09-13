const mongoose = require("mongoose");
const autoPopulate = require('mongoose-autopopulate');

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexUsers",
            autopopulate: true,
        },
        id: {
            type: String,
        },
        activity: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexActivities",
            autopopulate: true,
        },
        transaction: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexTransactions",
            //required: true,
            autopopulate: true,
        },
        withdrawl: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexWithdrawalRequests",
            autopopulate: true,
        },
        description: {
            type: String,
            required: true
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: ""
        },
        readBy: [{
            type: mongoose.Schema.ObjectId,
            ref: "UniversexUsers",
        }],
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexUsers",
            autopopulate: true,
        },
        activityId: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexActivities",
            autopopulate: true,
        },
        pointId: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexPoints",
            autopopulate: true,
        },
        settingId: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexSettings",
            autopopulate: true,
        },
        tokenId: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexTokens",
            autopopulate: true,
        },
        transactionId: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexTransactions",
            autopopulate: true,
        },
        userActivityId: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexUsers",
            autopopulate: true,
        },
        vehicleId: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexVehicles",
            autopopulate: true,
        },
        withdrawId: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexWithdrawalRequests",
            autopopulate: true,
        },
        withDrawComment: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexWithdrawalComments",
            autopopulate: true,
        },
        userNote: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexUsersNotes",
            autopopulate: true,
        },
    },
    { versionKey: false, timestamps: true }
);

notificationSchema.plugin(autoPopulate);

const UniversexNotifications = mongoose.model("UniversexNotifications", notificationSchema);

module.exports = UniversexNotifications;
