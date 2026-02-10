const mongoose = require('mongoose');
const ChatService = require('./services/ChatService');
const Project = require('./models/Project');
const Lead = require('./models/Lead');
require('dotenv').config();

async function runTest() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const testBizId = 'test-biz-id-' + Date.now();
        const testChatId = 'test-chat-' + Date.now();

        console.log(`Creating test project: ${testBizId}`);
        await Project.create({
            id: testBizId,
            userId: 'test-user',
            name: 'Test Business Corp',
            settings: { leadGenEnabled: true }
        });

        console.log('Sending message 1...');
        await ChatService.handleIncomingMessage(testBizId, testChatId, "Hi, I'm interested in your product.", {});

        console.log('Sending message 2 (with lead info)...');
        await ChatService.handleIncomingMessage(testBizId, testChatId, "My name is Alice Smith, email is alice@example.com, phone 555-0123. I'm from Wonderland Inc.", {});

        console.log('Waiting for async processing (if any)...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for AI processing

        console.log('Checking Leads...');
        const leads = await Lead.find({ projectId: testBizId });
        console.log(`Found ${leads.length} leads.`);

        if (leads.length > 0) {
            console.log('Lead Data:', JSON.stringify(leads[0], null, 2));
            if (leads[0].businessName === 'Test Business Corp') {
                console.log('SUCCESS: Business Name populated correctly from Project.');
            } else {
                console.log(`FAILURE: Business Name mismatch. Expected 'Test Business Corp', got '${leads[0].businessName}'`);
            }
            if (leads[0].name === 'Alice Smith') console.log('SUCCESS: Name extracted.');
            if (leads[0].email === 'alice@example.com') console.log('SUCCESS: Email extracted.');
            if (leads[0].phone === '555-0123') console.log('SUCCESS: Phone extracted.');
        } else {
            console.log('FAILURE: No leads found.');
        }

        // Cleanup
        console.log('Cleaning up...');
        await Project.deleteOne({ id: testBizId });
        await Lead.deleteMany({ projectId: testBizId });
        await mongoose.disconnect();

    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
}

runTest();
