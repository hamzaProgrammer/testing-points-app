const mongoose = require("mongoose");
const autoPopulate = require('mongoose-autopopulate');

const activitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        requireGPSTracking: {
            type: Boolean,
            default: false
        },
        description: {
            type: String,
        },
        defaultPoints: {
            type: Number,
            required: true
        },
        minPoints: {
            type: Number,
        },
        maxPoints: {
            type: Number,
        },
        limits: {
            type: Number,
        },
        diffLevel: {
            type: String,
            enum: ["easy", "hard", "medium"]
        },
        image: {
            type: String,
            default: ""
        },
        addedBy: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexUsers",
            autopopulate: true,
        },
    },
    { versionKey: false, timestamps: true }
);

activitySchema.plugin(autoPopulate);

const UniversexActivities = mongoose.model("UniversexActivities", activitySchema);

module.exports = UniversexActivities;
