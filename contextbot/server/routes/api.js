// server/routes/api.js
const express = require('express');
const router = express.Router();
const { crawlAndSummarize } = require('../utils/crawler');
const ChatService = require('../services/ChatService');
const ProjectService = require('../services/ProjectService');
const auth = require('../middleware/auth');

// GET /api/stats
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await ProjectService.getUserStats(req.user.uid, req.user.email);
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/profiles
router.get('/profiles', auth, async (req, res) => {
    try {
        const profiles = await ProjectService.getUserProjects(req.user.uid, req.user.email);
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/widget/config/:bizId
router.get('/widget/config/:bizId', async (req, res) => {
    try {
        const { bizId } = req.params;
        const project = await ProjectService.getProject(bizId);

        if (!project) return res.status(404).json({ error: 'Project not found' });

        res.json({
            id: project.id,
            name: project.name,
            widgetColor: project.widgetColor,
            agentName: project.settings?.agentName || 'Support Agent',
            welcomeMessage: project.settings?.welcomeMessage || 'Hello! How can I help you today?',
            autoOpenDelay: project.settings?.autoOpenDelay ?? 5000,
            status: 'online'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Config Load Error' });
    }
});

// POST /api/crawl
router.post('/crawl', auth, async (req, res) => {
    const { url } = req.body;
    if (!url || !/^https?:\/\//.test(url)) return res.status(400).json({ error: 'Invalid URL' });

    try {
        const summary = await crawlAndSummarize(url);
        res.json({ success: true, summary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/profiles (Create/Update)
router.post('/profiles', auth, async (req, res) => {
    try {
        const result = await ProjectService.createOrUpdateProject(req.body, req.user.uid, req.user.email);
        res.json({ success: true, id: result.id, profile: result.project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save project' });
    }
});

// DELETE /api/profiles/:id
router.delete('/profiles/:id', auth, async (req, res) => {
    try {
        await ProjectService.deleteProject(req.params.id, req.user.uid, req.user.email);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// GET /api/leads
// TODO: Add pagination and projectId query param validation
router.get('/leads', auth, async (req, res) => {
    try {
        const Lead = require('../models/Lead');
        const Project = require('../models/Project');

        // Fetch user projects to filter leads
        // Use the same logic as getUserStats - check both ID and Email
        const query = { $or: [{ userId: req.user.uid }] };
        if (req.user.email) query.$or.push({ userEmail: req.user.email });

        const userProjects = await Project.find(query).select('id');
        const projectIds = userProjects.map(p => p.id);

        const allLeads = await Lead.find({ projectId: { $in: projectIds } }).sort({ createdAt: -1 });

        // Map to format expected by frontend (if needed) or send as is
        // The frontend expects { id, details, timestamp, businessName, rawMessage }
        // We might need to populate project name if we want 'businessName'
        // But for speed, let's just return the lead objects. 
        // Note: Frontend might need adjustment if it strictly relies on 'businessName'.

        res.json(allLeads);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/chat
router.post('/chat', async (req, res) => {
    const { bizId, message, chatId } = req.body;

    if (!bizId) return res.status(400).json({ error: 'Business ID required' });

    try {
        const result = await ChatService.handleIncomingMessage(bizId, chatId, message);
        res.json({ response: result.response, chatId: result.sessionId });
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ error: 'AI Error or Project Not Found' });
    }
});




module.exports = router;
