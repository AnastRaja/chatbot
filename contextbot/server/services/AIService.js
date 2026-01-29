const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT_TEMPLATE = `
You are a warm, helpful, and intelligent assistant for a business named "{businessName}".
Your goal is to answer visitor questions using the provided context, and ONLY IF APPROPRIATE, gently offer to connect them with the team.

### BUSINESS CONTEXT
{contextJSON}
{ragContextSection}

### YOUR PERSONALITY
- Tone: Friendly, professional, but human (not robotic).
- Style: Use short sentences. Be direct but polite.
- Emojis: Use sparingly, only if the user uses them first.
- Knowledge: If it's not in the context, say "I'm not sure about that, but I can ask the team for you." Do not make things up.

### LEAD GENERATION RULES (CRITICAL)
1. **NEVER** start the chat by asking for name/email.
2. Answer the user's question FIRST. Build trust.
3. Only ask for contact info if:
   - The user asks about pricing, demos, or specific availability.
   - The user seems very interested but needs more info you don't have.
4. How to ask:
   - "Would you like me to have someone from the team reach out with more details?"
   - "I can pass your info along if you'd like a callback?"
   - "If you leave your email, I'll have the owner confirm that for you."

### FORMATTING
- Keep responses under 3-4 sentences when possible.
- No "Hello! How can I help you today?" cliches every time.
`;

class AIService {
    async generateResponse(project, messages) {
        try {
            console.log(`[AIService] Generating response for project: ${project.id} (${project.name})`);
            console.log(`[AIService] Context found:`, JSON.stringify(project.context, null, 2));

            // Construct System Prompt
            // Pretty print context for better token understanding (sometimes helps)
            const contextString = JSON.stringify(project.context, null, 2);

            let ragSection = "";
            if (project.ragContext) {
                ragSection = `\n### RELEVANT KNOWLEDGE BASE\nUse the following information to answer the user's question if relevant:\n\n${project.ragContext}\n`;
            }

            const systemPrompt = SYSTEM_PROMPT_TEMPLATE
                .replace('{businessName}', project.name)
                .replace('{contextJSON}', contextString)
                .replace('{ragContextSection}', ragSection);

            // console.log('[AIService] System Prompt Preview:', systemPrompt.substring(0, 200) + '...');

            const conversation = [
                { role: 'system', content: systemPrompt },
                ...messages
            ];

            const response = await openai.chat.completions.create({
                model: project.settings?.aiModel || 'gpt-4o',
                messages: conversation,
                temperature: 0.7,
                max_tokens: 300
            });

            const reply = response.choices[0].message.content;
            console.log(`[AIService] Reply: ${reply}`);
            return reply;

        } catch (error) {
            console.error('[AIService] Error:', error);
            if (error.response) {
                console.error(error.response.data);
            }
            return "I'm having a little trouble connecting right now. Could you try asking that again?";
        }
    }
    async generateEmbedding(text) {
        try {
            const response = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: text,
                encoding_format: "float",
            });
            return response.data[0].embedding;
        } catch (error) {
            console.error('[AIService] Embedding Error:', error);
            throw error;
        }
    }
}

module.exports = new AIService();
