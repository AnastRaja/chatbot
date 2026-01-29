const admin = require("../firebaseAdmin");

module.exports = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = header.split("Bearer ")[1];

    try {
        // Basic caching could be added here as per plan, keeping it simple first to ensure functionality
        const decoded = await admin.auth().verifyIdToken(token);

        // if (!decoded.email_verified) {
        //     console.warn(`[Auth] User ${decoded.email} email not verified, but allowing for debug/dev.`);
        //     // return res.status(403).json({ error: "Email not verified" });
        // }

        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name || decoded.email.split("@")[0],
        };

        next();
    } catch (err) {
        console.error("Auth Middleware Error:", err);
        res.status(401).json({ error: "Invalid token", details: err.message });
    }
};
