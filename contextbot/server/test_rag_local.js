const mongoose = require('mongoose');
const DocumentService = require('./services/DocumentService');
const connectDB = require('./config/db');
const fs = require('fs');
require('dotenv').config();

// Create dummy file
fs.writeFileSync('test_doc.txt', 'This is a test document content for RAG embedding.');

async function runTest() {
    try {
        await connectDB();

        const file = {
            filename: 'test_doc.txt',
            originalname: 'test_doc.txt',
            path: 'test_doc.txt',
            mimetype: 'text/plain'
        };

        const projectId = 'test-project-id';

        console.log('Starting Document Processing...');
        const doc = await DocumentService.processDocument(file, projectId);
        console.log('Success:', doc);

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        // Cleanup
        if (fs.existsSync('test_doc.txt')) {
            // DocumentService might have deleted it
            // fs.unlinkSync('test_doc.txt'); 
        }
        mongoose.connection.close();
    }
}

runTest();
