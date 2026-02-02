const mongoose = require('mongoose');
require('dotenv').config();

const ProjectSchema = new mongoose.Schema({
    id: { type: String, required: true },
    userId: { type: String, required: true },
    userEmail: String,
    name: String
    // ... other fields
});
const Project = mongoose.model('Project', ProjectSchema);

const ChatSessionSchema = new mongoose.Schema({
    projectId: { type: String, required: true },
    status: String,
    createdAt: Date,
    lastMessageAt: Date
});
const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const fs = require('fs');
        const allChats = await ChatSession.find({});
        const projects = await Project.find({});

        const output = {
            totalChats: allChats.length,
            chats: allChats.map(c => ({ id: c._id, projectId: c.projectId, status: c.status })),
            projects: projects.map(p => ({ id: p.id, name: p.name, userId: p.userId, email: p.userEmail }))
        };

        fs.writeFileSync('debug_output.json', JSON.stringify(output, null, 2));
        console.log('Debug output written to debug_output.json');
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
