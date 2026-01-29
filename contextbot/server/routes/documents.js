const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const DocumentService = require('../services/DocumentService');
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
        const doc = await DocumentService.processDocument(req.file, projectId);
        res.json(doc);
    } catch (err) {
        console.error('[Upload API] Error processing document:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete a document
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await DocumentService.deleteDocument(req.params.id);
        res.json({ message: 'Document deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
