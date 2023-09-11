const mongoose = require("mongoose");
const autoPopulate = require('mongoose-autopopulate');

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            default: ""
        },
        lastName: {
            type: String,
            default: ""
        },
        username: {
            type: String,
            required: true
        },
        role: {
            type: String,
            default: "user",
            required: true,
            enum: ["user", "admin", "superAdmin"]
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            default: "0000000000"
        },
        password: {
            type: String,
            required: true
        },
        verificationCode: {
            type: Number,
            default: null
        },
        country: {
            type: String,
            default: ""
        },
        dateOfBirth: {
            type: Date,
            default: null
        },
        defaultLanguage: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isGPSAllowed: {
            type: Boolean,
            default: false,
        },
        isMetaMask: {
            type: Boolean,
            default: false,
        },
        locationVerified: {
            type: Boolean,
            default: false,
        },
        lastLogin: {
            type: Date,
            default: null
        },
        image: {
            type: String,
            default: ""
        },
        tokens: {
            type: Number,
            default: 0
        },
        publishableKey: {
            type: String,
            default: ""
        },
        currentLocation: {
            type: Array,
            default: []
        },
        twoFactorAuthKey: {
            type: String,
            default: ""
        },
    },
    { versionKey: false, timestamps: true }
);

userSchema.plugin(autoPopulate);

// Exclude the password field from query results by default
userSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password;
        //delete ret.isActive;
        delete ret.phone;
        //delete ret.isVerified;
        delete ret.isGPSAllowed;
        //delete ret.isMetaMask;
        delete ret.locationVerified;
        delete ret.lastLogin;
        //delete ret.tokens;
        delete ret.role
        //delete ret.publishableKey
    },
});

const UniversexUsers = mongoose.model("UniversexUsers", userSchema);

module.exports = UniversexUsers;
