// tests/leadExtractor.test.js
const { extractLeads } = require('../server/utils/leadExtractor');

describe('Lead Extractor Utility', () => {
    test('extracts email addresses correctly', () => {
        const text = 'Contact me at test@example.com for more info.';
        const result = extractLeads(text);
        expect(result.isLead).toBe(true);
        expect(result.emails).toContain('test@example.com');
    });

    test('extracts phone numbers correctly', () => {
        const text = 'Call us at 555-0123-4567 or +1-800-555-5555';
        const result = extractLeads(text);
        expect(result.isLead).toBe(true);
        expect(result.phones).toEqual(expect.arrayContaining(['555-0123-4567', '+1-800-555-5555']));
    });

    test('returns no leads when none present', () => {
        const text = 'Just saying hello!';
        const result = extractLeads(text);
        expect(result.isLead).toBe(false);
        expect(result.emails).toHaveLength(0);
        expect(result.phones).toHaveLength(0);
    });
});
