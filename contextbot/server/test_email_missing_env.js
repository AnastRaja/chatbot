const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: undefined,
    port: undefined,
    secure: false, // true for 465, false for other ports
    auth: {
        user: undefined,
        pass: undefined,
    },
});

(async () => {
    try {
        console.log('Sending...');
        await transporter.sendMail({
            from: "test@test.com",
            to: "test@test.com",
            subject: "test",
            text: "test"
        });
        console.log('Success');
        process.exit(0);
    } catch (e) {
        console.error('Caught error:', e.message);
        process.exit(1);
    }
})();
