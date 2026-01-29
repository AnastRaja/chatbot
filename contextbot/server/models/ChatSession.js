const mongoose = require('mongoose');

const ChatSessionSchema = new mongoose.Schema({
    projectId: {
        type: String,
        ref: 'Project',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'archived'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    metadata: {
        device: String,
        ip: String,
        userAgent: String
    }
});

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
