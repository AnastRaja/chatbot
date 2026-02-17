module.exports = (link) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #16a34a; }
        .content { color: #333333; line-height: 1.6; }
        .button { display: inline-block; padding: 12px 24px; background-color: #16a34a; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #888888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Leadvox</div>
        </div>
        <div class="content">
            <h2>Verify your email address</h2>
            <p>Thanks for signing up for Leadvox! We're excited to have you on board.</p>
            <p>Please verify your email address to get started by clicking the button below:</p>
            <div style="text-align: center;">
                <a href="${link}" class="button">Verify Email</a>
            </div>
            <p style="margin-top: 20px;">If the button doesn't work, you can also copy and paste the following link into your browser:</p>
            <p><a href="${link}" style="color: #16a34a; word-break: break-all;">${link}</a></p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Leadvox. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
