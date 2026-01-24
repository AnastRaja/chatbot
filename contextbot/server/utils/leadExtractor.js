// server/utils/leadExtractor.js

function extractLeads(message) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    // Basic phone regex to capture common formats
    const phoneRegex = /\b(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})\b/g;

    const emails = message.match(emailRegex) || [];
    const phones = message.match(phoneRegex) || [];

    return {
        emails,
        phones,
        isLead: emails.length > 0 || phones.length > 0
    };
}

module.exports = { extractLeads };
