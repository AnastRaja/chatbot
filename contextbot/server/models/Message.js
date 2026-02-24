const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    chatSessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatSession',
        required: true,
        index: true
    },
    projectId: { // Denormalized for easy querying
        type: String,
        required: true,
        index: true
    },
    sender: {
        type: String,
        enum: ['user', 'bot', 'system', 'agent'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    tokenUsage: {
        prompt: Number,
        completion: Number,
        total: Number
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('Message', MessageSchema);
