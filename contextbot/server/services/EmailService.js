const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('SMTP Connection Error:', error);
    } else {
        console.log('SMTP Server is ready to take our messages');
    }
});

const sendEmail = async ({ to, subject, html }) => {
    try {
        // Generate plain text version by removing HTML tags
        const text = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

        // Wrap sendMail in a promise with a 15-second timeout to prevent Render 502s
        const sendMailPromise = transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'Leadvox'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to,
            subject,
            text, // Plain text version
            html, // HTML version
        });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('SMTP Connection Timeout: The email server took too long to respond.'));
            }, 15000); // 15 seconds
        });

        const info = await Promise.race([sendMailPromise, timeoutPromise]);

        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId, response: info.response };
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendEmail
};
