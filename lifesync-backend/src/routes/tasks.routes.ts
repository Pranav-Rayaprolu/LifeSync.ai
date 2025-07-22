import { Router } from 'express';
import { TasksService } from '../services/tasks.service';
import { asyncHandler } from '../utils/errorHandler';
import { Request, Response } from 'express';

const router = Router();
const tasksService = new TasksService();

// GET /api/tasks - Get all tasks for user
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user', status, priority, dueDate, aiSuggested } = req.query;
  
  const filters: any = {};
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (dueDate) filters.dueDate = new Date(dueDate as string);
  if (aiSuggested !== undefined) filters.aiSuggested = aiSuggested === 'true';

  const tasks = await tasksService.getTasks(userId as string, filters);
  
  res.json({
    success: true,
    data: tasks,
    count: tasks.length
  });
}));

// POST /api/tasks - Create new task
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.body;
  const task = await tasksService.createTask(userId, req.body);
  
  res.status(201).json({
    success: true,
    data: task,
    message: 'Task created successfully'
  });
}));

// GET /api/tasks/:id - Get task by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.query;
  const task = await tasksService.getTaskById(userId as string, req.params.id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }
  
  return res.json({
    success: true,
    data: task
  });
}));

// PUT /api/tasks/:id - Update task
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.body;
  const task = await tasksService.updateTask(userId, req.params.id, req.body);
  
  res.json({
    success: true,
    data: task,
    message: 'Task updated successfully'
  });
}));

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.query;
  await tasksService.deleteTask(userId as string, req.params.id);
  
  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
}));

// POST /api/tasks/:id/subtasks - Add subtask
router.post('/:id/subtasks', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user', title } = req.body;
  const task = await tasksService.addSubtask(userId, req.params.id, title);
  
  res.json({
    success: true,
    data: task,
    message: 'Subtask added successfully'
  });
}));

// PUT /api/tasks/:id/subtasks/:index - Toggle subtask completion
router.put('/:id/subtasks/:index', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.body;
  const task = await tasksService.toggleSubtask(userId, req.params.id, parseInt(req.params.index));
  
  res.json({
    success: true,
    data: task,
    message: 'Subtask updated successfully'
  });
}));

// GET /api/tasks/stats - Get task statistics
router.get('/stats/summary', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.query;
  const stats = await tasksService.getTaskStats(userId as string);
  
  res.json({
    success: true,
    data: stats
  });
}));

export default router;