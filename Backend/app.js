import { join } from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractPDFText } from './utils/processPDF.js';
import { createEmbedding, findSimilarChunks } from './utils/embeddingUtils.js';
import { 
  detectLanguage, 
  analyzeSentiment, 
  translateText, 
  translateWithStyle, 
  isTanglish, 
  isHinglish,
  convertToTanglish, 
  convertToHinglish 
} from './utils/languageUtils.js';

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
        const chunks = splitIntoChunks(fullText, 300);
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
        // Detect language of the user query
        const detectedLanguage = await detectLanguage(query);
        console.log(`🌐 Detected language: ${detectedLanguage}`);
        
        // Check if it's a transliterated language
        const isTransliterated = detectedLanguage.includes('-en');
        const isTanglishInput = detectedLanguage === 'ta-en';
        const isHinglishInput = detectedLanguage === 'hi-en';
        
        // Analyze sentiment
        const sentimentResult = analyzeSentiment(query);
        console.log(`😊 Detected sentiment: ${sentimentResult}`);
        
        // Process query depending on language
        let translatedQuery = query;
        let originalStyle = null;
        
        if (detectedLanguage !== 'en') {
            if (isTransliterated) {
                // Get the base language (ta from ta-en)
                const baseLanguage = detectedLanguage.split('-')[0];
                originalStyle = query; // Save original style for reference
                translatedQuery = await translateText(query, 'en', baseLanguage);
            } else {
                translatedQuery = await translateText(query, 'en', detectedLanguage);
            }
            console.log(`🔄 Translated query: ${translatedQuery}`);
        }
        
        // 1. Generate embedding for the translated query
        const queryEmbedding = await createEmbedding(translatedQuery);
        
        // 2. Find the most relevant chunks using similarity search
        const relevantChunks = await findSimilarChunks(queryEmbedding, knowledgeBase, 5);
        
        // 3. Join the relevant chunks text to create the context
        const context = relevantChunks.map(chunk => chunk.text).join('\n\n');
        
        console.log(`🔍 Found ${relevantChunks.length} relevant chunks for query`);
        
        // Determine if this is a simple query
        const isSimpleQuery = /^(hi|hello|hey|how are you|what's up|good morning|good afternoon|good evening|thanks|thank you|bye|goodbye|see you)/i.test(translatedQuery.trim());

        // Language-specific instructions based on detected language
        let languageInstructions = '';
        if (isTanglishInput) {
            languageInstructions = `
            CRITICAL TANGLISH INSTRUCTION - YOU MUST FOLLOW THIS:
            - The user is writing in Tamil using English letters (Tanglish)
            - YOU MUST respond in Tanglish ONLY - Tamil written in English letters
            - DO NOT use standard English sentence structure
            - DO NOT use Tamil script (உ, இ, etc)
            - USE Tamil grammar with English words: subject + object + verb order
            - ALWAYS end sentences with Tamil verb forms like "irukku", "iruken", "pannunga"
            - ADD Tamil suffixes: "-nga" (respect), "-a" (question), "-nu" (that)
            - USE Tamil connecting words: "aana", "apparam", "adhuku", "athanaala"
            - INCLUDE these Tamil terms in your response:
              * "nalla" (good), "romba" (very), "seri" (okay)
              * "pannunga" (do), "sollunga" (tell), "paarunga" (see/check)
              * "irukku" (is/are), "irukkum" (will be), "illa" (no/not)
              * "kanna" or "macha" (term of endearment)
              
            Original user message was: "${query}"
            
            EXAMPLES OF PROPER TANGLISH RESPONSES:
            Question: "Epdi irukka?"
            ✓ CORRECT: "Nalla irukken kanna! Neenga epdi irukkeenga?"
            ✗ WRONG: "I am fine. How are you?"
            
            Question: "Enakku headache irukku. Enna pannalaam?"
            ✓ CORRECT: "Headache ku nalla rest edukkanum kanna. Konjam thanni kudinga, 2 hours thoonganga. Medicine sapteenga?"
            ✗ WRONG: "For headaches, you should rest and drink water."
            `;
        } else if (isHinglishInput) {
            languageInstructions = `
            CRITICAL HINGLISH INSTRUCTION - YOU MUST FOLLOW THIS:
            - The user is writing in Hindi using English letters (Hinglish)
            - YOU MUST respond in Hinglish ONLY - Hindi written in English letters
            - DO NOT use standard English sentence structure
            - DO NOT use Hindi script (क, ख, etc)
            - USE Hindi grammar with English words: subject + object + verb order
            - ALWAYS end sentences with Hindi verb forms like "hai", "hain", "karo"
            - ADD Hindi postpositions: "ka/ke/ki", "ko", "se", "me/mein", "par"
            - USE Hindi connecting words: "aur", "lekin", "kyunki", "phir", "to"
            - INCLUDE these Hindi terms in your response:
              * "acha" (good), "bahut" (very), "theek hai" (okay)
              * "karo" (do), "dekho" (see/look), "bataao" (tell)
              * "hai/hain" (is/are), "hoga" (will be), "nahi" (no/not)
              * "yaar" or "bhai" (term of endearment)
              
            Original user message was: "${query}"
            
            EXAMPLES OF PROPER HINGLISH RESPONSES:
            Question: "Kaise ho?"
            ✓ CORRECT: "Main bilkul theek hoon yaar! Aap kaise ho?"
            ✗ WRONG: "I am fine. How are you?"
            
            Question: "Mujhe headache hai. Kya karna chahiye?"
            ✓ CORRECT: "Headache ke liye aaram karo bhai. Thoda pani piyo, 2 ghante so jao. Medicine li hai?"
            ✗ WRONG: "For headaches, you should rest and drink water."
            `;
        }

        // Include language and sentiment in the prompt
        const systemPrompt = isSimpleQuery ? 
            `You are Healthify, a friendly mental wellness buddy. Keep your response brief, warm, and engaging. Use emojis naturally.

            RELEVANT KNOWLEDGE:
            ${context}

            LANGUAGE CONTEXT:
            - Response language: ${detectedLanguage !== 'en' ? detectedLanguage : 'en'}
            - User's emotional tone: ${sentimentResult}

            Response Guidelines:
            - Keep it short and friendly (30-50 words)
            - Use 1-2 emojis naturally
            - Be conversational and warm
            - Match the user's emotional tone
            - End with a gentle question or invitation to chat
            - IMPORTANT: Response MUST be in the same language as the user query: ${detectedLanguage}

            ${languageInstructions}

            Original User Query: ${query}
            Translated Query (if applicable): ${translatedQuery}`
            :
            `You are Healthify, a friendly and supportive mental wellness buddy! Use this knowledge to help:

            RELEVANT KNOWLEDGE:
            ${context}

            LANGUAGE CONTEXT:
            - Response language: ${detectedLanguage !== 'en' ? detectedLanguage : 'en'}
            - User's emotional tone: ${sentimentResult}

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

            ${languageInstructions}
            
            Original User Query: ${query}
            Translated Query (if applicable): ${translatedQuery}`;

        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                }
            ],
            generationConfig: {
                maxOutputTokens: isSimpleQuery ? 1024 : 2048,
                temperature: 0.9,
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

        // Check if the response is in the correct language format
        if (isTanglishInput && !isTanglish(answer)) {
            console.log("Warning: Response is not in Tanglish. Converting...");
            answer = convertToTanglish(answer);
        } else if (isHinglishInput && !isHinglish(answer)) {
            console.log("Warning: Response is not in Hinglish. Converting...");
            answer = convertToHinglish(answer);
        }

        return answer;
    } catch (error) {
        console.error("❌ Error in RAG process:", error);
        return "I apologize, but I'm having trouble responding right now. If you're in immediate distress, please reach out to a mental health professional or emergency services.";
    }
}

// Helper function to get language name (simplified)
function getLanguageName(code) {
  const languages = {
    'en': 'English',
    'ta': 'Tamil',
    'hi': 'Hindi'
  };
  return languages[code] || code;
}

// Creates a new session or updates the existing one
function manageSession(query, answer, sentiment) {
    const currentTime = new Date();
    const message = { query, answer, sentiment, timestamp: currentTime };
    
    // If no active session or session expired (30 minutes), create a new one
    if (!activeSession || !lastInteractionTimestamp || 
        (currentTime - new Date(lastInteractionTimestamp)) > 30 * 60 * 1000) {
        
        activeSession = {
            id: Date.now(),
            query,
            answer,
            sentiment,
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
        activeSession.sentiment = sentiment;
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
    
    // Detect language
    const detectedLanguage = await detectLanguage(query);
    console.log(`🌐 Detected language: ${detectedLanguage}`);
    
    // Get sentiment analysis
    const sentiment = analyzeSentiment(query);
    console.log(`😊 Detected sentiment: ${sentiment}`);
    
    const answer = await getAnswerUsingRAG(query);
    manageSession(query, answer, sentiment); // Add sentiment to the session
    
    console.log("🤖 Bot:", answer);
    
    // Double check for language format requirements
    if (detectedLanguage === 'ta-en' && !isTanglish(answer)) {
        console.log("⚠️ Final Tanglish verification failed. Converting response...");
        const tanglishAnswer = convertToTanglish(answer);
        manageSession(query, tanglishAnswer, sentiment);
        res.json({ 
            reply: tanglishAnswer,
            sessionId: activeSession.id,
            detectedLanguage: detectedLanguage,
            sentiment: sentiment // Include sentiment in the response
        });
    } else if (detectedLanguage === 'hi-en' && !isHinglish(answer)) {
        console.log("⚠️ Final Hinglish verification failed. Converting response...");
        const hinglishAnswer = convertToHinglish(answer);
        manageSession(query, hinglishAnswer, sentiment);
        res.json({ 
            reply: hinglishAnswer,
            sessionId: activeSession.id,
            detectedLanguage: detectedLanguage,
            sentiment: sentiment // Include sentiment in the response
        });
    } else {
        res.json({ 
            reply: answer,
            sessionId: activeSession.id,
            detectedLanguage: detectedLanguage,
            sentiment: sentiment // Include sentiment in the response
        });
    }
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
