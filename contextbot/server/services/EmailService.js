const { Resend } = require('resend');
require('dotenv').config();

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
    try {
        console.log(`Sending email using Resend API to: ${to}`);

        // Generate plain text version by removing HTML tags
        const text = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

        // Note: Unless 'leadvox.in' or the FROM domain is verified in Resend dashboard, 
        // you MUST use 'onboarding@resend.dev' as the from address during testing, 
        // and you can only send to your own registered email address.
        const fromAddress = process.env.SMTP_FROM || 'onboarding@resend.dev';
        const fromName = process.env.SMTP_FROM_NAME || 'Leadvox';

        const data = await resend.emails.send({
            from: `${fromName} <${fromAddress}>`,
            to,
            subject,
            text, // Plain text version
            html, // HTML version
        });

        if (data.error) {
            console.error('Resend API Error:', data.error);
            throw new Error(`Resend Error: ${data.error.message}`);
        }

        console.log('Message sent via Resend: %s', data.data.id);
        return { success: true, messageId: data.data.id, response: data };
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendEmail
};
