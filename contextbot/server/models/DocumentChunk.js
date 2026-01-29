const mongoose = require('mongoose');

const DocumentChunkSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
        index: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
        index: true
    },
    text: {
        type: String,
        required: true
    },
    metadata: {
        type: Object
    },
    // Embedding vector (e.g., 1536 dimensions for text-embedding-3-small)
    embedding: {
        type: [Number],
        required: true
    }
});

module.exports = mongoose.model('DocumentChunk', DocumentChunkSchema);
