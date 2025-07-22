import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  tags: string[];
  aiSuggested: boolean;
  aiContext?: string; // Context from AI conversation
  subtasks: Array<{
    title: string;
    completed: boolean;
    createdAt: Date;
  }>;
  reminders: Array<{
    type: 'email' | 'push' | 'sms';
    scheduledFor: Date;
    sent: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const TaskSchema = new Schema<ITask>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    index: true
  },
  estimatedDuration: {
    type: Number,
    min: 0
  },
  actualDuration: {
    type: Number,
    min: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  aiSuggested: {
    type: Boolean,
    default: false
  },
  aiContext: {
    type: String
  },
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms'],
      required: true
    },
    scheduledFor: {
      type: Date,
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, priority: 1 });
TaskSchema.index({ userId: 1, aiSuggested: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);