import { join } from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractPDFText } from './utils/processPDF.js';
import { createEmbedding, findSimilarChunks } from './utils/embeddingUtils.js';

const __dirname = import.meta.url.replace('file://', '');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let knowledgeBase = [];
let conversationHistory = []; // Archived conversations
let activeSession = null; // Current active session
let lastInteractionTimestamp = null;

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function loadKnowledgeBase() {
    try {
        const pdfPath = join(".", 'data', 'knowledge-base.pdf');
        console.log("📄 Loading knowledge base from:", pdfPath);
        const fullText = await extractPDFText(pdfPath);
        
        // Split the text into manageable chunks (300-500 words per chunk)
        const chunks = splitIntoChunks(fullText, 400);
        console.log(`✅ Knowledge Base split into ${chunks.length} chunks`);
        
        // Generate embeddings for each chunk
        knowledgeBase = await Promise.all(chunks.map(async (chunk, index) => {
            const embedding = await createEmbedding(chunk);
            return { 
                id: index, 
                text: chunk, 
                embedding 
            };
        }));
        
        console.log("✅ Knowledge Base Embeddings Generated");
    } catch (error) {
        console.error("❌ Error loading and processing PDF:", error);
        knowledgeBase = [];
    }
}

// Function to split text into chunks of approximately the specified word count
function splitIntoChunks(text, wordsPerChunk) {
    const words = text.split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += wordsPerChunk) {
        // Get a chunk of words, with 50-word overlap for context continuity
        const startIndex = Math.max(0, i - 50);
        const endIndex = Math.min(words.length, i + wordsPerChunk);
        chunks.push(words.slice(startIndex, endIndex).join(' '));
    }
    
    return chunks;
}

loadKnowledgeBase();

async function getAnswerUsingRAG(query) {
    try {
        // 1. Generate embedding for the query
        const queryEmbedding = await createEmbedding(query);
        
        // 2. Find the most relevant chunks using similarity search
        const relevantChunks = await findSimilarChunks(queryEmbedding, knowledgeBase, 5); // Increased chunks from 3 to 5
        
        // 3. Join the relevant chunks text to create the context
        const context = relevantChunks.map(chunk => chunk.text).join('\n\n');
        
        console.log(`🔍 Found ${relevantChunks.length} relevant chunks for query`);
        
        // Determine if this is a simple query
        const isSimpleQuery = /^(hi|hello|hey|how are you|what's up|good morning|good afternoon|good evening|thanks|thank you|bye|goodbye|see you)/i.test(query.trim());

        // Choose prompt based on query type
        const systemPrompt = isSimpleQuery ? 
            `You are Healthify, a friendly mental wellness buddy. Keep your response brief, warm, and engaging. Use emojis naturally.

            RELEVANT KNOWLEDGE:
            ${context}

            Response Guidelines:
            - Keep it short and friendly (30-50 words)
            - Use 1-2 emojis naturally
            - Be conversational and warm
            - End with a gentle question or invitation to chat

            User Query: ${query}`
            :
            `You are Healthify, a friendly and supportive mental wellness buddy! Use this knowledge to help:

            RELEVANT KNOWLEDGE:
            ${context}

            Response Structure:
            1. Start with a warm, personal greeting
            2. Give a brief overview of what you'll cover
            3. Break down your response into these sections:

            ## Understanding the Basics
            - Explain core concepts simply
            - Include 1-2 research-backed facts
            - Use relatable examples

            ## Practical Tips
            - Provide 2-3 actionable suggestions
            - Format as bullet points with •
            - Bold **key phrases** for emphasis

            ## Quick Exercise
            - Include one relevant practical exercise
            - Break down into numbered steps
            - Keep it simple and doable

            ## Science Corner
            - Share 1-2 interesting research findings
            - Explain in simple terms
            - Connect to everyday life

            End with:
            - A short, encouraging summary
            - An invitation to practice or learn more

            Style Guidelines:
            - Use emojis naturally (💚 ✨ 🌟 🤗 💪)
            - Keep paragraphs short (2-3 sentences)
            - Use bold for **important points**
            - Be warm and conversational
            - Include specific numbers or timeframes when relevant
            - Use analogies to explain complex ideas
            - Add gentle humor where appropriate

            Format Requirements:
            - Use ## for main headings with line breaks
            - Use • for bullet points
            - Use numbered lists for steps
            - Use ** for bold text
            - Add emojis at natural points
            - Keep sections well-spaced

            Remember: If suggesting exercises or techniques, always clarify they're general wellness tips, not medical advice.

            User Query: ${query}`;

        // 5. Generate the response using the LLM with the retrieved context
        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                }
            ],
            generationConfig: {
                maxOutputTokens: isSimpleQuery ? 1024 : 4096,
                temperature: 0.7,
            }
        });

        let answer = result.response.text();
        
        // Ensure consistent formatting
        answer = answer
            .replace(/^[-*]\s/gm, '• ') // Convert all bullet points to •
            .replace(/(\n{3,})/g, '\n\n') // Normalize multiple line breaks
            .replace(/##\s*([^\n]+)/g, '\n\n## $1\n'); // Format headings consistently

        // Add line breaks around headings if missing
        answer = answer.split('\n').map(line => {
            if (line.startsWith('## ')) {
                return `\n${line}\n`;
            }
            return line;
        }).join('\n');

        return answer;
    } catch (error) {
        console.error("❌ Error in RAG process:", error);
        return "I apologize, but I'm having trouble responding right now. If you're in immediate distress, please reach out to a mental health professional or emergency services.";
    }
}

// Creates a new session or updates the existing one
function manageSession(query, answer) {
    const currentTime = new Date();
    const message = { query, answer, timestamp: currentTime };
    
    // If no active session or session expired (30 minutes), create a new one
    if (!activeSession || !lastInteractionTimestamp || 
        (currentTime - new Date(lastInteractionTimestamp)) > 30 * 60 * 1000) {
        
        activeSession = {
            id: Date.now(),
            query,
            answer,
            timestamp: currentTime,
            messages: [message],
            duration: 0,
            totalMessages: 1,
            isActive: true
        };
        
        console.log("🆕 New Session Created:", activeSession.id);
    } else {
        // Update existing session
        activeSession.query = query; // Last query becomes the session title
        activeSession.answer = answer;
        activeSession.timestamp = currentTime; // Update timestamp
        activeSession.messages.push(message);
        activeSession.totalMessages = activeSession.messages.length;
        
        // Calculate session duration
        const firstMessageTime = new Date(activeSession.messages[0].timestamp);
        activeSession.duration = Math.round((currentTime - firstMessageTime) / 1000 / 60);
        
        console.log("➕ Message Added to Session:", activeSession.id);
    }
    
    lastInteractionTimestamp = currentTime;
    return activeSession;
}

app.post("/chat", async (req, res) => {
    const query = req.body.query;
    if (!query) return res.json({ reply: "I didn't understand that." });

    console.log("👤 User:", query);

    const answer = await getAnswerUsingRAG(query);
    manageSession(query, answer);
    
    console.log("🤖 Bot:", answer);
    
    res.json({ 
        reply: answer,
        sessionId: activeSession.id
    });
});

// Get current active session
app.get("/active-session", (req, res) => {
    res.json(activeSession || { messages: [] });
});

// Get all archived sessions (history)
app.get("/history", (req, res) => {
    try {
        console.log("🌐 Received request for chat history");
        
        // Map history to ensure consistent format
        const sanitizedHistory = conversationHistory.map(session => ({
            id: session.id || Date.now(),
            query: session.query || "Unnamed Session",
            answer: session.answer || "No response",
            timestamp: session.timestamp || new Date(),
            messages: session.messages || [],
            duration: session.duration || 0,
            totalMessages: session.totalMessages || session.messages.length
        }));

        console.log(`📦 Sending ${sanitizedHistory.length} archived sessions`);
        res.json(sanitizedHistory);
    } catch (error) {
        console.error("❌ Error in /history endpoint:", error);
        res.status(500).json({ 
            error: "Failed to retrieve chat history", 
            details: error.message 
        });
    }
});

// Clear all history and active session
app.delete("/history", (req, res) => {
    conversationHistory = [];
    activeSession = null;
    lastInteractionTimestamp = null;
    console.log("🧹 All chat history and active session cleared");
    res.json({ success: true, message: "All chat history cleared" });
});

// Archive current session and start a new one
app.post("/archive-session", (req, res) => {
    if (activeSession) {
        // Make a deep copy to avoid reference issues
        const sessionToArchive = JSON.parse(JSON.stringify(activeSession));
        sessionToArchive.isActive = false;
        conversationHistory.push(sessionToArchive);
        console.log("📂 Session archived:", activeSession.id);
    }
    
    // Clear active session
    activeSession = null;
    lastInteractionTimestamp = null;
    
    res.json({ 
        success: true, 
        message: "Session archived" 
    });
});

// Clear active session without archiving
app.post("/clear-session", (req, res) => {
    activeSession = null;
    lastInteractionTimestamp = null;
    
    res.json({ 
        success: true, 
        message: "Active session cleared" 
    });
});

// Delete a specific session from history by ID
app.delete("/history/:sessionId", (req, res) => {
    const sessionId = parseInt(req.params.sessionId);
    
    const initialLength = conversationHistory.length;
    conversationHistory = conversationHistory.filter(session => session.id !== sessionId);
    
    if (conversationHistory.length < initialLength) {
        console.log(`🗑️ Deleted session ${sessionId} from history`);
        res.json({ success: true, message: `Session ${sessionId} deleted` });
    } else {
        res.status(404).json({ success: false, message: "Session not found" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
