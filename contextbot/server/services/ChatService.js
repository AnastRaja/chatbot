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
    async handleIncomingMessage(projectId, sessionId, text, pageContext) {
        let session;

        // 1. Validate Project
        const project = await Project.findOne({ id: projectId });
        if (!project) throw new Error('Project not found');

        // 2. Get or Create Session
        const mongoose = require('mongoose');

        if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
            const foundSession = await ChatSession.findById(sessionId);
            // Security Check: Ensure session belongs to the requesting project
            if (foundSession && foundSession.projectId === projectId) {
                session = foundSession;
            } else if (foundSession) {
                console.warn(`[ChatService] Session ${sessionId} mismatch. Req Project: ${projectId}, Session Project: ${foundSession.projectId}. Creating new session.`);
                // Do NOT use this session. Fall through to create new.
            }
        }

        if (!session) {
            session = await ChatSession.create({ projectId });
            console.log(`[ChatService] Created new session ${session._id} for project ${projectId}`);
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

        // Attach Page Context if available
        if (pageContext) {
            project.pageContext = pageContext;
        }

        console.log('[ChatService] Messages for AI:', JSON.stringify(messagesForAI, null, 2));

        // 7. Generate AI Response
        let botResponseText = await AIService.generateResponse(project, messagesForAI);
        let leadDataExtracted = null;

        // 7.5 Parse Hidden LEAD_DATA
        const leadDataRegex = /\[\[LEAD_DATA:\s*({.*?})\]\]/;
        const match = botResponseText.match(leadDataRegex);

        if (match && match[1]) {
            try {
                leadDataExtracted = JSON.parse(match[1]);
                console.log('[ChatService] Extracted Hidden Lead Data:', leadDataExtracted);

                // Remove the hidden block from the response sent to the user
                botResponseText = botResponseText.replace(match[0], '').trim();
            } catch (e) {
                console.error('[ChatService] Failed to parse LEAD_DATA JSON:', e);
            }
        }

        // 8. Save Bot Message
        await Message.create({
            chatSessionId: session._id,
            projectId: projectId,
            sender: 'bot',
            content: botResponseText
        });

        // 9. Process Extracted Leads (Both Regex and AI-JSON)
        // We combine the raw regex extraction with the high-quality AI extraction
        this.processLeadExtraction(project, session, text, leadDataExtracted).catch(err => console.error(err));

        return {
            response: botResponseText,
            sessionId: session._id // Return ID so client can reuse it
        };
    }

    async processLeadExtraction(project, session, text, aiLeadData = null) {
        // 1. Regex Extraction (Backup/Basic)
        const regexLeadInfo = extractLeads(text);

        // 2. Merge with AI Data
        const finalLeadData = { ...regexLeadInfo };
        if (aiLeadData) {
            finalLeadData.isLead = true; // AI found something
            // Merge arrays if AI found emails/phones
            if (aiLeadData.email) finalLeadData.emails = [...(finalLeadData.emails || []), aiLeadData.email];
            if (aiLeadData.phone) finalLeadData.phones = [...(finalLeadData.phones || []), aiLeadData.phone];

            // Add specific fields
            if (aiLeadData.name) finalLeadData.name = aiLeadData.name;
            if (aiLeadData.country) finalLeadData.country = aiLeadData.country;
        }

        if (finalLeadData.isLead) {
            // Deduplicate input data immediately
            if (finalLeadData.emails) finalLeadData.emails = [...new Set(finalLeadData.emails)];
            if (finalLeadData.phones) finalLeadData.phones = [...new Set(finalLeadData.phones)];

            // Find existing lead: Check Session ID OR matching Email/Phone in this project
            const searchConditions = [{ chatSessionId: session._id }];

            if (finalLeadData.emails && finalLeadData.emails.length > 0) {
                searchConditions.push({ 'contactDetails.emails': { $in: finalLeadData.emails } });
            }
            if (finalLeadData.phones && finalLeadData.phones.length > 0) {
                searchConditions.push({ 'contactDetails.phones': { $in: finalLeadData.phones } });
            }

            const existing = await Lead.findOne({
                projectId: project.id,
                $or: searchConditions
            });

            if (existing) {
                // Smart Merge to avoid overwriting existing data with empty arrays
                const current = existing.contactDetails || {};

                // Combine arrays (Existing + New found in this message)
                const combinedEmails = [...(current.emails || []), ...(finalLeadData.emails || [])];
                const combinedPhones = [...(current.phones || []), ...(finalLeadData.phones || [])];

                // Deduplicate
                const uniqueEmails = [...new Set(combinedEmails)];
                const uniquePhones = [...new Set(combinedPhones)];

                // Prepare updated object
                const updatedDetails = {
                    ...current,
                    emails: uniqueEmails,
                    phones: uniquePhones
                };

                // Only overwrite scalar fields if new valid data is provided
                if (finalLeadData.name) updatedDetails.name = finalLeadData.name;
                if (finalLeadData.country) updatedDetails.country = finalLeadData.country;

                existing.contactDetails = updatedDetails;
                // Update session ID to latest interaction if different? Maybe not, keep original trace.
                // But we could update a "lastSessionId" if we had one.

                await existing.save();
                console.log(`[Lead] Updated lead for project ${project.id}. Data:`, JSON.stringify(updatedDetails));
            } else {
                await Lead.create({
                    projectId: project.id,
                    chatSessionId: session._id,
                    rawMessage: text, // First context
                    contactDetails: finalLeadData // Already deduplicated above
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
