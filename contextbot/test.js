const http = require('http');

const data = JSON.stringify({ bizId: 'e898b684-857f-41f6-9d1f-183528a0dcaf', message: 'hello', chatId: null, pageContext: null });

const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Origin': 'null',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => console.log(`BODY: ${body}`));
});

req.on('error', (e) => console.error(`problem with request: ${e.message}`));
req.write(data);
req.end();
