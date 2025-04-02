import { join } from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractPDFText } from './utils/processPDF.js';
import { createEmbedding, findSimilarChunks } from './utils/embeddingUtils.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const __dirname = import.meta.url.replace('file://', '');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('📊 Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Session Schema - now with userId
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  query: String,
  answer: String,
  timestamp: { type: Date, default: Date.now },
  messages: [{
    query: String,
    answer: String,
    timestamp: Date
  }],
  duration: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

const Session = mongoose.model('Session', sessionSchema);

// Game recommendation schema
const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, required: true }, // anxiety, depression, focus, etc.
  link: String,
  imageUrl: String
});

const Game = mongoose.model('Game', gameSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Access denied" });
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// User registration
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ error: "Email already exists" });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      name
    });
    
    const savedUser = await user.save();
    res.status(201).json({ 
      message: "User created successfully",
      userId: savedUser._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Email or password is incorrect" });
    
    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Email or password is incorrect" });
    
    // Create and assign token
    const token = jwt.sign({ _id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { 
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

let knowledgeBase = [];

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

// Enhanced classification function
function classifyMessage(query) {
    const simplePatterns = [
        /^hi+\s*$/i,
        /^hello+\s*$/i,
        /^hey+\s*$/i,
        /^how are you/i,
        /^what's up/i,
        /^good morning/i,
        /^good afternoon/i,
        /^good evening/i,
        /^thanks/i,
        /^thank you/i,
        /^bye/i,
        /^goodbye/i,
        /^see you/i,
    ];
    
    if (simplePatterns.some(pattern => pattern.test(query.trim()))) {
        return true;
    }
    
    if (query.split(' ').length < 5) {
        return true;
    }
    
    const questionMarkCount = (query.match(/\?/g) || []).length;
    if (questionMarkCount > 1) {
        return false;
    }
    
    return false;
}

// Function to suggest games based on query content
async function suggestGames(query) {
    try {
        const queryEmbedding = await createEmbedding(query);
        
        const categories = [
            'anxiety', 'stress', 'depression', 'focus', 
            'meditation', 'sleep', 'mindfulness', 'exercise'
        ];
        
        const relevantCategories = categories.filter(category => 
            query.toLowerCase().includes(category)
        );
        
        if (relevantCategories.length === 0) {
            const games = await Game.aggregate([{ $sample: { size: 2 } }]);
            return games;
        }
        
        const games = await Game.find({ 
            category: { $in: relevantCategories } 
        }).limit(2);
        
        return games;
    } catch (error) {
        console.error("Error suggesting games:", error);
        return [];
    }
}

// Updated answer generation with language support
async function getAnswerUsingRAG(query, isSimple = false, language = 'en') {
    try {
        const queryEmbedding = await createEmbedding(query);
        
        const relevantChunks = await findSimilarChunks(queryEmbedding, knowledgeBase, 5);
        const context = relevantChunks.map(chunk => chunk.text).join('\n\n');
        
        let languageInstruction = "";
        if (language !== 'en') {
            languageInstruction = `Respond in ${language}. `;
        }
        
        const systemPrompt = isSimple ? 
            `You are Healthify, a friendly mental wellness buddy. ${languageInstruction}Keep your response brief, warm, and engaging. Use emojis naturally.

            RELEVANT KNOWLEDGE:
            ${context}

            Response Guidelines:
            - Keep it short and friendly (30-50 words)
            - Use 1-2 emojis naturally
            - Be conversational and warm
            - End with a gentle question or invitation to chat

            User Query: ${query}`
            :
            `You are Healthify, a friendly and supportive mental wellness buddy! ${languageInstruction}Use this knowledge to help:

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

        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                }
            ],
            generationConfig: {
                maxOutputTokens: isSimple ? 1024 : 2048,
                temperature: 0.7,
            }
        });

        let answer = result.response.text();
        
        answer = answer
            .replace(/^[-*]\s/gm, '• ') 
            .replace(/(\n{3,})/g, '\n\n') 
            .replace(/##\s*([^\n]+)/g, '\n\n## $1\n'); 

        return answer;
    } catch (error) {
        console.error("❌ Error in RAG process:", error);
        return "I apologize, but I'm having trouble responding right now. If you're in immediate distress, please reach out to a mental health professional or emergency services.";
    }
}

// Update existing chat endpoint to use authentication
app.post("/chat", authenticateToken, async (req, res) => {
    const query = req.body.query;
    const userId = req.user._id;
    const language = req.body.language || 'en';
    
    if (!query) return res.json({ reply: "I didn't understand that." });

    console.log(`👤 User (${userId}):`, query);
    console.log(`🌐 Language: ${language}`);

    const isSimple = classifyMessage(query);
    
    const answer = await getAnswerUsingRAG(query, isSimple, language);
    const gameRecommendations = await suggestGames(query);
    
    let session = await Session.findOne({ userId, isActive: true });
    
    const message = { query, answer, timestamp: new Date() };
    
    if (!session) {
        session = new Session({
            userId,
            query,
            answer,
            timestamp: new Date(),
            messages: [message],
            totalMessages: 1,
            isActive: true
        });
    } else {
        session.query = query;
        session.answer = answer;
        session.timestamp = new Date();
        session.messages.push(message);
        session.totalMessages = session.messages.length;
        
        const firstMessageTime = new Date(session.messages[0].timestamp);
        session.duration = Math.round((new Date() - firstMessageTime) / 1000 / 60);
    }
    
    await session.save();
    console.log(`✅ Session ${session.isActive ? 'updated' : 'created'} for user ${userId}`);
    
    console.log("🤖 Bot:", answer);
    
    res.json({ 
        reply: answer,
        sessionId: session._id,
        gameRecommendations
    });
});

// Update history endpoint to be user-specific
app.get("/history", authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id;
        console.log(`🌐 Getting chat history for user ${userId}`);
        
        const sessions = await Session.find({ 
            userId,
            isActive: false 
        }).sort({ timestamp: -1 });
        
        console.log(`📦 Sending ${sessions.length} archived sessions`);
        res.json(sessions);
    } catch (error) {
        console.error("❌ Error in /history endpoint:", error);
        res.status(500).json({ 
            error: "Failed to retrieve chat history", 
            details: error.message 
        });
    }
});

// Update active session endpoint
app.get("/active-session", authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const session = await Session.findOne({ userId, isActive: true });
        res.json(session || { messages: [] });
    } catch (error) {
        console.error("Error fetching active session:", error);
        res.status(500).json({ error: "Failed to retrieve active session" });
    }
});

// Update session archiving
app.post("/archive-session", authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const session = await Session.findOne({ userId, isActive: true });
        
        if (session) {
            session.isActive = false;
            await session.save();
            console.log(`📂 Session archived for user ${userId}:`, session._id);
        }
        
        res.json({ success: true, message: "Session archived" });
    } catch (error) {
        console.error("Error archiving session:", error);
        res.status(500).json({ error: "Failed to archive session" });
    }
});

// Update clear session endpoint
app.post("/clear-session", authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id;
        await Session.deleteOne({ userId, isActive: true });
        
        res.json({ success: true, message: "Active session cleared" });
    } catch (error) {
        console.error("Error clearing session:", error);
        res.status(500).json({ error: "Failed to clear session" });
    }
});

// Games API endpoints
app.get('/games', authenticateToken, async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        
        if (category) {
            query.category = category;
        }
        
        const games = await Game.find(query);
        res.json(games);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
