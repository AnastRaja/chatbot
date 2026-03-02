const express = require('express');
const router = express.Router();
const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');
const Project = require('../models/Project');
const wsManager = require('../utils/websocket');
const auth = require('../middleware/auth');
const AIService = require('../services/AIService');

// Generate Chat Summary
router.post('/:projectId/session/:sessionId/summary', auth, async (req, res) => {
    try {
        const { projectId, sessionId } = req.params;
        const project = await Project.findOne({ id: projectId, userId: req.user.uid });
        if (!project) return res.status(403).json({ error: 'Unauthorized' });

        const session = await ChatSession.findById(sessionId);
        if (!session || session.projectId !== projectId) return res.status(404).json({ error: 'Session not found' });

        const messages = await Message.find({ chatSessionId: sessionId }).sort({ timestamp: 1 }).lean();

        if (messages.length === 0) {
            return res.json({ summary: "No messages to summarize." });
        }

        const summary = await AIService.generateChatSummary(messages);

        res.json({ summary });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all active sessions for a project
router.get('/:projectId/sessions', auth, async (req, res) => {
    try {
        const { projectId } = req.params;
        // Verify project belongs to user
        const project = await Project.findOne({ id: projectId, userId: req.user.uid });
        if (!project) return res.status(403).json({ error: 'Unauthorized' });

        const sessions = await ChatSession.find({ projectId, status: 'active' })
            .sort({ lastMessageAt: -1 })
            .lean();

        // Fetch last message for each session
        for (let session of sessions) {
            const lastMessage = await Message.findOne({ chatSessionId: session._id }).sort({ timestamp: -1 }).lean();
            session.lastMessage = lastMessage?.content || 'Started chat';
        }

        res.json(sessions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Takeover a session
router.post('/:projectId/session/:sessionId/takeover', auth, async (req, res) => {
    try {
        const { projectId, sessionId } = req.params;
        const project = await Project.findOne({ id: projectId, userId: req.user.uid });
        if (!project) return res.status(403).json({ error: 'Unauthorized' });

        const session = await ChatSession.findById(sessionId);
        if (!session || session.projectId !== projectId) return res.status(404).json({ error: 'Session not found' });

        session.isAgentActive = true;
        session.agentId = req.user.uid;
        await session.save();

        wsManager.broadcastToDashboard('SESSION_UPDATED', session);

        // Notify widget that an agent joined
        wsManager.sendToWidget(sessionId, 'AGENT_JOINED', { agentName: req.user.email || 'Support Agent' });

        // Generate summary asynchronously and send via WS
        Message.find({ chatSessionId: sessionId }).sort({ timestamp: 1 }).lean().then(async (messages) => {
            if (messages.length > 0) {
                try {
                    const summary = await AIService.generateChatSummary(messages);
                    wsManager.broadcastToDashboard('SESSION_SUMMARY', { sessionId, summary });
                } catch (summaryErr) {
                    console.error('Initial summary generation failed:', summaryErr);
                }
            }
        });

        res.json({ success: true, session });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// End a session (admin ends the chat)
router.post('/:projectId/session/:sessionId/end', auth, async (req, res) => {
    try {
        const { projectId, sessionId } = req.params;
        const project = await Project.findOne({ id: projectId, userId: req.user.uid });
        if (!project) return res.status(403).json({ error: 'Unauthorized' });

        const session = await ChatSession.findById(sessionId);
        if (!session || session.projectId !== projectId) return res.status(404).json({ error: 'Session not found' });

        session.status = 'closed';
        session.isAgentActive = false;
        session.endedAt = new Date();
        await session.save();

        // Broadcast to dashboard so it disappears from active sessions
        wsManager.broadcastToDashboard('SESSION_UPDATED', session);

        // Notify the visitor widget that the chat has ended
        wsManager.sendToWidget(sessionId, 'CHAT_ENDED', {
            message: 'The support agent has ended this chat. Thank you for reaching out!'
        });

        res.json({ success: true, session });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get messages for a session
router.get('/:projectId/session/:sessionId/messages', auth, async (req, res) => {
    try {
        const { projectId, sessionId } = req.params;
        const project = await Project.findOne({ id: projectId, userId: req.user.uid });
        if (!project) return res.status(403).json({ error: 'Unauthorized' });

        const messages = await Message.find({ chatSessionId: sessionId }).sort({ timestamp: 1 }).lean();
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Agent sends a message
router.post('/:projectId/session/:sessionId/message', auth, async (req, res) => {
    try {
        const { projectId, sessionId } = req.params;
        const { content } = req.body;

        const project = await Project.findOne({ id: projectId, userId: req.user.uid });
        if (!project) return res.status(403).json({ error: 'Unauthorized' });

        const session = await ChatSession.findById(sessionId);
        if (!session || session.projectId !== projectId) return res.status(404).json({ error: 'Session not found' });

        const msg = await Message.create({
            chatSessionId: sessionId,
            projectId: projectId,
            sender: 'agent',
            content: content
        });

        session.lastMessageAt = new Date();
        await session.save();

        // Broadcast to dashboard
        wsManager.broadcastToDashboard('NEW_MESSAGE', msg);
        // Send to widget
        wsManager.sendToWidget(sessionId, 'NEW_MESSAGE', msg);

        res.json(msg);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
