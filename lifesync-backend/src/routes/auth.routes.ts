import { Router } from 'express';
import { asyncHandler } from '../utils/errorHandler';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as jwt from 'jsonwebtoken';
import { config } from '../config/config';

const router = Router();

// POST /api/auth/login - User login (mock implementation)
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  // Mock authentication - in real implementation, verify against database
  if (email === 'demo@lifesync.ai' && password === 'demo123') {
    const token = jwt.sign(
      { userId: 'demo-user', email },
      config.jwt.secret as string,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );
    
    logger.info(`User logged in: ${email}`);
    
    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: 'demo-user',
          email,
          name: 'Demo User',
          preferences: {
            timezone: 'UTC',
            aiPersonality: 'friendly'
          }
        }
      },
      message: 'Login successful'
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
}));

// POST /api/auth/register - User registration (mock implementation)
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and name are required'
    });
  }
  
  // Mock registration
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const token = jwt.sign(
    { userId, email },
    config.jwt.secret as string,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );
  
  logger.info(`New user registered: ${email}`);
  
  return res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: userId,
        email,
        name,
        preferences: {
          timezone: 'UTC',
          aiPersonality: 'friendly'
        }
      }
    },
    message: 'Registration successful'
  });
}));

// GET /api/auth/profile - Get user profile
router.get('/profile', asyncHandler(async (req: Request, res: Response) => {
  // Mock profile data
  res.json({
    success: true,
    data: {
      id: 'demo-user',
      email: 'demo@lifesync.ai',
      name: 'Demo User',
      avatar: null,
      preferences: {
        timezone: 'UTC',
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        aiPersonality: 'friendly'
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      lastActive: new Date().toISOString()
    }
  });
}));

// PUT /api/auth/profile - Update user profile
router.put('/profile', asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body;
  
  logger.info('Profile update requested:', updates);
  
  // Mock profile update
  res.json({
    success: true,
    data: {
      id: 'demo-user',
      email: 'demo@lifesync.ai',
      name: updates.name || 'Demo User',
      avatar: updates.avatar || null,
      preferences: {
        ...updates.preferences,
        timezone: updates.preferences?.timezone || 'UTC',
        aiPersonality: updates.preferences?.aiPersonality || 'friendly'
      },
      updatedAt: new Date().toISOString()
    },
    message: 'Profile updated successfully'
  });
}));

export default router;