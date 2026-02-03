const Project = require('../models/Project');
const User = require('../models/User');

const PLANS = {
    free: {
        name: 'Free',
        maxProjects: 1,
        maxStorage: 20 * 1024 * 1024, // 20 MB
        maxAIResponses: 1000,
        models: ['gpt-4o-mini']
    },
    starter: {
        name: 'Starter',
        maxProjects: 5,
        maxStorage: 200 * 1024 * 1024, // 200 MB
        maxAIResponses: 10000,
        models: ['gpt-4o-mini']
    },
    pro: {
        name: 'Pro',
        maxProjects: Infinity,
        maxStorage: 1024 * 1024 * 1024, // 1 GB
        maxAIResponses: 50000,
        models: ['gpt-4o', 'gpt-4o-mini']
    }
};

class SubscriptionService {
    getPlan(planName) {
        return PLANS[planName] || PLANS.free;
    }

    async checkProjectLimit(userId) {
        const user = await User.findOne({ uid: userId });
        if (!user) throw new Error('User not found');

        const plan = this.getPlan(user.subscription?.plan);

        // Count actual projects to be safe, or trust usage counter? 
        // Let's count actual DB records for accuracy.
        const projectCount = await Project.countDocuments({ userId });

        if (projectCount >= plan.maxProjects) {
            throw new Error(`You have reached the project limit for the ${plan.name} plan. Upgrade to create more.`);
        }
        return true;
    }

    async checkStorageLimit(userId, newFileSize) {
        const user = await User.findOne({ uid: userId });
        if (!user) throw new Error('User not found');

        const plan = this.getPlan(user.subscription?.plan);
        const currentUsage = user.usage?.storageUsed || 0;

        if (currentUsage + newFileSize > plan.maxStorage) {
            throw new Error(`Storage limit exceeded for the ${plan.name} plan.`);
        }
        return true;
    }

    async checkAILimit(userId) {
        const user = await User.findOne({ uid: userId });
        if (!user) throw new Error('User not found');

        // Check if usage needs reset (simple monthly check)
        this.checkAndResetUsage(user);

        const plan = this.getPlan(user.subscription?.plan);
        if (user.usage?.aiResponses >= plan.maxAIResponses) {
            // throw new Error(`Monthly AI response limit reached for the ${plan.name} plan.`);
            // Return false instead of throwing to handle gracefully in chat
            return false;
        }
        return true;
    }

    async incrementAIUsage(userId) {
        await User.findOneAndUpdate(
            { uid: userId },
            { $inc: { 'usage.aiResponses': 1 } }
        );
    }

    async updateStorageUsage(userId, byteChange) {
        await User.findOneAndUpdate(
            { uid: userId },
            { $inc: { 'usage.storageUsed': byteChange } }
        );
    }

    checkAndResetUsage(user) {
        const now = new Date();
        const lastReset = user.usage?.lastUsageReset ? new Date(user.usage.lastUsageReset) : new Date(0);

        // Reset if it's a new month
        if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
            user.usage.aiResponses = 0;
            user.usage.lastUsageReset = now;
            user.save(); // Async save but we don't await blocking flow
        }
    }
}

module.exports = new SubscriptionService();
