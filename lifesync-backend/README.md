# LifeSync.AI Backend

A comprehensive Node.js backend for LifeSync.AI - an AI-powered conversational productivity and wellness assistant.

## 🚀 Features

- **Conversational AI System** - LangChain integration with Gemini & Groq LLMs
- **Real-time Voice Processing** - LiveKit SDK for voice interactions
- **Modular Architecture** - Tasks, Calendar, Goals, and Mood tracking
- **Event-driven Actions** - AI automatically triggers module updates
- **RESTful API** - Complete CRUD operations for all modules
- **WebSocket Support** - Real-time communication with Socket.IO
- **MongoDB Integration** - Scalable data persistence
- **TypeScript** - Full type safety and modern development

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **AI/ML**: LangChain, Google Gemini, Groq
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO, LiveKit SDK
- **Authentication**: JWT
- **Logging**: Winston
- **Validation**: Joi
- **Testing**: Jest

## 📦 Installation

1. **Clone and setup**:
```bash
cd lifesync-backend
npm install
```

2. **Environment Configuration**:
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

3. **Required Environment Variables**:
```env
# AI Service API Keys (Required)
GEMINI_API_KEY=your_google_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Database
DATABASE_URL=mongodb://localhost:27017/lifesync

# Server
PORT=3000
CORS_ORIGIN=http://localhost:5173

# LiveKit (Optional for voice features)
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_SECRET=your_livekit_secret
```

4. **Start Development Server**:
```bash
npm run dev
```

## 🔧 API Endpoints

### AI Agent
- `POST /api/agent/respond` - Process user message and get AI response
- `GET /api/agent/history/:userId` - Get conversation history
- `DELETE /api/agent/history/:userId` - Clear conversation history

### Tasks Management
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats/summary` - Get task statistics

### Calendar Management
- `GET /api/calendar/events` - Get calendar events
- `POST /api/calendar/events` - Create new event
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event
- `GET /api/calendar/upcoming` - Get upcoming events
- `POST /api/calendar/conflicts` - Check scheduling conflicts

### Goals Management
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `POST /api/goals/:id/milestones` - Add milestone
- `PUT /api/goals/:id/milestones/:index/complete` - Complete milestone

### Mood Tracking
- `GET /api/mood/entries` - Get mood entries
- `POST /api/mood/entries` - Create mood entry
- `GET /api/mood/stats` - Get mood statistics
- `GET /api/mood/trends` - Get mood trends

### Voice Processing
- `POST /api/voice/transcribe` - Transcribe voice to text
- `POST /api/voice/synthesize` - Convert text to speech
- `POST /api/voice/start-session` - Start voice session
- `POST /api/voice/end-session` - End voice session

## 🤖 AI Integration

The backend uses LangChain to integrate with multiple AI providers:

### Conversation Flow
1. User sends message to `/api/agent/respond`
2. AI processes input and maintains conversation context
3. AI extracts actionable items (tasks, events, mood updates)
4. Backend executes actions across relevant modules
5. AI response includes suggestions and follow-up questions

### Example AI Interaction
```javascript
// User input: "I'm feeling overwhelmed with my exam on Thursday and laundry's piling up."

// AI automatically:
// 1. Creates task: "Study for exam" (High priority)
// 2. Creates calendar event: "Exam" on Thursday
// 3. Creates task: "Do laundry" (Medium priority)
// 4. Updates mood: "Stressed" with context
// 5. Suggests: "Would you like me to schedule some relaxation time?"
```

## 🔄 Real-time Features

### WebSocket Events
- `voice-data` - Process voice input
- `voice-transcription` - Receive transcription
- `ai-response` - Get AI response with actions
- `voice-synthesis` - Receive synthesized speech

### LiveKit Integration
- Real-time voice processing
- Speech-to-text transcription
- Text-to-speech synthesis
- Voice session management

## 📊 Data Models

### Task
```typescript
{
  userId: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: Date;
  aiSuggested: boolean;
  aiContext?: string;
  subtasks: Array<{title: string, completed: boolean}>;
}
```

### Calendar Event
```typescript
{
  userId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'class' | 'exam' | 'personal' | 'ai-scheduled';
  aiSuggested: boolean;
  recurring?: {frequency: string, interval: number};
}
```

### Goal
```typescript
{
  userId: string;
  title: string;
  category: 'Career' | 'Health' | 'Wellness' | 'Education';
  progress: number; // 0-100
  targetDate: Date;
  milestones: Array<{title: string, completed: boolean}>;
  relatedTasks: string[]; // Task IDs
}
```

### Mood Entry
```typescript
{
  userId: string;
  date: Date;
  mood: 'Excited' | 'Happy' | 'Neutral' | 'Tired' | 'Stressed' | 'Anxious' | 'Sad';
  energy: number; // 1-5
  notes?: string;
  aiAnalysis?: {sentiment: number, suggestions: string[]};
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
# Build image
docker build -t lifesync-backend .

# Run container
docker run -p 3000:3000 --env-file .env lifesync-backend
```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=mongodb://your-production-db
GEMINI_API_KEY=your_production_gemini_key
GROQ_API_KEY=your_production_groq_key
JWT_SECRET=your_super_secure_jwt_secret
```

## 🔒 Security Features

- **Rate Limiting** - Prevents API abuse
- **CORS Protection** - Configurable origin restrictions
- **Helmet.js** - Security headers
- **JWT Authentication** - Secure user sessions
- **Input Validation** - Joi schema validation
- **Error Handling** - Comprehensive error management

## 📈 Monitoring & Logging

- **Winston Logging** - Structured logging with multiple transports
- **Health Check Endpoint** - `/health` for monitoring
- **Error Tracking** - Detailed error logs with context
- **Performance Metrics** - Request timing and resource usage

## 🤝 Integration with Frontend

The backend is designed to work seamlessly with the LifeSync.AI React frontend:

1. **Real-time Updates** - Socket.IO for live module updates
2. **Consistent Data Models** - Matching interfaces between frontend/backend
3. **AI-driven Actions** - Automatic module population from conversations
4. **Voice Integration** - WebRTC and LiveKit for voice interactions

## 📚 API Documentation

Full API documentation is available at `/api/docs` when running in development mode.

## 🛠️ Development

### Project Structure
```
src/
├── config/          # Configuration and environment
├── controllers/     # Request handlers
├── services/        # Business logic
├── models/          # Database schemas
├── routes/          # API routes
├── livekit/         # Real-time voice handling
├── utils/           # Utilities and helpers
└── index.ts         # Application entry point
```

### Adding New Features
1. Create model in `models/`
2. Implement service in `services/`
3. Add controller in `controllers/`
4. Define routes in `routes/`
5. Update AI agent to handle new actions

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the API documentation
- Review the example implementations
- Test with the provided mock data

---

**LifeSync.AI Backend** - Powering intelligent productivity and wellness assistance through conversational AI.