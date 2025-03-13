import { join } from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractPDFText } from './utils/processPDF.js';

const __dirname = import.meta.url.replace('file://', '');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let knowledgeBaseText = "";
let conversationHistory = [];
let lastInteractionTimestamp = null;

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

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function getAnswerUsingGemini(query) {
    try {
        const systemPrompt = `You are Healthify, a friendly and supportive mental wellness buddy! Think of yourself as a knowledgeable friend who's always ready to chat and share helpful tips. Use this knowledge base while keeping conversations light and encouraging:

        ${knowledgeBaseText}

        Personality & Communication Style:
        - Be warm, friendly, and use casual language (like "hey!", "awesome", "totally get that")
        - Share personal-style examples: "You know, it's like when..."
        - Use encouraging emojis naturally (💚 💪 ✨ 🌟 🤗)
        - Add gentle humor when appropriate
        - Be conversational, not clinical
        
        Guidelines:
        - Always prioritize safety - guide to professional help if needed
        - Keep it positive but genuine
        - Share evidence-based tips in a casual way
        - Use examples and metaphors
        - Break down complex ideas into simple steps
        - End messages with a supportive emoji
        - Never provide medical advice

        Remember to maintain a balance between being professional and being a friendly buddy!

        User Query: ${query}`;

        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                }
            ],
            generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.7,
            }
        });

        let answer = result.response.text();

        // Format the response to be compatible with the frontend's rendering
        
        // Process the response line by line for better formatting
        const lines = answer.split('\n');
        let formattedLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            // Format headings - ensure they start with ## and have proper spacing
            if (line.match(/^#+\s+/)) {
                // Make sure all headings use ## format with proper spacing
                line = line.replace(/^#+\s*/, '## ');
                formattedLines.push(''); // Add empty line before heading
                formattedLines.push(line);
                formattedLines.push(''); // Add empty line after heading
            }
            // Format bullet points - ensure they use • consistently
            else if (line.match(/^[-*]\s+/)) {
                line = line.replace(/^[-*]\s+/, '• ');
                formattedLines.push(line);
            }
            // Keep other lines as is
            else {
                formattedLines.push(line);
            }
        }
        
        // Join the lines back together
        answer = formattedLines.join('\n');
        
        // Ensure bold text is properly formatted
        answer = answer.replace(/\*\*([^*]+)\*\*/g, '**$1**');
        
        // Add a friendly closing message if not already present
        if (!answer.includes("Remember") && !answer.includes("I'm here")) {
            answer += "\n\n💫 Remember, I'm here to support you whenever you need me!";
        }

        return answer;
    } catch (error) {
        console.error("❌ Error calling Gemini API:", error);
        return "I apologize, but I'm having trouble responding right now. If you're in immediate distress, please reach out to a mental health professional or emergency services.";
    }
}

app.post("/chat", async (req, res) => {
    const query = req.body.query;
    if (!query) return res.json({ reply: "I didn't understand that." });

    console.log("👤 User:", query);

    const answer = await getAnswerUsingGemini(query);

    // Check if we should start a new session based on time or if it's the first message
    const currentTime = new Date();
    if (!lastInteractionTimestamp || 
        (currentTime - new Date(lastInteractionTimestamp)) > 30 * 60 * 1000) {
        // Start a new session if more than 30 minutes have passed or it's the first message
        const newSession = {
            query,
            answer,
            timestamp: currentTime,
            messages: [{ query, answer, timestamp: currentTime }]
        };
        conversationHistory.push(newSession);
        console.log("🆕 New Session Created:", newSession);
    } else {
        // Add to the last session
        const lastSession = conversationHistory[conversationHistory.length - 1];
        lastSession.query = query;
        lastSession.answer = answer;
        lastSession.timestamp = currentTime;
        lastSession.messages.push({ query, answer, timestamp: currentTime });
        console.log("➕ Message Added to Existing Session:", lastSession);
    }

    // Update the last interaction timestamp
    lastInteractionTimestamp = currentTime;

    console.log("🤖 Bot:", answer);
    console.log("📜 Current Conversation History:", conversationHistory);
    res.json({ reply: answer });
});

function groupConversationHistory() {
    console.log("🔍 Grouping Conversation History. Total entries:", conversationHistory.length);
    
    if (conversationHistory.length === 0) {
        console.log("📭 No conversation history to group");
        return [];
    }

    const groupedSessions = [];

    // Sort conversation history by timestamp to ensure chronological order
    const sortedHistory = [...conversationHistory].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Iterate through sorted history and create separate sessions
    sortedHistory.forEach((entry, index) => {
        // Create a new session for each entry
        const session = {
            id: entry.id || Date.now() + index, // Unique identifier for the session
            query: entry.query || "Unnamed Session",
            answer: entry.answer || "No response",
            timestamp: entry.timestamp || new Date(),
            messages: entry.messages || [entry],
            duration: 0,
            totalMessages: entry.messages ? entry.messages.length : 1
        };

        // Calculate session duration if multiple messages exist
        if (session.messages.length > 1) {
            const firstMessageTime = new Date(session.messages[0].timestamp);
            const lastMessageTime = new Date(session.messages[session.messages.length - 1].timestamp);
            session.duration = Math.round((lastMessageTime - firstMessageTime) / 1000 / 60); // duration in minutes
        }

        groupedSessions.push(session);
    });

    console.log("📊 Grouped Sessions:", JSON.stringify(groupedSessions, null, 2));
    return groupedSessions;
}

app.get("/history", (req, res) => {
    try {
        console.log("🌐 Received request for chat history");
        const groupedHistory = groupConversationHistory();
        
        console.log(`📦 Sending ${groupedHistory.length} chat sessions`);
        
        // Ensure each session has the required properties
        const sanitizedHistory = groupedHistory.map(session => ({
            id: session.id || Date.now(),
            query: session.query || "Unnamed Session",
            answer: session.answer || "No response",
            timestamp: session.timestamp || new Date(),
            messages: session.messages || [],
            duration: session.duration || 0,
            totalMessages: session.totalMessages || session.messages.length
        }));

        res.json(sanitizedHistory);
    } catch (error) {
        console.error("❌ Error in /history endpoint:", error);
        res.status(500).json({ 
            error: "Failed to retrieve chat history", 
            details: error.message 
        });
    }
});

app.delete("/history", (req, res) => {
    conversationHistory = [];
    lastInteractionTimestamp = null;
    console.log("🧹 Chat history cleared");
    res.json({ success: true, message: "Chat history cleared" });
});

app.post("/clear-session", (req, res) => {
    const { messages } = req.body;
    
    if (messages && messages.length > 0) {
        // Check if the last session is already the same as what we're about to save
        const lastSession = conversationHistory[conversationHistory.length - 1];
        
        // Compare the last session with the new session to avoid duplicates
        const isNewSessionDifferent = !lastSession || 
            lastSession.messages.length !== messages.length ||
            lastSession.messages[0]?.query !== messages[0]?.query;
        
        if (isNewSessionDifferent) {
            // Create a new session with the current messages
            const newSession = {
                id: Date.now(), // Unique identifier for the session
                query: messages[0].query || "Session Cleared",
                answer: messages.find(msg => msg.answer)?.answer || "No response",
                timestamp: new Date(),
                messages: messages.map(msg => ({
                    ...msg,
                    timestamp: new Date() // Ensure each message has a timestamp
                })),
                duration: 0
            };
            
            // Calculate session duration if multiple messages exist
            if (newSession.messages.length > 1) {
                const firstMessageTime = new Date(newSession.messages[0].timestamp);
                const lastMessageTime = new Date(newSession.messages[newSession.messages.length - 1].timestamp);
                newSession.duration = Math.round((lastMessageTime - firstMessageTime) / 1000 / 60); // duration in minutes
            }
            
            // Add the session to conversation history
            conversationHistory.push(newSession);
            
            console.log("💾 Current Session Saved:", newSession);
        } else {
            console.log("🚫 Skipping duplicate session save");
        }
    }
    
    // Reset last interaction timestamp to start a new session
    lastInteractionTimestamp = null;
    
    res.json({ 
        success: true, 
        message: "Session cleared and saved to history" 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
