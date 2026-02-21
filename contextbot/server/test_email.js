require('dotenv').config();
const { sendEmail } = require('./services/EmailService');

(async () => {
    try {
        console.log('Testing email...');
        const res = await sendEmail({
            to: 'test@example.com',
            subject: 'Test',
            html: '<p>Test</p>'
        });
        console.log('Success:', res);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
})();
