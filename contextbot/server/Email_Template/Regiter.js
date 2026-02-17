module.exports = (name = '') => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif;">
    <h2>Welcome${name ? `, ${name}` : ''} 👋</h2>
    <p>Your account has been successfully created.</p>
    <p>You can start using Leadvox right away.</p>
    <br />
    <p>— Team Leadvox</p>
</body>
</html>
`;
