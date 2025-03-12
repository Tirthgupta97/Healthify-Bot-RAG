import { join } from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Groq } from 'groq-sdk';
import { extractPDFText } from './utils/processPDF.js';

const __dirname = import.meta.url.replace('file://', '');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let knowledgeBaseText = "";
let conversationHistory = [];

async function loadKnowledgeBase() {
    try {
        const pdfPath = join(".", 'data', 'knowledge-base.pdf');
        console.log("pdfPath", pdfPath);
        knowledgeBaseText = await extractPDFText(pdfPath);
        console.log("✅ Knowledge Base Loaded");
    } catch (error) {
        console.error("❌ Error loading PDF:", error);
        knowledgeBaseText = "";
    }
}

loadKnowledgeBase();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getAnswerUsingGroq(query) {
    try {
        const messages = [
            {
                role: "system",
                content: `You are Healthify, a friendly and supportive mental wellness buddy! Think of yourself as a knowledgeable friend who's always ready to chat and share helpful tips. Use this knowledge base while keeping conversations light and encouraging:

                ${knowledgeBaseText}

                Personality & Communication Style:
                - Be warm, friendly, and use casual language (like "hey!", "awesome", "totally get that")
                - Share personal-style examples: "You know, it's like when..."
                - Use encouraging emojis naturally (💚 💪 ✨ 🌟 🤗)
                - Add gentle humor when appropriate
                - Be conversational, not clinical

                Response Structure:
                ## Quick Take
                - Start with an empathetic connection
                - Validate their feelings

                ## Friendly Advice
                - Share 3-4 practical, actionable tips
                - Use real-life examples
                - Break down suggestions into simple steps

                ## Wellness Tips
                - Include daily habits or quick exercises
                - Suggest mindfulness or relaxation techniques
                - Share lifestyle recommendations

                ## Buddy Reminder
                - End with a motivational note
                - Offer continued support
                
                Guidelines:
                - Always prioritize safety - guide to professional help if needed
                - Keep it positive but genuine
                - Share evidence-based tips in a casual way
                - Use examples and metaphors
                - Break down complex ideas into simple steps
                - End messages with a supportive emoji
                - Never provide medical advice

                Remember to maintain a balance between being professional and being a friendly buddy!`
            },
            {
                role: "user",
                content: query,
            },
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_completion_tokens: 2048,
            top_p: 1,
            stop: null,
            stream: false,
        });

        let answer = chatCompletion.choices[0]?.message?.content || "";

        answer = answer
            // Convert headings
            .replace(/##\s*(.*?)\s*(\n|$)/g, '<h2 class="text-xl font-semibold text-indigo-700 mb-4 mt-6">$1</h2>')
            // Convert bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-indigo-600">$1</strong>')
            // Convert paragraphs
            .replace(/\n\n/g, '</p><p class="mb-4 text-lg leading-relaxed">')
            // Convert bullet points
            .replace(/^\*\s*(.*?)$/gm, `
                <div class="flex items-start gap-3 mb-4">
                    <span class="text-indigo-600 text-xl mt-1">•</span>
                    <div class="flex-1 text-lg leading-relaxed">$1</div>
                </div>
            `.trim())
            // Clean up line breaks
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            // Wrap content
            .replace(/^(.*)/, '<div class="space-y-4">$1</div>')
            // Add closing message
            + '<p class="mt-6 text-indigo-600 text-lg font-medium">Remember, I\'m here to support you! 💫</p>';

        return answer;
    } catch (error) {
        console.error("❌ Error calling Groq API:", error);
        return "I apologize, but I'm having trouble responding right now. If you're in immediate distress, please reach out to a mental health professional or emergency services.";
    }
}

app.post("/chat", async (req, res) => {
    const query = req.body.query;
    if (!query) return res.json({ reply: "I didn't understand that." });

    console.log("👤 User:", query);

    const answer = await getAnswerUsingGroq(query);

    conversationHistory.push({ query, answer, timestamp: new Date() });

    console.log("🤖 Bot:", answer);
    res.json({ reply: answer });
});

app.get("/history", (req, res) => {
    res.json(conversationHistory);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
