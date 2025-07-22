import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { config } from './config/config';
import { logger } from './utils/logger';
import { errorHandler } from './utils/errorHandler';
import { connectDatabase } from './config/database';

// Routes
import agentRoutes from './routes/agent.routes';
import tasksRoutes from './routes/tasks.routes';
import calendarRoutes from './routes/calendar.routes';
import goalsRoutes from './routes/goals.routes';
import moodRoutes from './routes/mood.routes';
import voiceRoutes from './routes/voice.routes';
import authRoutes from './routes/auth.routes';

// Services
import { LiveKitHandler } from './livekit/livekitHandler';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST']
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  });
});

// API Routes
app.use('/api/agent', agentRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/auth', authRoutes);

// Initialize LiveKit handler
const liveKitHandler = new LiveKitHandler(io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-room', (roomName) => {
    socket.join(roomName);
    logger.info(`Client ${socket.id} joined room: ${roomName}`);
  });

  socket.on('voice-data', async (data) => {
    try {
      await liveKitHandler.handleVoiceData(socket, data);
    } catch (error) {
      logger.error('Error handling voice data:', error);
      socket.emit('voice-error', { error: 'Failed to process voice data' });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    const port = config.port;
    server.listen(port, () => {
      logger.info(`🚀 LifeSync.AI Backend running on port ${port}`);
      logger.info(`📊 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 CORS Origin: ${config.corsOrigin}`);
      logger.info(`📡 Socket.IO enabled for real-time communication`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

startServer();

export { app, io };