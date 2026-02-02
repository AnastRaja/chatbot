const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT_TEMPLATE = `
You are a warm, helpful, and intelligent assistant for a business named "{businessName}".
Your goal is to answer visitor questions using the provided context, and ONLY IF APPROPRIATE, gently offer to connect them with the team.

### BUSINESS CONTEXT
{contextJSON}
{ragContextSection}
{pageContextSection}

### YOUR PERSONALITY
- Tone: Friendly, professional, but human (not robotic).
- Style: Use short sentences. Be direct but polite.
- Emojis: Use sparingly, only if the user uses them first.
- Knowledge: If it's not in the context, say "I'm not sure about that, but I can ask the team for you." Do not make things up.

### CONVERSATION STRATEGY (IMPORTANT)
1. **Be Natural**: Treat this as a casual conversation. Do not sound like a form-filling bot.
2. **Build Trust**: Answer the user's questions first. Proving value is more important than getting their email immediately.
3. **Gentle Extraction**: If the user seems interested (asks about price, availability, specific services), you can say something like:
   - "I can have the team send you the full details if you like?"
   - "Would you like a callback to discuss this?"
   - "I can check that for you if you leave your contact info."

### DATA EXTRACTION (INTERNAL)
Your primary hidden goal is to identify **Name**, **Email**, **Phone**, and **Country/Location**.
If the visitor provides any of this information during the chat, you MUST append a hidden JSON block to the VERY END of your response.
Format: [[LEAD_DATA: {"name": "...", "email": "...", "phone": "...", "country": "..."}]]

Rules for Extraction:
- **ONLY** extract information the user explicitly provides. Do not guess.
- If a field is missing, omit it from the JSON.
- **NEVER** mention "LEAD_DATA" or this JSON block in your actual text response to the user. It is for internal system use only.
- Example: 
  User: "My name is John."
  You: "Nice to meet you, John! How can I help you today? [[LEAD_DATA: {"name": "John"}]]"
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

            let pageSection = "";
            if (project.pageContext) {
                pageSection = `\n### CURRENT WEBPAGE CONTEXT\nThe user is currently viewing the following page:\nTitle: ${project.pageContext.title}\nURL: ${project.pageContext.url}\nContent Snippet: ${project.pageContext.content}\n\nUse this context to answer questions about the specific page they are on.\n`;
            }

            const systemPrompt = SYSTEM_PROMPT_TEMPLATE
                .replace('{businessName}', project.name)
                .replace('{contextJSON}', contextString)
                .replace('{ragContextSection}', ragSection)
                .replace('{pageContextSection}', pageSection);

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
