const mongoose = require("mongoose");
const autoPopulate = require('mongoose-autopopulate');

const UserNoteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "UniversexUsers",
        autopopulate: true,
        required: true
    },
    addedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "UniversexUsers",
        required: true,
        autopopulate: true,
    },
    comment: {
        type: String,
        required: true
    },
    
}, { versionKey: false, timestamps: true });


UserNoteSchema.plugin(autoPopulate);

UserNoteSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.user;
    },
});

const UniversexUsersNotes = mongoose.model("UniversexUsersNotes", UserNoteSchema);

module.exports = UniversexUsersNotes;