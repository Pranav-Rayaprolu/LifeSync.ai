import { Task, ITask } from '../models/Task';
import { logger } from '../utils/logger';
import { createError } from '../utils/errorHandler';

export class TasksService {
  async createTask(userId: string, taskData: Partial<ITask>): Promise<ITask> {
    try {
      const task = new Task({
        userId,
        ...taskData,
        status: 'pending'
      });

      const savedTask = await task.save();
      logger.info(`Task created for user ${userId}:`, savedTask._id);
      return savedTask;
    } catch (error) {
      logger.error('Error creating task:', error);
      throw createError('Failed to create task', 500);
    }
  }

  async getTasks(userId: string, filters?: {
    status?: string;
    priority?: string;
    dueDate?: Date;
    aiSuggested?: boolean;
  }): Promise<ITask[]> {
    try {
      const query: any = { userId };
      
      if (filters) {
        if (filters.status) query.status = filters.status;
        if (filters.priority) query.priority = filters.priority;
        if (filters.dueDate) {
          query.dueDate = {
            $gte: new Date(filters.dueDate.setHours(0, 0, 0, 0)),
            $lt: new Date(filters.dueDate.setHours(23, 59, 59, 999))
          };
        }
        if (filters.aiSuggested !== undefined) query.aiSuggested = filters.aiSuggested;
      }

      const tasks = await Task.find(query)
        .sort({ createdAt: -1, priority: 1 })
        .exec();

      return tasks;
    } catch (error) {
      logger.error('Error fetching tasks:', error);
      throw createError('Failed to fetch tasks', 500);
    }
  }

  async getTaskById(userId: string, taskId: string): Promise<ITask | null> {
    try {
      const task = await Task.findOne({ _id: taskId, userId }).exec();
      return task;
    } catch (error) {
      logger.error('Error fetching task by ID:', error);
      throw createError('Failed to fetch task', 500);
    }
  }

  async updateTask(userId: string, taskId: string, updates: Partial<ITask>): Promise<ITask | null> {
    try {
      // If marking as completed, set completedAt timestamp
      if (updates.status === 'completed' && !updates.completedAt) {
        updates.completedAt = new Date();
      }

      const task = await Task.findOneAndUpdate(
        { _id: taskId, userId },
        { $set: updates },
        { new: true, runValidators: true }
      ).exec();

      if (!task) {
        throw createError('Task not found', 404);
      }

      logger.info(`Task updated for user ${userId}:`, taskId);
      return task;
    } catch (error) {
      logger.error('Error updating task:', error);
      throw createError('Failed to update task', 500);
    }
  }

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    try {
      const result = await Task.deleteOne({ _id: taskId, userId }).exec();
      
      if (result.deletedCount === 0) {
        throw createError('Task not found', 404);
      }

      logger.info(`Task deleted for user ${userId}:`, taskId);
      return true;
    } catch (error) {
      logger.error('Error deleting task:', error);
      throw createError('Failed to delete task', 500);
    }
  }

  async addSubtask(userId: string, taskId: string, subtaskTitle: string): Promise<ITask | null> {
    try {
      const task = await Task.findOneAndUpdate(
        { _id: taskId, userId },
        {
          $push: {
            subtasks: {
              title: subtaskTitle,
              completed: false,
              createdAt: new Date()
            }
          }
        },
        { new: true }
      ).exec();

      if (!task) {
        throw createError('Task not found', 404);
      }

      return task;
    } catch (error) {
      logger.error('Error adding subtask:', error);
      throw createError('Failed to add subtask', 500);
    }
  }

  async toggleSubtask(userId: string, taskId: string, subtaskIndex: number): Promise<ITask | null> {
    try {
      const task = await Task.findOne({ _id: taskId, userId }).exec();
      
      if (!task) {
        throw createError('Task not found', 404);
      }

      if (subtaskIndex < 0 || subtaskIndex >= task.subtasks.length) {
        throw createError('Subtask not found', 404);
      }

      task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
      await task.save();

      return task;
    } catch (error) {
      logger.error('Error toggling subtask:', error);
      throw createError('Failed to toggle subtask', 500);
    }
  }

  async getTaskStats(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
    aiSuggested: number;
  }> {
    try {
      const [total, completed, pending, highPriority, aiSuggested] = await Promise.all([
        Task.countDocuments({ userId }),
        Task.countDocuments({ userId, status: 'completed' }),
        Task.countDocuments({ userId, status: 'pending' }),
        Task.countDocuments({ userId, priority: 'High', status: { $ne: 'completed' } }),
        Task.countDocuments({ userId, aiSuggested: true })
      ]);

      return {
        total,
        completed,
        pending,
        highPriority,
        aiSuggested
      };
    } catch (error) {
      logger.error('Error fetching task stats:', error);
      throw createError('Failed to fetch task statistics', 500);
    }
  }
}