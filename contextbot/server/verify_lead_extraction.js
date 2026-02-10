const fs = require('fs');

function log(msg) {
    fs.appendFileSync('verify_log.txt', msg + '\n');
    console.log(msg);
}

log("Starting Lead Extraction Test...");

// Mock Models
const mockChatSession = {
    _id: 'mock-session-id-123',
    projectId: 'test-biz-id-777',
    lastMessageAt: new Date(),
    save: async () => { }, // Mock save
    findById: async (id) => mockChatSession
};

// Mock Lead Model to verify logic
const leadsDb = [];
const Lead = {
    findOne: async (query) => {
        // Simple mock implementation
        log("Lead.findOne called with query: " + JSON.stringify(query));
        return leadsDb.find(l => l.chatSessionId === 'mock-session-id-123');
    },
    create: async (data) => {
        log("Lead.create called with data: " + JSON.stringify(data));
        const lead = { ...data, _id: 'mock-lead-id-' + Date.now(), save: async () => { } };
        leadsDb.push(lead);
        return lead;
    },
    find: async (query) => leadsDb
};

// Mock Project
const Project = {
    findOne: async () => ({ id: 'test-biz-id-777', name: 'Test Business Inc.' })
};

// Mock AIService - Returning simulated AI extraction
const AIService = {
    generateResponse: async () => {
        log("AIService.generateResponse called");
        return "Thank you! I've noted your details. [[LEAD_DATA: {\"name\":\"John Test\", \"email\":\"john.test@example.com\", \"phone\":\"555-0199\", \"country\":\"Canada\"}]]";
    },
    generateEmbedding: async () => []
};

// Mock DocumentService
const DocumentService = { findRelevantChunks: async () => [] };

// Helper to load ChatService
const loadChatService = () => {
    // We need to intercept require calls to return our mocks
    const Module = require('module');
    const originalRequire = Module.prototype.require;

    Module.prototype.require = function (path) {
        if (path.includes('ChatSession')) return { findById: async () => mockChatSession, create: async () => mockChatSession, findById: async () => mockChatSession };
        if (path.includes('Message')) return { create: async () => { }, find: () => ({ sort: () => ({ limit: () => [] }) }) };
        if (path.includes('Lead')) return Lead;
        if (path.includes('Project')) return Project;
        if (path.includes('AIService')) return AIService;
        if (path.includes('DocumentService')) return DocumentService;
        if (path.includes('leadExtractor')) return { extractLeads: () => ({ isLead: false }) };
        if (path === 'uuid') return { v4: () => 'mock-uuid' };

        return originalRequire.apply(this, arguments);
    };

    // Load the service
    const ChatService = require('./services/ChatService');

    // Restore require
    Module.prototype.require = originalRequire;

    return ChatService;
};

async function runTest() {
    try {
        const ChatService = loadChatService();

        // Test Case: User sends message with contact info
        log("Processing message...");
        const result = await ChatService.handleIncomingMessage(
            'test-biz-id-777',
            'mock-session-id-123',
            "Hi, my name is John Test, email is john.test@example.com",
            {}
        );
        log("handleIncomingMessage returned: " + JSON.stringify(result));

        // Wait a bit for async processing
        log("Waiting for async lead extraction...");
        await new Promise(resolve => setTimeout(resolve, 2000));

        const finalResult = {
            leadsCount: leadsDb.length,
            leads: leadsDb
        };

        fs.writeFileSync('verification_result.json', JSON.stringify(finalResult, null, 2));
        log("Verification complete. Results written to verification_result.json");
        process.exit(0);

    } catch (e) {
        log("Test Failed: " + e.stack);
        fs.writeFileSync('verification_result.json', JSON.stringify({ error: e.toString() }));
        process.exit(1);
    }
}

runTest();
