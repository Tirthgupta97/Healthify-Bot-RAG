import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { extractPDFText } from "./processPDF.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let knowledgeBaseText = "";
let conversationHistory = [];

// Load the knowledge base (PDF) on startup.
async function loadKnowledgeBase() {
    try {
        knowledgeBaseText = await extractPDFText("./data/knowledge-base.pdf");
        console.log("✅ Knowledge Base Loaded");
    } catch (error) {
        console.error("❌ Error loading PDF:", error);
    }
}

loadKnowledgeBase();

// Initialize the Groq instance with your API key.
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Function to get an enhanced, friendly answer using Groq.
// The system message instructs the assistant to respond with a heading and bullet points.
async function getAnswerUsingGroq(query) {
    try {
        const messages = [
            {
                role: "system",
                content: `You are a friendly assistant who provides clear, professional, and engaging responses. 
                - Format answers properly with bold headings (use uppercase for key headings), bullet points, and line breaks.
                - Use emojis naturally to make responses engaging, but place them in a way that does not disrupt screen readers or text-to-speech engines.`,
            },
            {
                role: "user",
                content: query,
            },
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_completion_tokens: 1024,
            top_p: 1,
            stop: null,
            stream: false,
        });

        let answer = chatCompletion.choices[0]?.message?.content || "";

        // Apply text-based formatting instead of HTML
        answer = answer
            .replace(/\*\*(.*?)\*\*/g, "$1".toUpperCase()) // Convert **bold** to UPPERCASE
            .replace(/- /g, "🔹 ") // Add bullet emojis
            .replace(/\n/g, "\n\n"); // Ensure proper line breaks for readability

        return answer;
    } catch (error) {
        console.error("❌ Error calling Groq API:", error);
        return "I'm sorry, I encountered an error while trying to generate an answer.";
    }
}

// Chat endpoint: Uses Groq to generate a friendly, enhanced answer formatted as requested.
app.post("/chat", async (req, res) => {
    const query = req.body.query;
    if (!query) return res.json({ reply: "I didn't understand that." });

    console.log("👤 User:", query);

    const answer = await getAnswerUsingGroq(query);

    // Save conversation history with a timestamp.
    conversationHistory.push({ query, answer, timestamp: new Date() });

    console.log("🤖 Bot:", answer);
    res.json({ reply: answer });
});

// Endpoint to retrieve the conversation history.
app.get("/history", (req, res) => {
    res.json(conversationHistory);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});