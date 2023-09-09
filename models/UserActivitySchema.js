const mongoose = require("mongoose");
const autoPopulate = require('mongoose-autopopulate');

const userActivitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexUsers",
            autopopulate: true,
        },
        activity: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexActivities",
            autopopulate: true,
        },
        startDateTime: {
            type: Date,
        },
        endDateTime: {
            type: Date,
        },
        startingCoordinates: {
            type: Array,
            required: true
        },
        endingCoordinates: {
            type: Array,
            required: true
        },
    },
    { versionKey: false, timestamps: true }
);

userActivitySchema.plugin(autoPopulate);

const UniversexUserActivities = mongoose.model("UniversexUserActivities", userActivitySchema);

module.exports = UniversexUserActivities;