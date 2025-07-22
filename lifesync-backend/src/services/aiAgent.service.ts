import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { PromptTemplate } from '@langchain/core/prompts';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { TasksService } from './tasks.service';
import { CalendarService } from './calendar.service';
import { GoalsService } from './goals.service';
import { MoodService } from './mood.service';

export interface AIResponse {
  message: string;
  actions: Array<{
    type: 'task' | 'calendar' | 'goal' | 'mood';
    action: 'create' | 'update' | 'delete';
    data: any;
  }>;
  suggestions: string[];
  confidence: number;
  pendingConfirmations?: Array<{
    type: 'task' | 'calendar' | 'goal' | 'mood';
    action: 'create' | 'update' | 'delete';
    data: any;
  }>;
}

export class AIAgentService {
  private geminiModel: ChatGoogleGenerativeAI;
  private groqModel: ChatGroq;
  private memory: BufferMemory;
  private conversationChain!: ConversationChain;
  private tasksService: TasksService;
  private calendarService: CalendarService;
  private goalsService: GoalsService;
  private moodService: MoodService;

  constructor() {
    // Initialize AI models
    this.geminiModel = new ChatGoogleGenerativeAI({
      apiKey: config.geminiApiKey,
      modelName: 'gemini-2.5-flash',
      temperature: 0.7,
      maxOutputTokens: 1024,
    });

    this.groqModel = new ChatGroq({
      apiKey: config.groqApiKey,
      modelName: 'mixtral-8x7b-32768',
      temperature: 0.7,
    });

    // Initialize memory for conversation context
    this.memory = new BufferMemory({
      memoryKey: 'history',
      returnMessages: true,
    });

    // Initialize services
    this.tasksService = new TasksService();
    this.calendarService = new CalendarService();
    this.goalsService = new GoalsService();
    this.moodService = new MoodService();

    this.setupConversationChain();
  }

  private setupConversationChain(): void {
    const prompt = PromptTemplate.fromTemplate(`
You are LifeSync.AI, a smart and empathetic assistant. You help the user manage their productivity and wellness.

If the user is in an **emotional mode** (depressed, stressed, lonely, etc):
- Do NOT propose tasks, mood logs, or productivity actions unless the user asks for them directly.
- Your job is to acknowledge their feelings, suggest small, gentle ideas that could bring joy, ease, or hope, and offer meaningful, non-intrusive questions.
- Avoid jumping into productivity or happy tracking unless asked.
- Never log moods unless the user says "log my mood as..." or similar.
- If the user asks for help or happiness, offer 2-3 gentle, opt-in suggestions (e.g., art, music, nature, humor) and only propose actions if the user says yes to a specific suggestion.

When the user mentions something that may lead to an action (like a test, task, event, mood, or goal), **you must first confirm** before performing it.

Respond with:
1. A helpful, conversational message
2. A polite confirmation: "Would you like me to…?" (only if appropriate)
3. Gentle, opt-in suggestions if in emotional mode
4. Only act when the user agrees

Conversation so far:
{history}

User: {input}

Now respond as LifeSync.AI.
`);

    this.conversationChain = new ConversationChain({
      llm: this.geminiModel,
      memory: this.memory,
      prompt: prompt,
    });
  }

  // Helper to detect emotion context
  private detectEmotionContext(input: string): 'emotional' | 'neutral' {
    const sadness = [
      'depressed', 'stressed', 'hate my job', 'feel like shit', 'lonely', 'overwhelmed', 'no energy', 'no motivation', 'worthless', 'hopeless', 'miserable', 'sad', 'burnout'
    ];
    return sadness.some(word => input.toLowerCase().includes(word)) ? 'emotional' : 'neutral';
  }

  private async setConversationMode(userId: string, mode: 'emotional' | 'neutral') {
    // Store mode in memory (could be improved with per-user memory)
    await this.memory.saveContext({ userId }, { conversationMode: mode });
  }

  private async getConversationMode(userId: string): Promise<'emotional' | 'neutral'> {
    const memoryVars = await this.memory.loadMemoryVariables({ userId });
    return (memoryVars.conversationMode as 'emotional' | 'neutral') || 'neutral';
  }

  async processUserInput(userId: string, input: string): Promise<AIResponse> {
    try {
      logger.info(`Processing user input for ${userId}: ${input}`);

      // Detect emotion mode and store in memory
      const mode = this.detectEmotionContext(input);
      await this.setConversationMode(userId, mode);

      // Get AI response
      const aiResponse = await this.conversationChain.call({
        input: input,
      });

      if (!aiResponse || !aiResponse.response) {
        logger.error('AI model returned no response');
        return {
          message: "Sorry, I couldn't generate a response. Please try again.",
          actions: [],
          suggestions: [],
          confidence: 0
        };
      }

      // If in emotional mode, only offer gentle suggestions, never log mood or propose tasks unless user is explicit
      if (mode === 'emotional') {
        // If user asks for happiness/help, offer gentle suggestions
        const lowerInput = input.toLowerCase();
        const wantsHappiness = lowerInput.includes('happy') || lowerInput.includes('happiness') || lowerInput.includes('feel better') || lowerInput.includes('help');
        let suggestions: string[] = [];
        if (wantsHappiness) {
          suggestions = [
            '🖌 Try a 5-minute art activity',
            '🎧 Listen to calming instrumental music',
            '🌱 Take 10 minutes outside, if possible',
            '😂 Watch a 2-min funny animal video',
            '✍️ List 3 things that made you smile this month'
          ];
        }
        // Never log mood unless user says so
        return {
          message: aiResponse.response,
          actions: [],
          pendingConfirmations: [],
          suggestions,
          confidence: 0.85
        };
      }

      // Analyze intent and extract actions
      const actions = await this.extractActions(userId, input, aiResponse.response);
      // Generate suggestions
      const suggestions = await this.generateSuggestions(userId, input);

      const response: AIResponse = {
        message: aiResponse.response,
        actions: [], // Do not execute actions immediately
        suggestions: suggestions,
        confidence: 0.85,
        pendingConfirmations: actions.length > 0 ? actions : undefined
      };

      logger.info(`AI response generated for ${userId}:`, response);
      return response;

    } catch (error) {
      logger.error('Error processing user input:', error);
      throw new Error('Failed to process user input');
    }
  }

  private async extractActions(userId: string, input: string, aiResponse: string): Promise<any[]> {
    const actions: any[] = [];
    const lowerInput = input.toLowerCase();

    // Task extraction patterns
    if (lowerInput.includes('exam') || lowerInput.includes('test') || lowerInput.includes('quiz')) {
      const examMatch = input.match(/exam|test|quiz.*?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2})/i);
      if (examMatch) {
        actions.push({
          type: 'task',
          action: 'create',
          data: {
            title: `Study for ${examMatch[0]}`,
            priority: 'High',
            aiSuggested: true,
            aiContext: input
          }
        });

        actions.push({
          type: 'calendar',
          action: 'create',
          data: {
            title: examMatch[0],
            type: 'exam',
            aiSuggested: true,
            aiContext: input,
            startTime: '09:00',
            endTime: '10:00',
            date: new Date().toISOString().split('T')[0]
          }
        });
      }
    }

    // Chore/task extraction
    if (lowerInput.includes('laundry') || lowerInput.includes('cleaning') || lowerInput.includes('groceries')) {
      const choreMatch = input.match(/(laundry|cleaning|groceries|shopping)/i);
      if (choreMatch) {
        actions.push({
          type: 'task',
          action: 'create',
          data: {
            title: `Do ${choreMatch[1]}`,
            priority: 'Medium',
            aiSuggested: true,
            aiContext: input
          }
        });
      }
    }

    // Bath/self-care extraction
    if (lowerInput.includes('bath')) {
      actions.push({
        type: 'task',
        action: 'create',
        data: {
          title: 'Take a Bath',
          priority: 'Low',
          aiSuggested: true,
          aiContext: input
        }
      });
    }

    // Medication/reminder extraction
    if (lowerInput.includes('medica') || lowerInput.includes('medicine') || lowerInput.includes('remind')) {
      // Try to extract time
      const timeMatch = input.match(/(\d{1,2}\s*(am|pm))/i);
      actions.push({
        type: 'task',
        action: 'create',
        data: {
          title: 'Take Sinus Medication',
          priority: 'High',
          aiSuggested: true,
          aiContext: input,
          time: timeMatch ? timeMatch[0] : undefined
        }
      });
      actions.push({
        type: 'calendar',
        action: 'create',
        data: {
          title: 'Take Sinus Medication',
          type: 'personal',
          aiSuggested: true,
          aiContext: input,
          startTime: timeMatch ? timeMatch[0] : '19:00',
          endTime: timeMatch ? timeMatch[0] : '19:15',
          isAllDay: false
        }
      });
    }

    // Mood extraction
    const moodKeywords = ['stressed', 'overwhelmed', 'anxious', 'happy', 'excited', 'tired', 'sad'];
    const detectedMood = moodKeywords.find(mood => lowerInput.includes(mood));
    if (detectedMood) {
      actions.push({
        type: 'mood',
        action: 'create',
        data: {
          mood: this.mapMoodKeyword(detectedMood),
          energy: this.estimateEnergyFromMood(detectedMood),
          notes: input,
          aiContext: input
        }
      });
    }

    return actions;
  }

  private mapMoodKeyword(keyword: string): string {
    const moodMap: { [key: string]: string } = {
      'stressed': 'Stressed',
      'overwhelmed': 'Stressed',
      'anxious': 'Anxious',
      'happy': 'Happy',
      'excited': 'Excited',
      'tired': 'Tired',
      'sad': 'Sad'
    };
    return moodMap[keyword] || 'Neutral';
  }

  private estimateEnergyFromMood(mood: string): number {
    const energyMap: { [key: string]: number } = {
      'excited': 5,
      'happy': 4,
      'neutral': 3,
      'tired': 2,
      'stressed': 2,
      'anxious': 2,
      'sad': 1
    };
    return energyMap[mood] || 3;
  }

  private async generateSuggestions(userId: string, input: string): Promise<string[]> {
    const suggestions: string[] = [];

    // Context-aware suggestions based on input
    if (input.toLowerCase().includes('exam') || input.toLowerCase().includes('study')) {
      suggestions.push('Would you like me to create a study schedule?');
      suggestions.push('Should I set up break reminders during study sessions?');
      suggestions.push('Would you like me to track your study progress?');
    }

    if (input.toLowerCase().includes('stressed') || input.toLowerCase().includes('overwhelmed')) {
      suggestions.push('Would you like me to schedule some relaxation time?');
      suggestions.push('Should I suggest some breathing exercises?');
      suggestions.push('Would you like to break down your tasks into smaller steps?');
    }

    return suggestions;
  }

  async executeActions(userId: string, actions: any[]): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'task':
            if (action.action === 'create') {
              await this.tasksService.createTask(userId, action.data);
            }
            break;
          case 'calendar':
            if (action.action === 'create') {
              await this.calendarService.createEvent(userId, action.data);
            }
            break;
          case 'goal':
            if (action.action === 'create') {
              await this.goalsService.createGoal(userId, action.data);
            }
            break;
          case 'mood':
            if (action.action === 'create') {
              await this.moodService.createMoodEntry(userId, action.data);
            }
            break;
        }
      } catch (error) {
        logger.error(`Error executing action ${action.type}:${action.action}:`, error);
      }
    }
  }

  async getConversationHistory(userId: string): Promise<any[]> {
    // In a real implementation, you'd fetch from database
    // For now, return memory buffer
    const memoryVars = await this.memory.loadMemoryVariables({});
    return memoryVars.history || [];
  }

  async clearConversationHistory(userId: string): Promise<void> {
    await this.memory.clear();
  }
}