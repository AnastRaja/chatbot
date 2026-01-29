const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// POST /api/auth/sync
// Syncs Firebase user to MongoDB
router.post('/sync', authMiddleware, async (req, res) => {
    try {
        const { uid, email, name, provider } = req.user; // from middleware

        let user = await User.findOne({ uid });

        if (!user) {
            user = new User({
                uid,
                email,
                name,
                provider: provider || 'firebase',
            });
            await user.save();
            console.log(`New user created: ${email}`);
        } else {
            // Update name?
            // user.name = name;
            // await user.save();
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Auth Sync Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
