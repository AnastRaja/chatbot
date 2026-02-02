const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');
require('dotenv').config();

// MOCK AIService to test PDF part first, or real if we want to test connections
const AIService = require('./services/AIService');

async function debug() {
    const filename = '1769883927456-dummy_business_knowledge_base.pdf';
    const filePath = path.join(__dirname, 'uploads', filename);

    console.log(`Checking file: ${filePath}`);
    if (!fs.existsSync(filePath)) {
        console.error('File not found!');
        return;
    }

    try {
        console.log('Reading file...');
        const dataBuffer = fs.readFileSync(filePath);
        console.log(`Buffer size: ${dataBuffer.length}`);

        console.log('Parsing PDF...');
        const data = await pdf(dataBuffer);
        console.log('PDF Parsed!');
        console.log(`Pages: ${data.numpages}`);
        console.log(`Text Length: ${data.text.length}`);

        const text = data.text;
        if (!text || text.trim().length === 0) {
            console.error('Text is empty!');
        }

        console.log('Chunking...');
        const chunks = [];
        for (let i = 0; i < text.length; i += 1000) {
            chunks.push(text.slice(i, i + 1000));
        }
        console.log(`Chunks: ${chunks.length}`);

        console.log('Testing Embedding (First Chunk)...');
        if (chunks.length > 0) {
            const embedding = await AIService.generateEmbedding(chunks[0]);
            console.log('Embedding generated successfully!');
        }

    } catch (e) {
        console.error('ERROR:', e);
    }
}

debug();
