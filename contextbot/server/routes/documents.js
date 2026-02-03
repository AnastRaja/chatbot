const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const DocumentService = require('../services/DocumentService');
const SubscriptionService = require('../services/SubscriptionService');
const authMiddleware = require('../middleware/auth');

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|txt|octet-stream/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        console.log(`[Multer] File: ${file.originalname}, Mimetype: ${file.mimetype}, ExtMatch: ${extname}, MimeMatch: ${mimetype}`);

        if (mimetype || extname) {
            return cb(null, true);
        }
        cb(new Error(`File upload failed. Type: ${file.mimetype}, Name: ${file.originalname}`));
    }
});

// Get all documents for a project
router.get('/:projectId', authMiddleware, async (req, res) => {
    try {
        const documents = await DocumentService.getProjectDocuments(req.params.projectId);
        res.json(documents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload a document
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const { projectId } = req.body;
    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    try {
        console.log(`[Upload API] Received file: ${req.file.originalname}, Project: ${projectId}`);

        // 1. Check Subscription Storage Limit before processing
        // Note: req.file.size is in bytes
        try {
            await SubscriptionService.checkStorageLimit(req.user.uid, req.file.size);
        } catch (limitErr) {
            // Clean up file if limit exceeded
            const fs = require('fs');
            fs.unlinkSync(req.file.path);
            return res.status(403).json({ error: limitErr.message });
        }

        // 2. Initialize Document (Sync-ish)
        const doc = await DocumentService.createDocumentRecord(req.file, projectId);

        // 3. Update Usage
        await SubscriptionService.updateStorageUsage(req.user.uid, req.file.size);

        // 2. Respond immediately
        res.json(doc);

        // 3. Process in background
        // We don't await this, so it runs after response
        DocumentService.processDocumentBackground(doc, req.file)
            .catch(err => console.error('[Upload API] Background processing error:', err));
    } catch (err) {
        console.error('[Upload API] Error processing document:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete a document
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        // Get document to know size before deleting (need a way to know size from doc record)
        // For simplicity, we might assume we store size in doc record, checking Document schema... 
        // Document.js has 'size' field? Let's check. 
        // Assuming DocumentService.deleteDocument returns the deleted doc or we fetch it first.

        // Let's fetch first to get size
        const Document = require('../models/Document');
        const doc = await Document.findById(req.params.id);

        if (doc) {
            const size = doc.size || 0;
            await DocumentService.deleteDocument(req.params.id);
            // Decrease usage
            await SubscriptionService.updateStorageUsage(req.user.uid, -size);
        } else {
            await DocumentService.deleteDocument(req.params.id);
        }

        res.json({ message: 'Document deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
