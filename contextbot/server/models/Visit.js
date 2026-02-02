const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
        index: true
    },
    visitorId: {
        type: String, // Unique ID stored in localStorage
        required: true
    },
    sessionId: {
        type: String, // Unique ID per session
        required: true
    },
    url: {
        type: String,
        required: true
    },
    pageTitle: {
        type: String
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    lastHeartbeat: {
        type: Date,
        default: Date.now
    },
    duration: {
        type: Number, // In seconds
        default: 0
    },
    userAgent: String,
    device: String
}, { timestamps: true });

module.exports = mongoose.model('Visit', VisitSchema);
