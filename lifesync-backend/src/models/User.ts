import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  preferences: {
    timezone: string;
    workingHours: {
      start: string;
      end: string;
    };
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    aiPersonality: 'professional' | 'friendly' | 'casual';
  };
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    workingHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '17:00'
      }
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    aiPersonality: {
      type: String,
      enum: ['professional', 'friendly', 'casual'],
      default: 'friendly'
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ lastActive: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);