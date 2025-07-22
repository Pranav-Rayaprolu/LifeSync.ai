import { CalendarEvent, ICalendarEvent } from '../models/CalendarEvent';
import { logger } from '../utils/logger';
import { createError } from '../utils/errorHandler';

export class CalendarService {
  async createEvent(userId: string, eventData: Partial<ICalendarEvent>): Promise<ICalendarEvent> {
    try {
      // Set default end time if not provided (1 hour after start)
      if (eventData.startTime && !eventData.endTime) {
        eventData.endTime = new Date(eventData.startTime.getTime() + 60 * 60 * 1000);
      }

      const event = new CalendarEvent({
        userId,
        ...eventData
      });

      const savedEvent = await event.save();
      logger.info(`Calendar event created for user ${userId}:`, savedEvent._id);
      return savedEvent;
    } catch (error) {
      logger.error('Error creating calendar event:', error);
      throw createError('Failed to create calendar event', 500);
    }
  }

  async getEvents(userId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    type?: string;
    aiSuggested?: boolean;
  }): Promise<ICalendarEvent[]> {
    try {
      const query: any = { userId };
      
      if (filters) {
        if (filters.startDate || filters.endDate) {
          query.startTime = {};
          if (filters.startDate) query.startTime.$gte = filters.startDate;
          if (filters.endDate) query.startTime.$lte = filters.endDate;
        }
        if (filters.type) query.type = filters.type;
        if (filters.aiSuggested !== undefined) query.aiSuggested = filters.aiSuggested;
      }

      const events = await CalendarEvent.find(query)
        .sort({ startTime: 1 })
        .exec();

      return events;
    } catch (error) {
      logger.error('Error fetching calendar events:', error);
      throw createError('Failed to fetch calendar events', 500);
    }
  }

  async getEventById(userId: string, eventId: string): Promise<ICalendarEvent | null> {
    try {
      const event = await CalendarEvent.findOne({ _id: eventId, userId }).exec();
      return event;
    } catch (error) {
      logger.error('Error fetching calendar event by ID:', error);
      throw createError('Failed to fetch calendar event', 500);
    }
  }

  async updateEvent(userId: string, eventId: string, updates: Partial<ICalendarEvent>): Promise<ICalendarEvent | null> {
    try {
      const event = await CalendarEvent.findOneAndUpdate(
        { _id: eventId, userId },
        { $set: updates },
        { new: true, runValidators: true }
      ).exec();

      if (!event) {
        throw createError('Calendar event not found', 404);
      }

      logger.info(`Calendar event updated for user ${userId}:`, eventId);
      return event;
    } catch (error) {
      logger.error('Error updating calendar event:', error);
      throw createError('Failed to update calendar event', 500);
    }
  }

  async deleteEvent(userId: string, eventId: string): Promise<boolean> {
    try {
      const result = await CalendarEvent.deleteOne({ _id: eventId, userId }).exec();
      
      if (result.deletedCount === 0) {
        throw createError('Calendar event not found', 404);
      }

      logger.info(`Calendar event deleted for user ${userId}:`, eventId);
      return true;
    } catch (error) {
      logger.error('Error deleting calendar event:', error);
      throw createError('Failed to delete calendar event', 500);
    }
  }

  async getUpcomingEvents(userId: string, days: number = 7): Promise<ICalendarEvent[]> {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + days);

      const events = await CalendarEvent.find({
        userId,
        startTime: {
          $gte: now,
          $lte: futureDate
        }
      })
      .sort({ startTime: 1 })
      .limit(10)
      .exec();

      return events;
    } catch (error) {
      logger.error('Error fetching upcoming events:', error);
      throw createError('Failed to fetch upcoming events', 500);
    }
  }

  async checkConflicts(userId: string, startTime: Date, endTime: Date, excludeEventId?: string): Promise<ICalendarEvent[]> {
    try {
      const query: any = {
        userId,
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        ]
      };

      if (excludeEventId) {
        query._id = { $ne: excludeEventId };
      }

      const conflicts = await CalendarEvent.find(query).exec();
      return conflicts;
    } catch (error) {
      logger.error('Error checking calendar conflicts:', error);
      throw createError('Failed to check calendar conflicts', 500);
    }
  }

  async suggestTimeSlots(userId: string, duration: number, preferredTimes?: string[]): Promise<Date[]> {
    try {
      // Get existing events for the next 7 days
      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(now.getDate() + 7);

      const existingEvents = await CalendarEvent.find({
        userId,
        startTime: { $gte: now, $lte: weekFromNow }
      }).sort({ startTime: 1 }).exec();

      // Simple algorithm to find free slots
      const suggestions: Date[] = [];
      const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM

      for (let day = 0; day < 7; day++) {
        const currentDay = new Date(now);
        currentDay.setDate(now.getDate() + day);
        currentDay.setHours(workingHours.start, 0, 0, 0);

        const dayEnd = new Date(currentDay);
        dayEnd.setHours(workingHours.end, 0, 0, 0);

        // Find free slots in this day
        const dayEvents = existingEvents.filter(event => 
          event.startTime.toDateString() === currentDay.toDateString()
        );

        let currentTime = new Date(currentDay);
        
        for (const event of dayEvents) {
          if (event.startTime.getTime() - currentTime.getTime() >= duration * 60 * 1000) {
            suggestions.push(new Date(currentTime));
            if (suggestions.length >= 5) break;
          }
          currentTime = new Date(event.endTime);
        }

        // Check if there's time after the last event
        if (dayEnd.getTime() - currentTime.getTime() >= duration * 60 * 1000) {
          suggestions.push(new Date(currentTime));
        }

        if (suggestions.length >= 5) break;
      }

      return suggestions.slice(0, 5);
    } catch (error) {
      logger.error('Error suggesting time slots:', error);
      throw createError('Failed to suggest time slots', 500);
    }
  }
}