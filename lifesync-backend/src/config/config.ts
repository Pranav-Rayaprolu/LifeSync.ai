import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // AI Services
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',

  // LiveKit
  livekit: {
    apiKey: process.env.LIVEKIT_API_KEY || '',
    secret: process.env.LIVEKIT_SECRET || '',
    wsUrl: process.env.LIVEKIT_WS_URL || 'ws://localhost:7880'
  },

  // Database
  databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/lifesync',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // External APIs
  googleCalendarApiKey: process.env.GOOGLE_CALENDAR_API_KEY || '',
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || ''
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Validate required environment variables
const requiredEnvVars = ['GEMINI_API_KEY', 'GROQ_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}