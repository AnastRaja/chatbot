const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
        index: true
    },
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['processing', 'ready', 'error'],
        default: 'processing'
    },
    characterCount: {
        type: Number,
        default: 0
    },
    error: {
        type: String
    }
});

module.exports = mongoose.model('Document', DocumentSchema);
