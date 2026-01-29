const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');
const Lead = require('../models/Lead');
const Project = require('../models/Project'); // Need project for validation
const { v4: uuidv4 } = require('uuid');
const AIService = require('./AIService');
const DocumentService = require('./DocumentService');
const { extractLeads } = require('../utils/leadExtractor');

class ChatService {

    /**
     * Handles an incoming message from the widget.
     * Creates session if needed, saves user message, calls AI, saves bot response.
     */
    async handleIncomingMessage(projectId, sessionId, text) {
        let session;

        // 1. Validate Project
        const project = await Project.findOne({ id: projectId });
        if (!project) throw new Error('Project not found');

        // 2. Get or Create Session
        const mongoose = require('mongoose');

        if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
            session = await ChatSession.findById(sessionId);
        }

        if (!session) {
            session = await ChatSession.create({ projectId });
        }

        // 3. Save User Message
        await Message.create({
            chatSessionId: session._id,
            projectId: projectId,
            sender: 'user',
            content: text
        });

        // 4. Update Session Timestamp
        session.lastMessageAt = new Date();
        await session.save();

        // 5. Lead Extraction (Async - don't block response)
        this.processLeadExtraction(project, session, text).catch(err => console.error(err));

        // 6. Get Chat History for Context
        // Get LAST 10 messages (descending), then reverse to be chronological
        const history = await Message.find({ chatSessionId: session._id })
            .sort({ timestamp: -1 })
            .limit(10);

        const chronologicalHistory = history.map(m => m).reverse();

        const messagesForAI = chronologicalHistory.map(m => ({
            role: m.sender === 'bot' ? 'assistant' : 'user',
            content: m.content
        }));

        // 6.5 Retrieve RAG Context
        console.log(`[ChatService] Retrieving relevant documents for query: "${text}"`);
        let ragContext = "";
        try {
            // Generate embedding for the USER'S last message (the query)
            // We use the raw 'text' variable passed to the function
            const queryEmbedding = await AIService.generateEmbedding(text);

            // Find similar chunks
            const relevantChunks = await DocumentService.findRelevantChunks(projectId, queryEmbedding, 3);

            if (relevantChunks.length > 0) {
                console.log(`[ChatService] Found ${relevantChunks.length} relevant document chunks.`);
                ragContext = relevantChunks.map(c => c.text).join("\n\n---\n\n");
            } else {
                console.log('[ChatService] No relevant documents found.');
            }
        } catch (ragError) {
            console.error('[ChatService] RAG Error:', ragError);
            // Continue without RAG if it fails (don't break chat)
        }

        // Add RAG context to the system prompt (or as a system message)
        // We handle this by passing it to AIService.generateResponse
        // But AIService currently takes (project, messages). 
        // We will modify the messages array to include the context in the LAST system message,
        // or inject a new system message if appropriate.
        // A simple way is to append it to the context stored in the project object briefly, 
        // but that's a mutable side-effect.
        // Better: Pass it as an argument or modify system prompt. 
        // We'll update AIService to accept optional contextText.

        // Actually, let's just create a clear system message update here if AIService allows.
        // But AIService.generateResponse constructs the system prompt internally.
        // Modifying AIService signature is best.
        // For now, let's attach it to the project object temporarily as `ragContext` 
        // and update AIService to look for it.
        if (ragContext) {
            project.ragContext = ragContext;
        }

        console.log('[ChatService] Messages for AI:', JSON.stringify(messagesForAI, null, 2));

        // 7. Generate AI Response
        const botResponseText = await AIService.generateResponse(project, messagesForAI);

        // 8. Save Bot Message
        await Message.create({
            chatSessionId: session._id,
            projectId: projectId,
            sender: 'bot',
            content: botResponseText
        });

        return {
            response: botResponseText,
            sessionId: session._id // Return ID so client can reuse it
        };
    }

    async processLeadExtraction(project, session, text) {
        const leadInfo = extractLeads(text);
        if (leadInfo.isLead) {
            // Check if lead already exists for this session to avoid duplicates
            const existing = await Lead.findOne({ chatSessionId: session._id });

            if (existing) {
                // Update existing lead with new info if found
                Object.assign(existing.contactDetails, leadInfo);
                await existing.save();
            } else {
                await Lead.create({
                    projectId: project.id,
                    chatSessionId: session._id,
                    contactDetails: leadInfo,
                    rawMessage: text,
                    source: 'chat_widget'
                });
                console.log(`[Lead] New lead captured for project ${project.id}`);
            }
        }
    }

    async getProjectLeads(projectId) {
        return await Lead.find({ projectId }).sort({ createdAt: -1 });
    }

    async getProjectStats(projectId) {
        // ... implementation for stats ...
    }
}

module.exports = new ChatService();
