import { Router } from 'express';
import { AgentController } from '../controllers/agent.controller';
import { AIAgentService } from '../services/aiAgent.service';

const router = Router();
const agentController = new AgentController();

// POST /api/agent/respond - Process user message and get AI response
router.post('/respond', agentController.processMessage);

// GET /api/agent/history/:userId - Get conversation history
router.get('/history/:userId?', agentController.getConversationHistory);

// DELETE /api/agent/history/:userId - Clear conversation history
router.delete('/history/:userId?', agentController.clearConversationHistory);

// POST /api/agent/execute - Execute a confirmed action
router.post('/execute', async (req, res) => {
  const { userId = 'demo-user', action } = req.body;
  if (!action) {
    return res.status(400).json({ success: false, message: 'Action is required' });
  }
  try {
    const aiAgentService = new AIAgentService();
    await aiAgentService.executeActions(userId, [action]);
    return res.json({ success: true, message: 'Action executed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to execute action', error: error?.toString() });
  }
});

export default router;