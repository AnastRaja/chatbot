const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // MUST be false for port 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendMail({ to, subject, html }) {
    return transporter.sendMail({
        from: `"Leadvox" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
    });
}

module.exports = sendMail;
