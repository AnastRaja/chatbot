const { sendEmail } = require('./services/EmailService.js');

(async () => {
    try {
        console.log('Testing Resend...');
        const res = await sendEmail({
            to: 'anastrko007@gmail.com',
            subject: 'Resend API Test',
            html: '<p>This is a test from the new Resend HTTP API implementation.</p>'
        });
        console.log('Success:', res);
        process.exit(0);
    } catch (e) {
        console.error('Test Failed:', e.message);
        process.exit(1);
    }
})();
