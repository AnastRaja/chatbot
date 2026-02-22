// server/routes/api.js
const express = require('express');
const router = express.Router();
const { crawlAndSummarize } = require('../utils/crawler');
const ChatService = require('../services/ChatService');
const ProjectService = require('../services/ProjectService');
const SubscriptionService = require('../services/SubscriptionService');
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
            agentAvatar: project.settings?.agentAvatar || '',
            welcomeMessage: project.settings?.welcomeMessage || 'Hello! How can I help you today?',
            autoOpenDelay: project.settings?.autoOpenDelay ?? 5000,
            quickQuestions: project.quickQuestions || [],
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
        // Enforce Subscription Limit for New Projects (not updates)
        if (!req.body.id) {
            try {
                await SubscriptionService.checkProjectLimit(req.user.uid);
            } catch (limitErr) {
                return res.status(403).json({ error: limitErr.message });
            }
        }

        const result = await ProjectService.createOrUpdateProject(req.body, req.user.uid, req.user.email);

        // Use increment helper if it's a new project? 
        // Or SubscriptionService counts dynamically. 
        // For 'projectsCreated' usage counter, we can increment to track lifetime creates if needed
        // but dynamic count is safer for limits. Let's stick to dynamic check above.

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

// DELETE /api/leads/:id
router.delete('/leads/:id', auth, async (req, res) => {
    try {
        const Lead = require('../models/Lead');
        const Project = require('../models/Project');

        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        // Security: Check if user owns the project this lead belongs to
        const project = await Project.findOne({ id: lead.projectId });
        // If project is deleted, we might allow deletion, but for now strict check:
        if (project) {
            const isOwner = project.userId === req.user.uid || project.userEmail === req.user.email;
            if (!isOwner) return res.status(403).json({ error: 'Unauthorized' });
        }

        await Lead.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete Lead Error:', error);
        res.status(500).json({ error: 'Failed to delete lead' });
    }
});

// POST /api/chat
router.post('/chat', async (req, res) => {
    const { bizId, message, chatId, pageContext } = req.body;

    if (!bizId) return res.status(400).json({ error: 'Business ID required' });

    try {
        const result = await ChatService.handleIncomingMessage(bizId, chatId, message, pageContext);
        res.json({ response: result.response, chatId: result.sessionId });
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ error: 'AI Error or Project Not Found' });
    }
});

// GET /api/chats
router.get('/chats', auth, async (req, res) => {
    try {
        const fs = require('fs');
        try { fs.appendFileSync('debug_api.log', `[GET /chats] User: ${req.user.uid} (${req.user.email}) - Time: ${new Date().toISOString()}\n`); } catch (e) { }
        const Project = require('../models/Project');
        const ChatSession = require('../models/ChatSession');

        // 1. Get user's projects
        const query = { $or: [{ userId: req.user.uid }] };
        if (req.user.email) query.$or.push({ userEmail: req.user.email });

        const userProjects = await Project.find(query).select('id name');
        const projectMap = {};
        userProjects.forEach(p => projectMap[p.id] = p.name);
        const projectIds = userProjects.map(p => p.id);

        if (projectIds.length === 0) {
            return res.json([]);
        }

        // 2. Find chats for these projects
        const chats = await ChatSession.find({ projectId: { $in: projectIds } })
            .sort({ lastMessageAt: -1 })
            .lean();

        // 3. Attach project name to each chat
        const enrichedChats = chats.map(chat => ({
            ...chat,
            projectName: projectMap[chat.projectId] || 'Unknown Project'
        }));

        res.json(enrichedChats);
    } catch (error) {
        console.error('Fetch Chats Error:', error);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
});

// GET /api/chats/:id/messages
router.get('/chats/:id/messages', auth, async (req, res) => {
    try {
        const Message = require('../models/Message');
        const ChatSession = require('../models/ChatSession');
        const Project = require('../models/Project');

        // Validate access
        const session = await ChatSession.findById(req.params.id);
        if (!session) return res.status(404).json({ error: 'Chat not found' });

        const project = await Project.findOne({ id: session.projectId });
        if (!project) return res.status(404).json({ error: 'Project not found' });

        // Check ownership
        const isOwner = project.userId === req.user.uid || project.userEmail === req.user.email;
        if (!isOwner) return res.status(403).json({ error: 'Unauthorized' });

        const messages = await Message.find({ chatSessionId: req.params.id }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error('Fetch Messages Error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// DELETE /api/chats/:id
router.delete('/chats/:id', auth, async (req, res) => {
    try {
        const Message = require('../models/Message');
        const ChatSession = require('../models/ChatSession');
        const Project = require('../models/Project');

        const session = await ChatSession.findById(req.params.id);
        if (!session) return res.status(404).json({ error: 'Chat not found' });

        const project = await Project.findOne({ id: session.projectId });
        // If project is deleted, we might still want to allow deleting the chat? 
        // But for security we need to check ownership.
        if (project) {
            const isOwner = project.userId === req.user.uid || project.userEmail === req.user.email;
            if (!isOwner) return res.status(403).json({ error: 'Unauthorized' });
        } else {
            // Edge case: Project deleted but chats remain. Allow if admin? 
            // For now, strict check.
            // But valid usecase: user wants to clean up. 
            // We'll skip for now or assume project exists.
        }

        await ChatSession.findByIdAndDelete(req.params.id);
        await Message.deleteMany({ chatSessionId: req.params.id });

        res.json({ success: true });
    } catch (error) {
        console.error('Delete Chat Error:', error);
        res.status(500).json({ error: 'Failed to delete chat' });
    }
});




// POST /api/analytics/track
router.post('/analytics/track', async (req, res) => {
    try {
        let { projectId, visitorId, sessionId, url, pageTitle, eventType } = req.body;
        const Visit = require('../models/Visit');

        if (!projectId) return res.status(400).json({ error: 'Project ID required' });

        projectId = projectId.trim();

        if (eventType === 'view') {
            // New Page View
            const visit = await Visit.create({
                projectId,
                visitorId,
                sessionId,
                url,
                pageTitle: pageTitle || 'Unknown',
                userAgent: req.headers['user-agent']
            });
            return res.json({ success: true, visitId: visit._id });
        }

        if (eventType === 'heartbeat') {
            // Update existing visit
            const { visitId } = req.body;
            if (visitId) {
                const visit = await Visit.findById(visitId);
                if (visit) {
                    visit.lastHeartbeat = new Date();
                    visit.duration = Math.round((visit.lastHeartbeat - visit.startTime) / 1000);
                    await visit.save();
                    return res.json({ success: true });
                }
            }
        }

        res.json({ success: true }); // Acknowledge other events mostly ignored for now
    } catch (error) {
        console.error('Tracking Error:', error);
        res.status(500).json({ error: 'Tracking failed' });
    }
});

// GET /api/analytics/stats/:projectId
router.get('/analytics/stats/:projectId', auth, async (req, res) => {
    try {
        const { projectId } = req.params;
        const Visit = require('../models/Visit');

        // Verify ownership (simple check)
        // In real app, check if req.user has access to projectId

        // 1. Total Visitors & Visits (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const visits = await Visit.find({
            projectId,
            createdAt: { $gte: thirtyDaysAgo }
        });

        const totalVisits = visits.length;
        const uniqueVisitors = new Set(visits.map(v => v.visitorId)).size;

        // 2. Avg Time & Bounce Rate
        const totalDuration = visits.reduce((acc, v) => acc + (v.duration || 0), 0);
        const avgDuration = totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0;

        // Bounce = Duration < 10s (Arbitrary threshold)
        const bouncedVisits = visits.filter(v => v.duration < 10).length;
        const bounceRate = totalVisits > 0 ? Math.round((bouncedVisits / totalVisits) * 100) : 0;

        // 3. Top Pages
        const pageMap = {};
        visits.forEach(v => {
            if (!pageMap[v.url]) pageMap[v.url] = { url: v.url, visits: 0, duration: 0, bounces: 0 };
            pageMap[v.url].visits++;
            pageMap[v.url].duration += v.duration;
            if (v.duration < 10) pageMap[v.url].bounces++;
        });

        const topPages = Object.values(pageMap)
            .sort((a, b) => b.visits - a.visits)
            .slice(0, 5) // Top 5
            .map(p => ({
                url: p.url,
                visits: p.visits,
                avgTime: Math.round(p.duration / p.visits),
                bounceRate: Math.round((p.bounces / p.visits) * 100)
            }));

        // 4. Traffic Chart Data (Last 7 Days)
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const strDate = date.toISOString().split('T')[0];

            const dayVisits = visits.filter(v => v.createdAt.toISOString().startsWith(strDate)).length;
            chartData.push({ date: strDate, visitors: dayVisits });
        }

        res.json({
            uniqueVisitors,
            totalVisits,
            avgDuration,
            bounceRate,
            topPages,
            chartData
        });

    } catch (error) {
        console.error('Analytics Stats Error:', error);
        res.status(500).json({ error: 'Stats failed' });
    }
});

module.exports = router;
