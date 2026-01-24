// server/utils/ai.js
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getChatCompletion(messages, model = 'gpt-4o') {
    try {
        const response = await openai.chat.completions.create({
            model: model,
            messages: messages,
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw new Error('Failed to get AI response');
    }
}

async function getStreamCompletion(messages, model = 'gpt-4o') {
    // For now, returning simple completion, can be upgraded to stream
    return getChatCompletion(messages, model);
}

module.exports = { getChatCompletion, getStreamCompletion, openai };
