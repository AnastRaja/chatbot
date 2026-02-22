const http = require('http');

for (const p of [5173, 3000]) {
    const req = http.request({
        hostname: 'localhost',
        port: p,
        path: '/api/analytics/track',
        method: 'OPTIONS',
        headers: {
            'Origin': 'null',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
    }, (res) => {
        console.log(`\n--- PORT ${p} ---`);
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS:`, res.headers);
    });
    req.on('error', e => console.error(p, e.message));
    req.end();
}
