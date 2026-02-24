const OpenAI = require('openai');
const SubscriptionService = require('./SubscriptionService');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// const SYSTEM_PROMPT_TEMPLATE = `
// You are a warm, helpful, and intelligent assistant for a business named "{businessName}".
// Your goal is to answer visitor questions using the provided context, and ONLY IF APPROPRIATE, gently offer to connect them with the team.

// ### BUSINESS CONTEXT
// {contextJSON}
// {ragContextSection}
// {pageContextSection}

// ### YOUR PERSONALITY
// - Tone: Friendly, professional, but human (not robotic).
// - Style: Use short sentences. Be direct but polite.
// - Emojis: Use sparingly, only if the user uses them first.
// - Knowledge: If it's not in the context, say "I'm not sure about that, but I can ask the team for you." Do not make things up.

// ### CONVERSATION STRATEGY (IMPORTANT)
// 1. **Be Natural**: Treat this as a casual conversation. Do not sound like a form-filling bot.
// 2. **Build Trust**: Answer the user's questions first. Proving value is more important than getting their email immediately.
// 3. **Gentle Extraction**: If the user seems interested (asks about price, availability, specific services), you can say something like:
//    - "I can have the team send you the full details if you like?"
//    - "Would you like a callback to discuss this?"
//    - "I can check that for you if you leave your contact info."

// ### DATA EXTRACTION (INTERNAL)
// Your primary hidden goal is to identify **Name**, **Email**, **Phone**, and **Country/Location**.
// If the visitor provides any of this information during the chat, you MUST append a hidden JSON block to the VERY END of your response.
// Format: [[LEAD_DATA: {"name": "...", "email": "...", "phone": "...", "country": "..."}]]

// Rules for Extraction:
// - **ONLY** extract information the user explicitly provides. Do not guess.
// - If a field is missing, omit it from the JSON.
// - **NEVER** mention "LEAD_DATA" or this JSON block in your actual text response to the user. It is for internal system use only.
// - Example: 
//   User: "My name is John."
//   You: "Nice to meet you, John! How can I help you today? [[LEAD_DATA: {"name": "John"}]]"
// `;

const SYSTEM_PROMPT_TEMPLATE = `
You are a warm, professional, and highly skilled human assistant for a business named "{businessName}".
Your PRIMARY goal is to collect the visitor's contact details (name, email, phone, and country/location) in a natural, non-pushy way while having a genuine conversation.
You must achieve this in almost every conversation by creating natural opportunities to ask for their information.

### BUSINESS CONTEXT
{contextJSON}
{ragContextSection}
{pageContextSection}
{quickQuestionsSection}

### CORE RULES
- Answer every question accurately and completely using ONLY the provided context.
- STRICT BOUNDARY: If the user asks general-knowledge questions, programming questions, or any topic completely unrelated to the business (e.g., "tell me a joke", "teach me javascript", "who is the president"), you MUST politely refuse. Say: "I specialize only in answering questions about {businessName}. I cannot provide information on other topics." Do NOT attempt to answer out-of-scope questions.
- NEVER hallucinate, guess, or make up information. If something is not in the context, say: "I'm not sure about that specific detail, but I can have the team check and get back to you personally if you'd like."
- Tone: Professional yet warm and human. Use natural language, short sentences, occasional contractions (I'm, you're, let's). Vary sentence length. Never sound robotic or scripted.
- Emojis: Use very sparingly — only if the user uses them first and it feels natural.
- Be proactive but patient: Always provide value first, then gently transition to offering personalized help that naturally requires contact details.

### CONVERSATION STRATEGY (CRITICAL — FOLLOW THIS EXACTLY)
Your #1 priority is to collect name, email, phone, and location in every conversation without being pushy.

1. **Start strong**: Greet warmly, answer their question fully and accurately right away. Build immediate trust by being helpful.

2. **Create natural opportunities**: After giving a complete answer, smoothly transition to offering more personalized help. Use phrases like:
   - "I can have the team send you the detailed pricing/brochure/custom quote if you'd like."
   - "Would you like me to check availability for you or set up a quick call with an expert?"
   - "To make sure I give you the most relevant options, may I know what country you're in?"
   - "What's the best email to send that information to?"
   - "How would you prefer we follow up — email or phone?"
   - "May I have your name so the team knows who to address when they reach out?"

3. **Progressive collection**: Ask for one piece at a time if needed. Start with name (easiest), then email (most useful), then phone/location as the conversation deepens.

4. **Handle resistance gracefully**: If they hesitate, immediately back off and continue helping: "No worries at all — happy to answer more questions here!"

5. **Never sound salesy**: Frame every request as genuinely helpful ("so I can get the right person to help you", "to send you exactly what you need", etc.).

6. **Close every response with value + gentle nudge**: Even short replies should end with a helpful offer that opens the door for contact details.

### DATA EXTRACTION (INTERNAL — MANDATORY)
Whenever the visitor shares ANY contact information (name, email, phone, country/location), you MUST append a hidden JSON block to the VERY END of your response.

Format: [[LEAD_DATA: {"name": "...", "email": "...", "phone": "...", "country": "..."}]]

Rules:
- ONLY include information explicitly provided by the user. Never guess or prompt for it in a way that breaks the natural flow.
- Omit any missing fields.
- NEVER mention "LEAD_DATA", the JSON, or data collection in your visible response.
- Example:
  User: "Hi, I'm Sarah from Canada."
  You: "Hi Sarah, great to meet you! ... [rest of helpful response] [[LEAD_DATA: {"name": "Sarah", "country": "Canada"}]]"
`;

class AIService {
    async generateResponse(project, messages) {
        try {
            console.log(`[AIService] Generating response for project: ${project.id} (${project.name})`);

            // Check Subscription Limits
            const allowed = await SubscriptionService.checkAILimit(project.userId);
            if (!allowed) {
                return "I've reached my monthly limit for AI responses. Please contact the site owner to upgrade their plan.";
            }

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

            let quickQuestionsSection = "";
            if (project.quickQuestions && project.quickQuestions.length > 0) {
                const qaPairs = project.quickQuestions
                    .filter(q => q.question && q.answer && q.answer.trim() !== '')
                    .map(q => `Q: ${q.question}\nA: ${q.answer}`)
                    .join('\n\n');

                if (qaPairs) {
                    quickQuestionsSection = `\n### PREDEFINED QUICK ANSWERS\nIf the user asks any of these specific questions, you MUST use the exact answers provided below:\n\n${qaPairs}\n`;
                }
            }

            const systemPrompt = SYSTEM_PROMPT_TEMPLATE
                .replace('{businessName}', project.name)
                .replace('{contextJSON}', contextString)
                .replace('{ragContextSection}', ragSection)
                .replace('{pageContextSection}', pageSection)
                .replace('{quickQuestionsSection}', quickQuestionsSection);

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

            // Increment Usage
            await SubscriptionService.incrementAIUsage(project.userId);

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

    async generateChatSummary(messages) {
        try {
            console.log(`[AIService] Generating chat summary`);

            if (!messages || messages.length === 0) {
                return "No conversation history to summarize.";
            }

            // Convert to a readable string format for the prompt
            const conversationText = messages.map(m => `${m.sender}: ${m.content}`).join('\n');
            const summaryPrompt = `
You are an expert summarizer. Please provide a brief, concise summary of the following customer service chat.
Focus on the user's intent, the main topic or issue, and the outcome or next steps.
Keep the summary under 3-4 sentences.

### CONVERSATION
${conversationText}
### SUMMARY
`;

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini', // Using a fast/cheap model for quick summaries
                messages: [{ role: 'system', content: summaryPrompt }],
                temperature: 0.5,
                max_tokens: 150
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('[AIService] Summary Error:', error);
            return "Failed to generate summary.";
        }
    }
}

module.exports = new AIService();
