const mongoose = require("mongoose");
const autoPopulate = require('mongoose-autopopulate');

const userLocationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexUsers",
            required: true,
            autopopulate: true,
        },
        activity: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexUserActivities",
            required: true,
            autopopulate: true,
        },
        vehicle: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexVehicles",
            required: true,
            autopopulate: true,
        },
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        },
    },
    { versionKey: false, timestamps: true }
);

userLocationSchema.plugin(autoPopulate)

const UniversexUserLocations = mongoose.model("UniversexUserLocations", userLocationSchema);

module.exports = UniversexUserLocations;