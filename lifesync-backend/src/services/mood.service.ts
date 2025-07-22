import { MoodEntry, IMoodEntry } from '../models/MoodEntry';
import { logger } from '../utils/logger';
import { createError } from '../utils/errorHandler';

export class MoodService {
  async createMoodEntry(userId: string, moodData: Partial<IMoodEntry>): Promise<IMoodEntry> {
    try {
      // Set date to today if not provided
      if (!moodData.date) {
        moodData.date = new Date();
        moodData.date.setHours(0, 0, 0, 0);
      }

      // Check if entry already exists for this date
      const existingEntry = await MoodEntry.findOne({
        userId,
        date: moodData.date
      }).exec();

      if (existingEntry) {
        // Update existing entry
        Object.assign(existingEntry, moodData);
        const updatedEntry = await existingEntry.save();
        logger.info(`Mood entry updated for user ${userId}:`, updatedEntry._id);
        return updatedEntry;
      }

      const moodEntry = new MoodEntry({
        userId,
        ...moodData
      });

      const savedEntry = await moodEntry.save();
      logger.info(`Mood entry created for user ${userId}:`, savedEntry._id);
      return savedEntry;
    } catch (error) {
      logger.error('Error creating mood entry:', error);
      throw createError('Failed to create mood entry', 500);
    }
  }

  async getMoodEntries(userId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    mood?: string;
  }): Promise<IMoodEntry[]> {
    try {
      const query: any = { userId };
      
      if (filters) {
        if (filters.startDate || filters.endDate) {
          query.date = {};
          if (filters.startDate) query.date.$gte = filters.startDate;
          if (filters.endDate) query.date.$lte = filters.endDate;
        }
        if (filters.mood) query.mood = filters.mood;
      }

      const entries = await MoodEntry.find(query)
        .sort({ date: -1 })
        .exec();

      return entries;
    } catch (error) {
      logger.error('Error fetching mood entries:', error);
      throw createError('Failed to fetch mood entries', 500);
    }
  }

  async getMoodEntryById(userId: string, entryId: string): Promise<IMoodEntry | null> {
    try {
      const entry = await MoodEntry.findOne({ _id: entryId, userId }).exec();
      return entry;
    } catch (error) {
      logger.error('Error fetching mood entry by ID:', error);
      throw createError('Failed to fetch mood entry', 500);
    }
  }

  async getMoodEntryByDate(userId: string, date: Date): Promise<IMoodEntry | null> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const entry = await MoodEntry.findOne({
        userId,
        date: { $gte: startOfDay, $lte: endOfDay }
      }).exec();

      return entry;
    } catch (error) {
      logger.error('Error fetching mood entry by date:', error);
      throw createError('Failed to fetch mood entry', 500);
    }
  }

  async updateMoodEntry(userId: string, entryId: string, updates: Partial<IMoodEntry>): Promise<IMoodEntry | null> {
    try {
      const entry = await MoodEntry.findOneAndUpdate(
        { _id: entryId, userId },
        { $set: updates },
        { new: true, runValidators: true }
      ).exec();

      if (!entry) {
        throw createError('Mood entry not found', 404);
      }

      logger.info(`Mood entry updated for user ${userId}:`, entryId);
      return entry;
    } catch (error) {
      logger.error('Error updating mood entry:', error);
      throw createError('Failed to update mood entry', 500);
    }
  }

  async deleteMoodEntry(userId: string, entryId: string): Promise<boolean> {
    try {
      const result = await MoodEntry.deleteOne({ _id: entryId, userId }).exec();
      
      if (result.deletedCount === 0) {
        throw createError('Mood entry not found', 404);
      }

      logger.info(`Mood entry deleted for user ${userId}:`, entryId);
      return true;
    } catch (error) {
      logger.error('Error deleting mood entry:', error);
      throw createError('Failed to delete mood entry', 500);
    }
  }

  async getMoodStats(userId: string, days: number = 30): Promise<{
    averageMood: number;
    averageEnergy: number;
    moodDistribution: { [key: string]: number };
    totalEntries: number;
    streak: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const entries = await MoodEntry.find({
        userId,
        date: { $gte: startDate }
      }).sort({ date: -1 }).exec();

      if (entries.length === 0) {
        return {
          averageMood: 0,
          averageEnergy: 0,
          moodDistribution: {},
          totalEntries: 0,
          streak: 0
        };
      }

      // Calculate averages
      const moodValues = {
        'Excited': 5,
        'Happy': 4,
        'Neutral': 3,
        'Tired': 2,
        'Stressed': 2,
        'Anxious': 1,
        'Sad': 1
      };

      const totalMoodValue = entries.reduce((sum, entry) => 
        sum + (moodValues[entry.mood as keyof typeof moodValues] || 3), 0
      );
      const totalEnergy = entries.reduce((sum, entry) => sum + entry.energy, 0);

      const averageMood = totalMoodValue / entries.length;
      const averageEnergy = totalEnergy / entries.length;

      // Calculate mood distribution
      const moodDistribution: { [key: string]: number } = {};
      entries.forEach(entry => {
        moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
      });

      // Calculate streak (consecutive days with entries)
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < days; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        
        const hasEntry = entries.some(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === checkDate.getTime();
        });

        if (hasEntry) {
          streak++;
        } else {
          break;
        }
      }

      return {
        averageMood: Math.round(averageMood * 10) / 10,
        averageEnergy: Math.round(averageEnergy * 10) / 10,
        moodDistribution,
        totalEntries: entries.length,
        streak
      };
    } catch (error) {
      logger.error('Error fetching mood stats:', error);
      throw createError('Failed to fetch mood statistics', 500);
    }
  }

  async getMoodTrends(userId: string, days: number = 7): Promise<Array<{
    date: string;
    mood: string;
    energy: number;
    moodValue: number;
  }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const entries = await MoodEntry.find({
        userId,
        date: { $gte: startDate }
      }).sort({ date: 1 }).exec();

      const moodValues = {
        'Excited': 5,
        'Happy': 4,
        'Neutral': 3,
        'Tired': 2,
        'Stressed': 2,
        'Anxious': 1,
        'Sad': 1
      };

      return entries.map(entry => ({
        date: entry.date.toISOString().split('T')[0],
        mood: entry.mood,
        energy: entry.energy,
        moodValue: moodValues[entry.mood as keyof typeof moodValues] || 3
      }));
    } catch (error) {
      logger.error('Error fetching mood trends:', error);
      throw createError('Failed to fetch mood trends', 500);
    }
  }
}