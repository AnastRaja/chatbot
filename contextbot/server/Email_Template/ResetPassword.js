const resetPasswordTemplate = (resetLink) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e5e7eb; }
    .header { background-color: #111827; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px; }
    .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
    .button { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2); transition: background-color 0.2s; }
    .button:hover { background-color: #1d4ed8; }
    .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .link-text { margin-top: 20px; font-size: 12px; color: #6b7280; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We received a request to reset your password for your Leadvox account. If you didn't make this request, you can safely ignore this email.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <p>This link will expire in 1 hour for security reasons.</p>
      <div class="link-text">
        <p>Or copy and paste this link into your browser:</p>
        <p>${resetLink}</p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Leadvox. All rights reserved.</p>
      <p>If you have any questions, please contact support.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = resetPasswordTemplate;
