import mongoose, { Document, Schema } from 'mongoose';

export interface IMoodEntry extends Document {
  _id: string;
  userId: string;
  date: Date;
  mood: 'Excited' | 'Happy' | 'Neutral' | 'Tired' | 'Stressed' | 'Anxious' | 'Sad';
  energy: number; // 1-5 scale
  notes?: string;
  triggers: string[]; // What caused this mood
  activities: string[]; // What activities were done
  location?: string;
  weather?: string;
  sleepHours?: number;
  aiAnalysis?: {
    sentiment: number; // -1 to 1
    keywords: string[];
    suggestions: string[];
    patterns: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const MoodEntrySchema = new Schema<IMoodEntry>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  mood: {
    type: String,
    enum: ['Excited', 'Happy', 'Neutral', 'Tired', 'Stressed', 'Anxious', 'Sad'],
    required: true
  },
  energy: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  notes: {
    type: String,
    trim: true
  },
  triggers: [{
    type: String,
    trim: true
  }],
  activities: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true
  },
  weather: {
    type: String,
    trim: true
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 24
  },
  aiAnalysis: {
    sentiment: {
      type: Number,
      min: -1,
      max: 1
    },
    keywords: [{
      type: String,
      trim: true
    }],
    suggestions: [{
      type: String,
      trim: true
    }],
    patterns: [{
      type: String,
      trim: true
    }]
  }
}, {
  timestamps: true
});

// Compound index for unique date per user
MoodEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

export const MoodEntry = mongoose.model<IMoodEntry>('MoodEntry', MoodEntrySchema);