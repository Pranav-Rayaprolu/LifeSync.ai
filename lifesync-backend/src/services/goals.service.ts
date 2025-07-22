import { Goal, IGoal } from '../models/Goal';
import { Task } from '../models/Task';
import { logger } from '../utils/logger';
import { createError } from '../utils/errorHandler';

export class GoalsService {
  async createGoal(userId: string, goalData: Partial<IGoal>): Promise<IGoal> {
    try {
      const goal = new Goal({
        userId,
        ...goalData,
        status: 'not-started',
        progress: 0
      });

      const savedGoal = await goal.save();
      logger.info(`Goal created for user ${userId}:`, savedGoal._id);
      return savedGoal;
    } catch (error) {
      logger.error('Error creating goal:', error);
      throw createError('Failed to create goal', 500);
    }
  }

  async getGoals(userId: string, filters?: {
    status?: string;
    category?: string;
    priority?: string;
  }): Promise<IGoal[]> {
    try {
      const query: any = { userId };
      
      if (filters) {
        if (filters.status) query.status = filters.status;
        if (filters.category) query.category = filters.category;
        if (filters.priority) query.priority = filters.priority;
      }

      const goals = await Goal.find(query)
        .sort({ createdAt: -1, priority: 1 })
        .exec();

      return goals;
    } catch (error) {
      logger.error('Error fetching goals:', error);
      throw createError('Failed to fetch goals', 500);
    }
  }

  async getGoalById(userId: string, goalId: string): Promise<IGoal | null> {
    try {
      const goal = await Goal.findOne({ _id: goalId, userId }).exec();
      return goal;
    } catch (error) {
      logger.error('Error fetching goal by ID:', error);
      throw createError('Failed to fetch goal', 500);
    }
  }

  async updateGoal(userId: string, goalId: string, updates: Partial<IGoal>): Promise<IGoal | null> {
    try {
      // If progress is being updated to 100%, mark as completed
      if (updates.progress === 100 && !updates.completedDate) {
        updates.status = 'completed';
        updates.completedDate = new Date();
      }

      // If starting progress from 0, set start date
      if (updates.progress && updates.progress > 0 && !updates.startDate) {
        updates.startDate = new Date();
        updates.status = 'in-progress';
      }

      const goal = await Goal.findOneAndUpdate(
        { _id: goalId, userId },
        { $set: updates },
        { new: true, runValidators: true }
      ).exec();

      if (!goal) {
        throw createError('Goal not found', 404);
      }

      logger.info(`Goal updated for user ${userId}:`, goalId);
      return goal;
    } catch (error) {
      logger.error('Error updating goal:', error);
      throw createError('Failed to update goal', 500);
    }
  }

  async deleteGoal(userId: string, goalId: string): Promise<boolean> {
    try {
      const result = await Goal.deleteOne({ _id: goalId, userId }).exec();
      
      if (result.deletedCount === 0) {
        throw createError('Goal not found', 404);
      }

      logger.info(`Goal deleted for user ${userId}:`, goalId);
      return true;
    } catch (error) {
      logger.error('Error deleting goal:', error);
      throw createError('Failed to delete goal', 500);
    }
  }

  async addMilestone(userId: string, goalId: string, milestone: {
    title: string;
    description?: string;
    targetDate: Date;
  }): Promise<IGoal | null> {
    try {
      const goal = await Goal.findOneAndUpdate(
        { _id: goalId, userId },
        {
          $push: {
            milestones: {
              ...milestone,
              completed: false
            }
          }
        },
        { new: true }
      ).exec();

      if (!goal) {
        throw createError('Goal not found', 404);
      }

      return goal;
    } catch (error) {
      logger.error('Error adding milestone:', error);
      throw createError('Failed to add milestone', 500);
    }
  }

  async completeMilestone(userId: string, goalId: string, milestoneIndex: number): Promise<IGoal | null> {
    try {
      const goal = await Goal.findOne({ _id: goalId, userId }).exec();
      
      if (!goal) {
        throw createError('Goal not found', 404);
      }

      if (milestoneIndex < 0 || milestoneIndex >= goal.milestones.length) {
        throw createError('Milestone not found', 404);
      }

      goal.milestones[milestoneIndex].completed = true;
      goal.milestones[milestoneIndex].completedDate = new Date();

      // Update goal progress based on completed milestones
      const completedMilestones = goal.milestones.filter(m => m.completed).length;
      const totalMilestones = goal.milestones.length;
      goal.progress = Math.round((completedMilestones / totalMilestones) * 100);

      await goal.save();
      return goal;
    } catch (error) {
      logger.error('Error completing milestone:', error);
      throw createError('Failed to complete milestone', 500);
    }
  }

  async linkTaskToGoal(userId: string, goalId: string, taskId: string): Promise<IGoal | null> {
    try {
      // Verify task exists and belongs to user
      const task = await Task.findOne({ _id: taskId, userId }).exec();
      if (!task) {
        throw createError('Task not found', 404);
      }

      const goal = await Goal.findOneAndUpdate(
        { _id: goalId, userId },
        { $addToSet: { relatedTasks: taskId } },
        { new: true }
      ).exec();

      if (!goal) {
        throw createError('Goal not found', 404);
      }

      return goal;
    } catch (error) {
      logger.error('Error linking task to goal:', error);
      throw createError('Failed to link task to goal', 500);
    }
  }

  async updateGoalProgress(userId: string, goalId: string): Promise<IGoal | null> {
    try {
      const goal = await Goal.findOne({ _id: goalId, userId }).exec();
      if (!goal) {
        throw createError('Goal not found', 404);
      }

      // Calculate progress based on related completed tasks
      if (goal.relatedTasks.length > 0) {
        const completedTasks = await Task.countDocuments({
          _id: { $in: goal.relatedTasks },
          status: 'completed'
        }).exec();

        const newProgress = Math.round((completedTasks / goal.relatedTasks.length) * 100);
        goal.progress = Math.max(goal.progress, newProgress);
      }

      // Also consider milestone completion
      if (goal.milestones.length > 0) {
        const completedMilestones = goal.milestones.filter(m => m.completed).length;
        const milestoneProgress = Math.round((completedMilestones / goal.milestones.length) * 100);
        goal.progress = Math.max(goal.progress, milestoneProgress);
      }

      await goal.save();
      return goal;
    } catch (error) {
      logger.error('Error updating goal progress:', error);
      throw createError('Failed to update goal progress', 500);
    }
  }

  async getGoalStats(userId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    averageProgress: number;
  }> {
    try {
      const [total, completed, inProgress, notStarted, goals] = await Promise.all([
        Goal.countDocuments({ userId }),
        Goal.countDocuments({ userId, status: 'completed' }),
        Goal.countDocuments({ userId, status: 'in-progress' }),
        Goal.countDocuments({ userId, status: 'not-started' }),
        Goal.find({ userId }, 'progress').exec()
      ]);

      const averageProgress = goals.length > 0 
        ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
        : 0;

      return {
        total,
        completed,
        inProgress,
        notStarted,
        averageProgress
      };
    } catch (error) {
      logger.error('Error fetching goal stats:', error);
      throw createError('Failed to fetch goal statistics', 500);
    }
  }
}