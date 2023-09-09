const mongoose = require("mongoose");
const autoPopulate = require('mongoose-autopopulate');

const PointsSchema = new mongoose.Schema(
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
        vehicleType: {
            type: String,
            required: true
        },
        comment: {
            type: String,
            default: ""
        },
        pointTransferred: {
            type: Number,
            required: true
        },
        startingCoordinates: {
            type: Array,
            required: true
        },
        endingCoordinates: {
            type: Array,
            required: true
        },
        totalTime: {
            type: Date,
            default: null
        },
        is_converted  : {
            type : Boolean,
            default : false
        },
        is_approved:{
            type : Boolean,
            default : true
        }
    },
    { versionKey: false, timestamps: true }
);

PointsSchema.plugin(autoPopulate);

const UniversexPoints = mongoose.model("UniversexPoints", PointsSchema);

module.exports = UniversexPoints;
