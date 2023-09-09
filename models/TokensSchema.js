const mongoose = require("mongoose");

const TokensSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    hashedKey: {
        type: String,
    },
    expireAt: {
        type: Date,
    },
}, {
    timestamps: true
});


const UniversexTokens = mongoose.model('UniversexTokens', TokensSchema);

module.exports = UniversexTokens