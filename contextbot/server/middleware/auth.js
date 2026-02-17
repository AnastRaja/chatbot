const admin = require("../firebaseAdmin");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = header.split("Bearer ")[1];

    try {
        // Strategy 1: Check if it's our custom JWT (for email/password users)
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            // If verify succeeds, it's our token
            req.user = decoded; // { uid, email, role? }
            return next();
        } catch (jwtError) {
            // Not a valid custom JWT, proceed to check Firebase
        }

        // Strategy 2: Check if it's a Firebase ID Token (for Google users)
        decoded = await admin.auth().verifyIdToken(token);

        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name || decoded.email.split("@")[0],
            provider: 'firebase'
        };

        next();
    } catch (err) {
        console.error("Auth Middleware Error:", err);
        res.status(401).json({ error: "Invalid token", details: err.message });
    }
};
