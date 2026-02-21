const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'leadvox.smtpmastertotal.com',
    port: 465,
    secure: true, // true for 465, false for other ports
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
            subject: "Render Port 465 Test",
            text: "Testing Render Port 465"
        });
        console.log('Success');
        process.exit(0);
    } catch (e) {
        console.error('Caught error:', e.message);
        process.exit(1);
    }
})();
