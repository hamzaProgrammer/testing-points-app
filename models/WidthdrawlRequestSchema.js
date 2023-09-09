const mongoose = require("mongoose");
const autoPopulate = require('mongoose-autopopulate');

const WithdrawalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexUsers",
            required: true,
            autopopulate: true,
        },
        tokens: {
            type: Number,
            required: true
        },
        approvedTokens: {
            type: Number,
            default: "0"
        },
        status: {
            type: String,
            default: "Pending",
            enum: ["Pending", "Rejected", "Approved"]
        },
        notes: {
            type: String,
            default: ""
        },
        walletPubKey: {
            type: String,
            default: ""
        },
        adminComments: [{
            type: mongoose.Schema.ObjectId,
            ref: "UniversexWithdrawalComments",
            autopopulate: true,
        }]
    },
    { versionKey: false, timestamps: true }
);

WithdrawalSchema.plugin(autoPopulate);

const UniversexWithdrawalRequests = mongoose.model("UniversexWithdrawalRequests", WithdrawalSchema);

module.exports = UniversexWithdrawalRequests;