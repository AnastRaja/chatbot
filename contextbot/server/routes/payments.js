const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DodoPayments = require('dodopayments');

// Initialize Dodo Client
const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET, // Updated to match .env
    environment: 'test_mode' // Explicitly set to test mode
});

// Helper to create checkout session
router.post('/checkout-session', async (req, res) => {
    try {
        const { productId, userEmail, userId, returnUrl } = req.body;

        if (!productId || !userEmail) {
            return res.status(400).json({ error: 'Missing productId or userEmail' });
        }

        // Create a subscription with Dodo SDK
        const subscription = await client.subscriptions.create({
            billing: {
                city: "New York",
                country: "US",
                state: "NY",
                street: "123 Main St",
                zipcode: "10001"
            },
            customer: {
                email: userEmail,
                name: userEmail.split('@')[0],
            },
            product_id: productId,
            quantity: 1,
            payment_link: true,
            return_url: `${returnUrl || req.get('origin') || process.env.CLIENT_URL || 'http://localhost:5173'}/subscription?success=true`,
            metadata: {
                userId: userId
            }
        });

        if (subscription.payment_link) {
            return res.json({ url: subscription.payment_link });
        } else {
            console.error('Dodo Response:', subscription);
            return res.status(500).json({ error: 'Failed to retrieve payment link' });
        }

    } catch (error) {
        console.error('Checkout Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Webhook Handler
router.post('/webhook', async (req, res) => {
    const headers = req.headers;
    const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body); // strict verify needs raw string

    try {
        const event = client.webhooks.unwrap(rawBody, headers);

        // Handle the event
        switch (event.type) {
            case 'subscription.active':
            case 'subscription.updated':
                await handleSubscriptionUpdate(event.data);
                break;
            case 'subscription.cancelled':
            case 'subscription.failed':
            case 'subscription.expired':
                await handleSubscriptionUpdate(event.data, true); // Pass true to force downgrade
                break;
            // Add other events if needed
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook Error:', err.message);
        // Failing silently (400) to Dodo is fine, but for debugging print it
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

async function handleSubscriptionUpdate(subscription, forceDowngrade = false) {
    const userId = subscription.metadata?.userId;
    const customerEmail = subscription.customer?.email;

    console.log(`Processing subscription update. ID: ${subscription.subscription_id}, Status: ${subscription.status}, ForceDowngrade: ${forceDowngrade}`);

    // Determine if the subscription is effectively active
    // Valid statuses: 'active', 'on_hold', 'pending' (depending on business logic, usually just 'active')
    // If forceDowngrade is true (e.g. cancelled/failed), treat as inactive regardless of status
    const isActive = !forceDowngrade && ['active', 'on_hold'].includes(subscription.status);

    console.log(`Computed isActive: ${isActive}`);

    // Map product_id to plan name
    let plan = 'free';
    if (isActive) {
        if (subscription.product_id === 'pdt_0NXkYjtOdaPqAJ2dtluNG') plan = 'starter';
        if (subscription.product_id === 'pdt_0NXkYqWNBTn5p9rtp5oGY') plan = 'pro';
    }

    let user;
    if (userId) {
        user = await User.findOne({ uid: userId });
    } else if (customerEmail) {
        user = await User.findOne({ email: customerEmail });
    }

    if (user) {
        user.subscription.plan = plan;
        user.subscription.status = subscription.status;
        user.subscription.dodoSubscriptionId = subscription.subscription_id;
        // user.subscription.startDate = new Date(); // Maybe don't reset on every update
        await user.save();
        console.log(`Updated subscription for user ${user.email} to ${plan} (Status: ${subscription.status})`);
    } else {
        console.error('User not found for subscription update:', subscription.subscription_id);
    }
}

// Manual verification route (kept for frontend polling if needed)
router.post('/verify-subscription', async (req, res) => {
    try {
        const { subscriptionId } = req.body;
        if (!subscriptionId) return res.status(400).json({ error: 'Subscription ID required' });

        const subscription = await client.subscriptions.retrieve(subscriptionId);
        await handleSubscriptionUpdate(subscription);

        const validStatuses = ['active', 'on_hold'];
        const isActive = validStatuses.includes(subscription.status);

        let plan = 'free';
        if (isActive) {
            if (subscription.product_id === 'pdt_0NXkYjtOdaPqAJ2dtluNG') plan = 'starter';
            if (subscription.product_id === 'pdt_0NXkYqWNBTn5p9rtp5oGY') plan = 'pro';
        }

        return res.json({ success: true, status: subscription.status, plan });
    } catch (error) {
        console.error('Verify implementation error:', error);
        res.status(500).json({ error: 'Failed to verify' });
    }
});

module.exports = router;
