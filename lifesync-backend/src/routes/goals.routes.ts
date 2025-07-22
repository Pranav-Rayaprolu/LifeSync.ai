import { Router } from 'express';
import { GoalsService } from '../services/goals.service';
import { asyncHandler } from '../utils/errorHandler';
import { Request, Response } from 'express';

const router = Router();
const goalsService = new GoalsService();

// GET /api/goals - Get all goals for user
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user', status, category, priority } = req.query;
  
  const filters: any = {};
  if (status) filters.status = status;
  if (category) filters.category = category;
  if (priority) filters.priority = priority;

  const goals = await goalsService.getGoals(userId as string, filters);
  
  res.json({
    success: true,
    data: goals,
    count: goals.length
  });
}));

// POST /api/goals - Create new goal
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.body;
  const goal = await goalsService.createGoal(userId, req.body);
  
  res.status(201).json({
    success: true,
    data: goal,
    message: 'Goal created successfully'
  });
}));

// GET /api/goals/:id - Get goal by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.query;
  const goal = await goalsService.getGoalById(userId as string, req.params.id);
  
  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found'
    });
  }
  
  return res.json({
    success: true,
    data: goal
  });
}));

// PUT /api/goals/:id - Update goal
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.body;
  const goal = await goalsService.updateGoal(userId, req.params.id, req.body);
  
  res.json({
    success: true,
    data: goal,
    message: 'Goal updated successfully'
  });
}));

// DELETE /api/goals/:id - Delete goal
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.query;
  await goalsService.deleteGoal(userId as string, req.params.id);
  
  res.json({
    success: true,
    message: 'Goal deleted successfully'
  });
}));

// POST /api/goals/:id/milestones - Add milestone to goal
router.post('/:id/milestones', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.body;
  const goal = await goalsService.addMilestone(userId, req.params.id, req.body);
  
  res.json({
    success: true,
    data: goal,
    message: 'Milestone added successfully'
  });
}));

// PUT /api/goals/:id/milestones/:index/complete - Complete milestone
router.put('/:id/milestones/:index/complete', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.body;
  const goal = await goalsService.completeMilestone(userId, req.params.id, parseInt(req.params.index));
  
  res.json({
    success: true,
    data: goal,
    message: 'Milestone completed successfully'
  });
}));

// POST /api/goals/:id/link-task - Link task to goal
router.post('/:id/link-task', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user', taskId } = req.body;
  const goal = await goalsService.linkTaskToGoal(userId, req.params.id, taskId);
  
  res.json({
    success: true,
    data: goal,
    message: 'Task linked to goal successfully'
  });
}));

// PUT /api/goals/:id/update-progress - Update goal progress
router.put('/:id/update-progress', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.body;
  const goal = await goalsService.updateGoalProgress(userId, req.params.id);
  
  res.json({
    success: true,
    data: goal,
    message: 'Goal progress updated successfully'
  });
}));

// GET /api/goals/stats/summary - Get goal statistics
router.get('/stats/summary', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.query;
  const stats = await goalsService.getGoalStats(userId as string);
  
  res.json({
    success: true,
    data: stats
  });
}));

export default router;