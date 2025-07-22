import { Request, Response } from 'express';
import { AIAgentService } from '../services/aiAgent.service';
import { asyncHandler } from '../utils/errorHandler';
import { logger } from '../utils/logger';

export class AgentController {
  private aiAgentService: AIAgentService;

  constructor() {
    this.aiAgentService = new AIAgentService();
  }

  processMessage = asyncHandler(async (req: Request, res: Response) => {
    const { message, userId = 'demo-user' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string'
      });
    }

    logger.info(`Processing message for user ${userId}: ${message}`);

    try {
      // Get AI response
      const aiResponse = await this.aiAgentService.processUserInput(userId, message);

      // Do not execute actions immediately
      return res.json({
        success: true,
        data: {
          message: aiResponse.message,
          actions: aiResponse.actions,
          suggestions: aiResponse.suggestions,
          confidence: aiResponse.confidence,
          pendingConfirmations: aiResponse.pendingConfirmations,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error processing AI message:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process message',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  getConversationHistory = asyncHandler(async (req: Request, res: Response) => {
    const { userId = 'demo-user' } = req.params;

    try {
      const history = await this.aiAgentService.getConversationHistory(userId);

      res.json({
        success: true,
        data: {
          history,
          count: history.length
        }
      });

    } catch (error) {
      logger.error('Error fetching conversation history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversation history'
      });
    }
  });

  clearConversationHistory = asyncHandler(async (req: Request, res: Response) => {
    const { userId = 'demo-user' } = req.params;

    try {
      await this.aiAgentService.clearConversationHistory(userId);

      res.json({
        success: true,
        message: 'Conversation history cleared successfully'
      });

    } catch (error) {
      logger.error('Error clearing conversation history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear conversation history'
      });
    }
  });
}