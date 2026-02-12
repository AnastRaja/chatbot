const mongoose = require('mongoose');
const User = require('../models/User');
const SubscriptionService = require('../services/SubscriptionService');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI;

async function verifyLimits() {
    try {
        if (!MONGO_URI) {
            throw new Error('MONGODB_URI not found in .env');
        }
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const testUid = 'verify-limit-test-user';
        let user = await User.findOne({ uid: testUid });

        // Ensure user exists and is reset
        if (!user) {
            user = await User.create({
                uid: testUid,
                email: 'test@example.com',
                subscription: { plan: 'free' },
                usage: { aiResponses: 0 }
            });
            console.log('Created test user');
        } else {
            user.subscription.plan = 'free';
            user.usage.aiResponses = 0;
            // Ensure lastReset is current to avoid auto-reset during check
            user.usage.lastUsageReset = new Date();
            await user.save();
            console.log('Reset test user');
        }

        // Test 1: Below Limit (499)
        user.usage.aiResponses = 499;
        await user.save();

        console.log('Testing limit at 499 usage...');
        let allowed = await SubscriptionService.checkAILimit(testUid);
        console.log(`Usage 499 -> Allowed: ${allowed}`);

        if (!allowed) throw new Error('FAILED: Should be allowed at 499');

        // Test 2: At Limit (500)
        user.usage.aiResponses = 500;
        await user.save();

        console.log('Testing limit at 500 usage...');
        allowed = await SubscriptionService.checkAILimit(testUid);
        console.log(`Usage 500 -> Allowed: ${allowed}`);

        if (allowed) throw new Error('FAILED: Should NOT be allowed at 500');

        console.log('VERIFICATION SUCCESS: Free plan limit is correctly enforced at 500.');

        // --- TEST 3: Expired Trial User ---
        console.log('\n--- Test 3: Expired Trial User (Created 16 days ago) ---');
        // Subtract 16 days from current time
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - 16);

        user.createdAt = expiredDate;
        user.usage.aiResponses = 0; // Reset usage to be sure it's date blocking
        await user.save();

        const allowedExpired = await SubscriptionService.checkAILimit(testUid);
        console.log(`User (16 days old) -> Allowed: ${allowedExpired}`);

        if (!allowedExpired) {
            console.log('VERIFICATION SUCCESS: Expired trial user blocked.');
        } else {
            console.error('VERIFICATION FAILED: Expired trial user allowed.');
            throw new Error('Expired trial user allowed');
        }

        // --- TEST 4: Active Trial User ---
        console.log('\n--- Test 4: Active Trial User (Created 14 days ago) ---');
        // Subtract 14 days from current time
        const activeDate = new Date();
        activeDate.setDate(activeDate.getDate() - 14);

        user.createdAt = activeDate;
        await user.save();

        const allowedActive = await SubscriptionService.checkAILimit(testUid);
        console.log(`User (14 days old) -> Allowed: ${allowedActive}`);

        if (allowedActive) {
            console.log('VERIFICATION SUCCESS: Active trial user allowed.');
        } else {
            console.error('VERIFICATION FAILED: Active trial user blocked.');
            throw new Error('Active trial user blocked');
        }

    } catch (err) {
        console.error('VERIFICATION FAILED:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

verifyLimits();
