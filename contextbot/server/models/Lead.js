const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    projectId: {
        type: String,
        ref: 'Project',
        required: true,
        index: true
    },
    chatSessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatSession',
    },
    contactDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    source: { type: String, default: 'chat_widget' },
    businessName: String,
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'converted', 'archived'],
        default: 'new'
    },
    rawMessage: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Lead', LeadSchema);
