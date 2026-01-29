const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    uid: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    name: { type: String },
    provider: { type: String }, // password | google
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
