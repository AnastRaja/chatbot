const pdf = require('pdf-parse');
const fs = require('fs');

console.log('Type of pdf export:', typeof pdf);

// Create a dummy PDF buffer (still fake content, but we check if the function RUNS)
// pdf-parse v1 usually throws on invalid content, but let's see if it's "not a function" error or "parser error"
const dummyBuffer = Buffer.from('Dummy Content');

async function test() {
    try {
        console.log('Calling pdf(buffer)...');
        const data = await pdf(dummyBuffer);
        console.log('Success:', data.text);
    } catch (e) {
        console.log('Error:', e.message);
    }
}

test();
