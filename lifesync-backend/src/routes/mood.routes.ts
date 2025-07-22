import { Router } from 'express';
import { MoodService } from '../services/mood.service';
import { asyncHandler } from '../utils/errorHandler';
import { Request, Response } from 'express';

const router = Router();
const moodService = new MoodService();

// GET /api/mood/entries - Get mood entries
router.get('/entries', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user', startDate, endDate, mood } = req.query;
  
  const filters: any = {};
  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);
  if (mood) filters.mood = mood;

  const entries = await moodService.getMoodEntries(userId as string, filters);
  
  res.json({
    success: true,
    data: entries,
    count: entries.length
  });
}));

// POST /api/mood/entries - Create new mood entry
router.post('/entries', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.body;
  const entry = await moodService.createMoodEntry(userId, req.body);
  
  res.status(201).json({
    success: true,
    data: entry,
    message: 'Mood entry created successfully'
  });
}));

// GET /api/mood/entries/:id - Get mood entry by ID
router.get('/entries/:id', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.query;
  const entry = await moodService.getMoodEntryById(userId as string, req.params.id);
  
  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Mood entry not found'
    });
  }
  
  return res.json({
    success: true,
    data: entry
  });
}));

// GET /api/mood/entries/date/:date - Get mood entry by date
router.get('/entries/date/:date', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.query;
  const entry = await moodService.getMoodEntryByDate(userId as string, new Date(req.params.date));
  
  res.json({
    success: true,
    data: entry
  });
}));

// PUT /api/mood/entries/:id - Update mood entry
router.put('/entries/:id', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.body;
  const entry = await moodService.updateMoodEntry(userId, req.params.id, req.body);
  
  res.json({
    success: true,
    data: entry,
    message: 'Mood entry updated successfully'
  });
}));

// DELETE /api/mood/entries/:id - Delete mood entry
router.delete('/entries/:id', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.query;
  await moodService.deleteMoodEntry(userId as string, req.params.id);
  
  res.json({
    success: true,
    message: 'Mood entry deleted successfully'
  });
}));

// GET /api/mood/stats - Get mood statistics
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user', days = '30' } = req.query;
  const stats = await moodService.getMoodStats(userId as string, parseInt(days as string));
  
  res.json({
    success: true,
    data: stats
  });
}));

// GET /api/mood/trends - Get mood trends
router.get('/trends', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user', days = '7' } = req.query;
  const trends = await moodService.getMoodTrends(userId as string, parseInt(days as string));
  
  res.json({
    success: true,
    data: trends,
    count: trends.length
  });
}));

export default router;