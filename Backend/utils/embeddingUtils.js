import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });

/**
 * Creates an embedding vector for the given text using Google's embedding model
 * @param {string} text - The text to create an embedding for
 * @returns {Promise<number[]>} - The embedding vector
 */
export async function createEmbedding(text) {
    try {
        const result = await embeddingModel.embedContent(text);
        const embedding = result.embedding.values;
        return embedding;
    } catch (error) {
        console.error("Error creating embedding:", error);
        throw error;
    }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Similarity score between 0 and 1
 */
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
        throw new Error("Vectors must be of same length");
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find the most similar chunks to the query
 * @param {number[]} queryEmbedding - Embedding of the query
 * @param {Array} knowledgeBase - Array of knowledge chunks with embeddings
 * @param {number} topN - Number of results to return
 * @returns {Array} - Array of the most similar chunks
 */
export async function findSimilarChunks(queryEmbedding, knowledgeBase, topN = 3) {
    if (knowledgeBase.length === 0) {
        console.warn("Knowledge base is empty");
        return [];
    }
    
    // Calculate similarity scores for each chunk
    const chunksWithScores = knowledgeBase.map(chunk => {
        const score = cosineSimilarity(queryEmbedding, chunk.embedding);
        return { ...chunk, similarityScore: score };
    });
    
    // Sort by similarity score (highest first)
    const sortedChunks = chunksWithScores.sort((a, b) => 
        b.similarityScore - a.similarityScore);
    
    // Return top N results
    return sortedChunks.slice(0, topN);
}