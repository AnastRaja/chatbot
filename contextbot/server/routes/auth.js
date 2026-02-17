const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const emailService = require('../services/EmailService');
const verificationTemplate = require('../Email_Template/Verification');

// Helper to generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { uid: user.uid, email: user.email, provider: user.provider },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// POST /api/auth/register
// Custom email/password registration
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        user = new User({
            uid: uuidv4(), // Generate our own UID for custom users
            email,
            password: hashedPassword,
            name,
            provider: 'password',
            isVerified: false,
            verificationToken
        });

        await user.save();

        // Send verification email
        // We'll point this to the frontend verification page
        const verificationLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

        console.log(`Attempting to send verification email to: ${email}`);

        try {
            const emailResult = await emailService.sendEmail({
                to: email,
                subject: 'Verify your email for Leadvox',
                html: verificationTemplate(verificationLink)
            });
            console.log('Email sending result:', emailResult);
        } catch (emailError) {
            console.error('Failed to send email, deleting user:', emailError);
            await User.deleteOne({ _id: user._id }); // Rollback
            throw new Error(`Failed to send verification email: ${emailError.message}`);
        }

        res.status(201).json({ success: true, message: 'Registration successful. Please verify your email.' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/verify
// Verify email with token
router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token is required' });

        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        if (user.isVerified) {
            return res.json({ success: true, message: 'Email already verified' });
        }

        user.isVerified = true;
        user.verificationToken = undefined; // Clear token
        await user.save();

        res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/login
// Custom email/password login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // If it's a google user, they can't login with password
        if (user.provider === 'firebase' || user.provider === 'google') {
            return res.status(400).json({ error: 'Please login with Google' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ error: 'Please verify your email address' });
        }

        const token = generateToken(user);

        // Hide password from response
        user.password = undefined;

        res.json({ success: true, token, user });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: error.message });
    }
});


// POST /api/auth/google-sync
// Syncs Firebase (Google) user to MongoDB
router.post('/google-sync', authMiddleware, async (req, res) => {
    try {
        // req.user comes from Firebase verification in middleware
        const { uid, email, name, provider } = req.user;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                uid, // Use Firebase UID
                email,
                name,
                provider: 'firebase', // or 'google'
                isVerified: true // Google users are implicitly verified
            });
            await user.save();
            console.log(`New Google user created: ${email}`);
        } else {
            // Link firebase UID if it was missing or different (e.g. pre-existing email/pass user checks)
            // For now, simpler to just assume separate providers or strict matching
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Auth Sync Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper for forgot password (placeholder for now)
router.post('/forgot-password', async (req, res) => {
    // TODO: Implement generate token + send email
    res.status(501).json({ error: "Not implemented yet" });
});


module.exports = router;
