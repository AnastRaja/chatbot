const admin = require("firebase-admin");
require('dotenv').config();

// Check if FIREBASE_SERVICE_ACCOUNT is set
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.warn("WARNING: FIREBASE_SERVICE_ACCOUNT environment variable is not set. Auth middleware will likely fail.");
} else {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(
                JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            ),
        });
        console.log("Firebase Admin Initialized successfully.");
    } catch (error) {
        console.error("Error initializing Firebase Admin:", error);
    }
}

module.exports = admin;
