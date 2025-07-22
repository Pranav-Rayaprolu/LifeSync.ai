import mongoose, { Document, Schema } from 'mongoose';

export interface IGoal extends Document {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: 'Career' | 'Health' | 'Wellness' | 'Education' | 'Personal' | 'Finance';
  priority: 'High' | 'Medium' | 'Low';
  status: 'not-started' | 'in-progress' | 'completed' | 'paused' | 'cancelled';
  progress: number; // 0-100
  targetDate: Date;
  startDate?: Date;
  completedDate?: Date;
  milestones: Array<{
    title: string;
    description?: string;
    targetDate: Date;
    completed: boolean;
    completedDate?: Date;
  }>;
  metrics: Array<{
    name: string;
    currentValue: number;
    targetValue: number;
    unit: string;
    lastUpdated: Date;
  }>;
  aiSuggested: boolean;
  aiContext?: string;
  relatedTasks: string[]; // Task IDs
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>({
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
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Career', 'Health', 'Wellness', 'Education', 'Personal', 'Finance'],
    required: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'paused', 'cancelled'],
    default: 'not-started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  targetDate: {
    type: Date,
    required: true,
    index: true
  },
  startDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  milestones: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    targetDate: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: {
      type: Date
    }
  }],
  metrics: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    currentValue: {
      type: Number,
      required: true
    },
    targetValue: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true,
      trim: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  aiSuggested: {
    type: Boolean,
    default: false
  },
  aiContext: {
    type: String
  },
  relatedTasks: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, category: 1 });
GoalSchema.index({ userId: 1, targetDate: 1 });

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);