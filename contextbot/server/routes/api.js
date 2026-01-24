// server/routes/api.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Project = require('../models/Project'); // Use Mongoose Model
const { crawlAndSummarize } = require('../utils/crawler');
const { getChatCompletion } = require('../utils/ai');
const { extractLeads } = require('../utils/leadExtractor');

// GET /api/stats
router.get('/stats', async (req, res) => {
    try {
        const profilesCount = await Project.countDocuments();

        // Aggregation to count leads and chats across all projects
        const stats = await Project.aggregate([
            {
                $group: {
                    _id: null,
                    totalLeads: { $sum: { $size: "$leads" } },
                    totalChats: { $sum: { $size: "$chats" } }
                }
            }
        ]);

        const leadsCount = stats[0]?.totalLeads || 0;
        const chatsCount = stats[0]?.totalChats || 0;

        res.json({ profiles: profilesCount, leads: leadsCount, active_chats: chatsCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/profiles
router.get('/profiles', async (req, res) => {
    try {
        const projects = await Project.find();
        // Convert array to object key-value map for frontend compatibility
        const profilesMap = {};
        projects.forEach(p => {
            profilesMap[p.id] = p;
        });
        res.json(profilesMap);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/crawl
router.post('/crawl', async (req, res) => {
    const { url } = req.body;

    if (!url || !/^https?:\/\//.test(url)) {
        return res.status(400).json({ error: 'Invalid URL provided' });
    }

    try {
        const summary = await crawlAndSummarize(url);
        res.json({ success: true, summary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/profiles (Create/Update)
router.post('/profiles', async (req, res) => {
    const { id, name, context, widgetColor } = req.body;
    let bizId = id;

    try {
        // Check if updating or creating
        let project;
        if (bizId) {
            project = await Project.findOne({ id: bizId });
        }

        if (project) {
            // Update
            project.name = name || project.name;
            project.context = context || project.context;
            project.widgetColor = widgetColor || project.widgetColor;
            await project.save();
        } else {
            // Create
            bizId = bizId || uuidv4();
            project = await Project.create({
                id: bizId,
                name: name || 'Untitled Business',
                context: context || {},
                widgetColor: widgetColor || '#2563eb'
            });
        }

        res.json({ success: true, id: bizId, profile: project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save project' });
    }
});

// GET /api/leads
router.get('/leads', async (req, res) => {
    try {
        const projects = await Project.find({}, 'leads');
        const allLeads = projects.flatMap(p => p.leads);
        // Sort by timestamp desc
        allLeads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json(allLeads);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/chat
router.post('/chat', async (req, res) => {
    const { bizId, message, chatId } = req.body;

    try {
        const project = await Project.findOne({ id: bizId });
        if (!project) {
            return res.status(404).json({ error: 'Business ID not found' });
        }

        const sessionId = chatId || uuidv4();

        // 1. Lead Extraction
        const leadInfo = extractLeads(message);
        if (leadInfo.isLead) {
            project.leads.push({
                id: uuidv4(),
                timestamp: new Date(),
                details: leadInfo,
                rawMessage: message,
                chatId: sessionId,
                businessName: project.name
            });
        }

        // 2. Chat Log (User)
        project.chats.push({
            sender: 'user',
            text: message,
            timestamp: new Date()
        });

        // 3. AI Response
        const systemPrompt = `You are a helpful assistant for ${project.name}. 
        Use this business context to answer questions: ${JSON.stringify(project.context)}.
        Be concise, friendly, and helpful. If you don't know, ask the user to contact parsing provided contact info.`;

        const response = await getChatCompletion([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
        ]);

        project.chats.push({
            sender: 'bot',
            text: response,
            timestamp: new Date()
        });

        await project.save();

        res.json({ response, chatId: sessionId });
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ error: 'AI Error' });
    }
});

module.exports = router;
