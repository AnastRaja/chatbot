// server/utils/crawler.js
const axios = require('axios');
const cheerio = require('cheerio');
const { getChatCompletion } = require('./ai');

async function crawlAndSummarize(url) {
    try {
        // 1. Fetch Page
        const { data } = await axios.get(url, {
            timeout: 10000,
            headers: { 'User-Agent': 'ContextBot/1.0' }
        });

        // 2. Parse HTML
        const $ = cheerio.load(data);
        // Remove scripts, styles, etc.
        $('script, style, noscript, svg, iframe').remove();

        // Extract text from key elements
        let rawText = $('body').find('p, h1, h2, h3, h4, h5, h6, li, a[href]').map((i, el) => {
            return $(el).text().trim();
        }).get().join('\n');

        // Limit text length to avoid token limits (simulated)
        rawText = rawText.substring(0, 15000);

        if (!rawText || rawText.length < 50) {
            throw new Error('Insufficient content found on page');
        }

        // 3. Summarize with OpenAI
        const systemPrompt = `You are a business summarizer. Extract and structure key info from this raw website text: business name, description, services/products, pricing, hours, contact (email/phone/address), FAQs if any. 
    Output strictly in JSON format: { 
        "name": "Business Name", 
        "description": "Short description", 
        "services": ["Service 1", ...], 
        "pricing": {"Service": "$Price"}, 
        "hours": "Operating hours", 
        "contact": {"email": "", "phone": ""} 
    }`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: rawText }
        ];

        const jsonString = await getChatCompletion(messages);

        // Clean code blocks if AI adds them
        let cleanJson = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);

    } catch (error) {
        console.error('Crawl Error:', error.message);
        throw new Error(error.message || 'Failed to crawl website');
    }
}

module.exports = { crawlAndSummarize };
