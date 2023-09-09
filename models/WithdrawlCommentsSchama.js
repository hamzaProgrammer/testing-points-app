const mongoose = require("mongoose");
const autoPopulate = require('mongoose-autopopulate');

const commentSchema = new mongoose.Schema({
    withdrawlRequest: {
        type: mongoose.Schema.ObjectId,
        ref: "UniversexWithdrawalRequests",
        autopopulate: true,
    },
    addedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "UniversexUsers",
        autopopulate: true,
    },
    comment: {
        type: String,
        required: true
    },
});


commentSchema.plugin(autoPopulate);

commentSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.withdrawlRequest;
    },
});

const UniversexWithdrawalComments = mongoose.model("UniversexWithdrawalComments", commentSchema);

module.exports = UniversexWithdrawalComments;