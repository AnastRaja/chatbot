const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'leadvox.smtpmastertotal.com',
    port: 2525,
    secure: false, // false for 2525
    auth: {
        user: 'leadvox17022026',
        pass: 'KL3294mcUJlq',
    },
});

(async () => {
    try {
        console.log('Sending...');
        await transporter.sendMail({
            from: "no-reply@leadvox.in",
            to: "anastrko007@gmail.com",
            subject: "Render Port 2525 Test",
            text: "Testing Render Port 2525"
        });
        console.log('Success');
        process.exit(0);
    } catch (e) {
        console.error('Caught error:', e.message);
        process.exit(1);
    }
})();
