const fs = require('fs');
const pdf = require('pdf-parse');
const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');
const AIService = require('./AIService');

class DocumentService {

    async createDocumentRecord(file, projectId) {
        return await Document.create({
            projectId,
            filename: file.filename,
            originalName: file.originalname,
            status: 'processing'
        });
    }

    async processDocumentBackground(doc, file) {
        console.log(`[DocumentService] Processing file background: ${file.originalname} (Doc ID: ${doc._id})`);

        try {
            // 2. Extract Text
            let text = '';
            if (file.mimetype === 'application/pdf') {
                console.log(`[DocumentService] Reading PDF file from: ${file.path}`);
                if (!fs.existsSync(file.path)) {
                    throw new Error(`File not found at path: ${file.path}`);
                }
                const dataBuffer = fs.readFileSync(file.path);
                console.log(`[DocumentService] PDF Buffer size: ${dataBuffer.length} bytes`);

                if (dataBuffer.length === 0) {
                    throw new Error('File is empty');
                }

                try {
                    const data = await pdf(dataBuffer);
                    console.log(`[DocumentService] PDF Parsed. Pages: ${data.numpages}, Info: ${JSON.stringify(data.info)}`);
                    text = data.text;
                } catch (pdfError) {
                    console.error('[DocumentService] standard pdf-parse failed:', pdfError);
                    throw new Error(`Failed to parse PDF: ${pdfError.message}`);
                }
                console.log(`[DocumentService] Extracted text length: ${text ? text.length : 0}`);
            } else if (file.mimetype === 'text/plain') {
                text = fs.readFileSync(file.path, 'utf8');
            } else {
                throw new Error('Unsupported file type');
            }

            // Cleanup: Delete temp file
            try {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            } catch (e) { console.error('Cleanup error (success path):', e); }

            if (!text || text.trim().length === 0) {
                throw new Error('No text extracted from document');
            }

            // 3. Update Document stats
            doc.characterCount = text.length;
            await doc.save();

            // 4. Chunk Text
            const chunks = this.chunkText(text, 1000); // ~1000 chars per chunk
            console.log(`[DocumentService] Created ${chunks.length} chunks`);

            // 5. Generate Embeddings & Save Chunks
            console.log(`[DocumentService] Starting embedding generation for ${chunks.length} chunks...`);
            let chunkCount = 0;
            for (const chunkText of chunks) {
                chunkCount++;
                try {
                    console.log(`[DocumentService] Generating embedding for chunk ${chunkCount}/${chunks.length} (Length: ${chunkText.length})...`);
                    const embedding = await AIService.generateEmbedding(chunkText);
                    console.log(`[DocumentService] Saving chunk ${chunkCount}...`);
                    await DocumentChunk.create({
                        projectId: doc.projectId,
                        documentId: doc._id,
                        text: chunkText,
                        embedding
                    });
                } catch (chunkError) {
                    console.error(`[DocumentService] Error processing chunk ${chunkCount}:`, chunkError);
                    throw chunkError;
                }
            }
            console.log(`[DocumentService] All chunks processed.`);

            // 6. Mark as Ready
            doc.status = 'ready';
            doc.characterCount = text.length;
            await doc.save();
            console.log(`[DocumentService] Document ${doc._id} processed successfully and set to READY.`);
            return doc;

        } catch (error) {
            console.error('[DocumentService] Error:', error);
            // Try to delete temp file in case of error if it still exists
            try {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            } catch (cleanupError) {
                console.error('[DocumentService] Cleanup Error:', cleanupError);
            }

            // Only update doc if it was created
            if (doc && doc._id) {
                try {
                    doc.status = 'error';
                    doc.error = error.message;
                    await doc.save();
                } catch (saveError) {
                    console.error('[DocumentService] Failed to save error status:', saveError);
                }
            }
            throw error;
        }
    }

    chunkText(text, chunkSize) {
        const chunks = [];
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.slice(i, i + chunkSize));
        }
        return chunks;
    }

    async getProjectDocuments(projectId) {
        return await Document.find({ projectId }).sort({ uploadDate: -1 });
    }

    async deleteDocument(documentId) {
        await DocumentChunk.deleteMany({ documentId });
        return await Document.findByIdAndDelete(documentId);
    }

    async findRelevantChunks(projectId, embedding, limit = 5) {
        const computeCosineSimilarity = require('compute-cosine-similarity');

        // Fetch all chunks for the project (In robust production, use Vector DB)
        // For this scale, loading standard vectors is acceptable.
        // Optimization: Use MongoDB projection to get only what we need initially if memory is tight, 
        // but we need embedding to compute similarity.
        const chunks = await DocumentChunk.find({ projectId }).lean();

        if (!chunks || chunks.length === 0) return [];

        // Calculate similarity for each chunk
        const scoredChunks = chunks.map(chunk => {
            const similarity = computeCosineSimilarity(embedding, chunk.embedding);
            return { ...chunk, score: similarity };
        });

        // Sort by score (descending) and take top N
        scoredChunks.sort((a, b) => b.score - a.score);

        return scoredChunks.slice(0, limit);
    }
}

module.exports = new DocumentService();
