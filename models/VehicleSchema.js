const mongoose = require("mongoose");
const autoPopulate = require('mongoose-autopopulate');

const vehicleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        image: {
            type: String,
            //required: true
        },
        description: {
            type: String,
        },
        requireGPS: {
            type: Boolean,
        },
        isDistanceBased: {
            type: Boolean,
        },
        distanceUnit: {
            type: String,
        },
        isActivityBased: {
            type: Boolean,
        },
        pointsPerUnit: {
            type: Number,
        },
        maxPointAllowed: {
            type: Number,
        },
        maxDistanceAllowed: {
            type: Number,
        },
        wetOutPoints: {
            type: Number,
        },
        repairPointsTarget: {
            type: Number,
        },
        pointsPerUnit: {
            type: Number,
        },
        price: {
            type: Number,
        },
        addedBy: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexUsers",
            required: true,
            autopopulate: true,
        },
    },
    { versionKey: false, timestamps: true }
);

vehicleSchema.plugin(autoPopulate);

const UniversexVehicles = mongoose.model("UniversexVehicles", vehicleSchema);

module.exports = UniversexVehicles;
