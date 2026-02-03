const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    uid: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    name: { type: String },
    provider: { type: String }, // password | google
    subscription: {
        plan: { type: String, enum: ['free', 'starter', 'pro'], default: 'free' },
        status: { type: String, enum: ['active', 'past_due', 'canceled', 'incomplete'], default: 'active' },
        billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        stripeCustomerId: { type: String }
    },
    usage: {
        aiResponses: { type: Number, default: 0 },
        projectsCreated: { type: Number, default: 0 },
        storageUsed: { type: Number, default: 0 }, // in bytes
        lastUsageReset: { type: Date, default: Date.now }
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
