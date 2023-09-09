const mongoose = require("mongoose");
const autoPopulate = require('mongoose-autopopulate');

const TransactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexUsers",
            required: true,
            autopopulate: true,
        },
        noOfTokens: {
            type: Number,
            required: true
        },
        pointsTraded: {
            type: Number,
        },
        type: {
            // debit or credit
            type: String,
        },
        isWithdraw: {
            type: Boolean,
            default: false,
        },
        walletPubKey: {
            type: String,
        },
    },
    { versionKey: false, timestamps: true }
);

TransactionSchema.plugin(autoPopulate);

const UniversexTransactions = mongoose.model("UniversexTransactions", TransactionSchema);

module.exports = UniversexTransactions;
