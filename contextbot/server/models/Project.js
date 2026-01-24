const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
}, { _id: false });

const LeadSchema = new mongoose.Schema({
    id: { type: String },
    timestamp: { type: Date, default: Date.now },
    details: { type: Object }, // Contains emails, phones
    rawMessage: { type: String },
    chatId: { type: String },
    businessName: { type: String }
});

const ProjectSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Custom ID/Slug
    name: { type: String, required: true },
    context: {
        description: String,
        contact: Object,
        services: [String],
        pricing: Object,
        hours: String,
        socialMedia: Object,
        widgetColor: String
    },
    widgetColor: { type: String, default: '#2563eb' },
    chats: [ChatSchema],
    leads: [LeadSchema],
    createdAt: { type: Date, default: Date.now }
});

// For now, embedding leads/chats in Project for simplicity, 
// mimicking the DataStore structure.
// In a larger app, you'd likely reference them.

module.exports = mongoose.model('Project', ProjectSchema);
