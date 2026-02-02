const axios = require('axios');
const mongoose = require('mongoose');

async function testIsolation() {
    const projectA = 'refactor-test-1769249374298'; // Admin's project
    const projectB = '293824de-b73d-44c0-98ee-599e03e6c9b8'; // Other User's project
    const baseUrl = 'http://127.0.0.1:3000/api/chat';

    console.log('--- STARTING ISOLATION TEST ---');

    // 1. Start Chat on Project A
    console.log(`\n1. Chatting on Project A (${projectA})...`);
    try {
        const resA = await axios.post(baseUrl, {
            bizId: projectA,
            message: "Hello Project A"
        });
        const sessionA = resA.data.chatId;
        console.log(`Session A Created: ${sessionA}`);

        // 2. Try to reuse Session A on Project B (Simulating "Visitor Table" bug)
        console.log(`\n2. Chatting on Project B (${projectB}) using Session A (${sessionA})...`);
        const resB = await axios.post(baseUrl, {
            bizId: projectB,
            message: "Hello Project B, are you isolated?",
            chatId: sessionA // INTENTIONALLY BAD
        });

        const sessionB = resB.data.chatId;
        console.log(`Session B Returned: ${sessionB}`);

        if (sessionA === sessionB) {
            console.error('FAIL: Session ID was reused! Data is leaking!');
        } else {
            console.log('SUCCESS: Session ID was NOT reused. New session created for Project B.');
        }

    } catch (e) {
        console.error('Test Failed:', e.message);
        if (e.response) console.error(e.response.data);
    }
}

testIsolation();
