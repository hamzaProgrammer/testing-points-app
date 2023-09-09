const mongoose = require("mongoose");
const autoPopulate = require('mongoose-autopopulate');

const SettingsSchema = new mongoose.Schema(
    {
        tokensPerTenPoint: {
            type: Number,
            required: true
        },
        lastUpdatedBy: {
            type: mongoose.Schema.ObjectId,
            ref: "UniversexUsers",
            autopopulate: true,
        },
    },
    { versionKey: false, timestamps: true }
);

SettingsSchema.plugin(autoPopulate);

const UniversexSettings = mongoose.model("UniversexSettings", SettingsSchema);

module.exports = UniversexSettings;
