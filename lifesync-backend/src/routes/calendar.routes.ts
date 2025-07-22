import { Router } from 'express';
import { CalendarService } from '../services/calendar.service';
import { asyncHandler } from '../utils/errorHandler';
import { Request, Response } from 'express';

const router = Router();
const calendarService = new CalendarService();

// GET /api/calendar/events - Get calendar events
router.get('/events', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user', startDate, endDate, type, aiSuggested } = req.query;
  
  const filters: any = {};
  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);
  if (type) filters.type = type;
  if (aiSuggested !== undefined) filters.aiSuggested = aiSuggested === 'true';

  const events = await calendarService.getEvents(userId as string, filters);
  
  res.json({
    success: true,
    data: events,
    count: events.length
  });
}));

// POST /api/calendar/events - Create new event
router.post('/events', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.body;
  const event = await calendarService.createEvent(userId, req.body);
  
  res.status(201).json({
    success: true,
    data: event,
    message: 'Calendar event created successfully'
  });
}));

// GET /api/calendar/events/:id - Get event by ID
router.get('/events/:id', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.query;
  const event = await calendarService.getEventById(userId as string, req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Calendar event not found'
    });
  }
  
  return res.json({
    success: true,
    data: event
  });
}));

// PUT /api/calendar/events/:id - Update event
router.put('/events/:id', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.body;
  const event = await calendarService.updateEvent(userId, req.params.id, req.body);
  
  res.json({
    success: true,
    data: event,
    message: 'Calendar event updated successfully'
  });
}));

// DELETE /api/calendar/events/:id - Delete event
router.delete('/events/:id', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user' } = req.query;
  await calendarService.deleteEvent(userId as string, req.params.id);
  
  res.json({
    success: true,
    message: 'Calendar event deleted successfully'
  });
}));

// GET /api/calendar/upcoming - Get upcoming events
router.get('/upcoming', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user', days = '7' } = req.query;
  const events = await calendarService.getUpcomingEvents(userId as string, parseInt(days as string));
  
  res.json({
    success: true,
    data: events,
    count: events.length
  });
}));

// POST /api/calendar/conflicts - Check for scheduling conflicts
router.post('/conflicts', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user', startTime, endTime, excludeEventId } = req.body;
  
  const conflicts = await calendarService.checkConflicts(
    userId,
    new Date(startTime),
    new Date(endTime),
    excludeEventId
  );
  
  res.json({
    success: true,
    data: conflicts,
    hasConflicts: conflicts.length > 0,
    count: conflicts.length
  });
}));

// POST /api/calendar/suggest-times - Suggest available time slots
router.post('/suggest-times', asyncHandler(async (req: Request, res: Response) => {
  const { userId = 'demo-user', duration, preferredTimes } = req.body;
  
  const suggestions = await calendarService.suggestTimeSlots(userId, duration, preferredTimes);
  
  res.json({
    success: true,
    data: suggestions,
    count: suggestions.length
  });
}));

export default router;