const mongoose = require('mongoose');
const Document = require('./models/Document');
const DocumentChunk = require('./models/DocumentChunk');
require('dotenv').config();

const PROJECT_ID = '4e681285-fc2f-41b1-bdd0-80c276c8b2cf'; // From logs

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const docs = await Document.find({ projectId: PROJECT_ID });
        console.log(`Found ${docs.length} documents for project ${PROJECT_ID}`);
        docs.forEach(d => console.log(` - Doc: ${d.filename}, Status: ${d.status}, Chars: ${d.characterCount}, ID: ${d._id}`));

        const chunks = await DocumentChunk.find({ projectId: PROJECT_ID });
        console.log(`Found ${chunks.length} chunks for project ${PROJECT_ID}`);

        if (chunks.length > 0) {
            console.log('Sample chunk:', chunks[0].text.substring(0, 50) + '...');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkDB();
