const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true }, // Custom ID/Slug
    userId: { type: String, required: true, index: true }, // Firebase UID link
    userEmail: { type: String, required: false, index: true }, // Firebase Email link
    name: { type: String, required: true },
    context: { type: Object, default: {} },
    widgetColor: { type: String, default: '#2563eb' },
    settings: {
        aiModel: { type: String, default: 'gpt-4o' },
        tone: { type: String, default: 'helpful' },
        leadGenEnabled: { type: Boolean, default: true },
        agentName: { type: String, default: 'Support Agent' },
        agentAvatar: { type: String, default: '' },
        welcomeMessage: { type: String, default: 'Hello! How can I help you today?' },
        autoOpenDelay: { type: Number, default: 5000 }, // 0 to disable
        systemPrompt: { type: String, default: '' }
    },
    quickQuestions: {
        type: [{
            question: { type: String, required: true },
            answer: { type: String, default: '' }
        }],
        default: []
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);
