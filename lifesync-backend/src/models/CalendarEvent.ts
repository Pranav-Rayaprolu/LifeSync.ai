import mongoose, { Document, Schema } from 'mongoose';

export interface ICalendarEvent extends Document {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  type: 'class' | 'exam' | 'personal' | 'ai-scheduled' | 'meeting' | 'break';
  priority: 'High' | 'Medium' | 'Low';
  isAllDay: boolean;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[]; // 0-6, Sunday = 0
  };
  reminders: Array<{
    type: 'email' | 'push' | 'sms';
    minutesBefore: number;
    sent: boolean;
  }>;
  attendees: Array<{
    email: string;
    name: string;
    status: 'pending' | 'accepted' | 'declined';
  }>;
  aiSuggested: boolean;
  aiContext?: string;
  externalId?: string; // For Google Calendar integration
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>({
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
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['class', 'exam', 'personal', 'ai-scheduled', 'meeting', 'break'],
    default: 'personal'
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  isAllDay: {
    type: Boolean,
    default: false
  },
  recurring: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: {
      type: Number,
      min: 1
    },
    endDate: Date,
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }]
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms'],
      required: true
    },
    minutesBefore: {
      type: Number,
      required: true,
      min: 0
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  attendees: [{
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  aiSuggested: {
    type: Boolean,
    default: false
  },
  aiContext: {
    type: String
  },
  externalId: {
    type: String,
    sparse: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
CalendarEventSchema.index({ userId: 1, startTime: 1 });
CalendarEventSchema.index({ userId: 1, type: 1 });
CalendarEventSchema.index({ userId: 1, aiSuggested: 1 });

export const CalendarEvent = mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);