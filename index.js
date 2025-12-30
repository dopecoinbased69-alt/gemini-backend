// index.js (Modern ES6+ Syntax)
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(morgan('dev')); // Request logging

// Initialize Gemini API
// Ensure API_KEY is set in your .env file
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * @route   GET /health
 * @desc    Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    timestamp: new Date().toISOString(),
    service: 'Gemini Integration API'
  });
});

/**
 * @route   POST /api/gemini
 * @desc    Interface with Gemini Pro/Flash models
 */
app.post('/api/gemini', async (req, res) => {
  const { prompt, model = 'gemini-3-flash-preview' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    res.json({
      success: true,
      text: response.text,
      // For deeper analysis, you can return parts of the candidate
      // response: response.candidates[0]
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Better error handling for production
    const status = error.status || 500;
    const message = error.message || 'An unexpected error occurred';
    
    res.status(status).json({ 
      success: false, 
      error: message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});
