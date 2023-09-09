const mongoose = require("mongoose");
const autoPopulate = require('mongoose-autopopulate');

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexUsers",
            required: true,
            autopopulate: true,
        },
        activity: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexActivities",
            autopopulate: true,
        },
        // transaction: {
        //     type: mongoose.Schema.ObjectId,
        //     ref: "UniversexUsers",
        //     required: true,
        //     autopopulate: true,
        // },
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
    },
    { versionKey: false, timestamps: true }
);

notificationSchema.plugin(autoPopulate);

const UniversexNotifications = mongoose.model("UniversexNotifications", notificationSchema);

module.exports = UniversexNotifications;
