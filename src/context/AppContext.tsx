import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface Task {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  dueDate?: string;
  aiSuggested?: boolean;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  targetDate: string;
  category: string;
}

interface MoodEntry {
  date: string;
  mood: string;
  energy: number;
  notes?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "class" | "exam" | "personal" | "ai-scheduled";
}

interface AppContextType {
  activeWindows: string[];
  darkMode: boolean;
  tasks: Task[];
  goals: Goal[];
  moodEntries: MoodEntry[];
  calendarEvents: CalendarEvent[];
  chatMessages: Array<{
    role: "user" | "ai";
    content: string;
    timestamp: Date;
  }>;
  aiListening: boolean;
  aiSpeaking: boolean;
  openWindow: (windowId: string, iconPosition?: DOMRect | null) => void;
  closeWindow: (windowId: string) => void;
  toggleDarkMode: () => void;
  addTask: (task: Omit<Task, "id">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addGoal: (goal: Omit<Goal, "id">) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  addMoodEntry: (entry: MoodEntry) => Promise<void>;
  addCalendarEvent: (event: Omit<CalendarEvent, "id">) => void;
  addChatMessage: (message: { role: "user" | "ai"; content: string }) => void;
  setAIListening: (listening: boolean) => void;
  setAISpeaking: (speaking: boolean) => void;
  lastDockIconPosition: DOMRect | null;
  setLastDockIconPosition: (rect: DOMRect | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [activeWindows, setActiveWindows] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [aiListening, setAIListening] = useState(false);
  const [aiSpeaking, setAISpeaking] = useState(false);
  const [lastDockIconPosition, setLastDockIconPosition] =
    useState<DOMRect | null>(null);

  // Fetch tasks from backend on mount
  useEffect(() => {
    fetch("/api/tasks?userId=demo-user")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) setTasks(data.data);
      });
  }, []);

  // Fetch goals from backend on mount
  useEffect(() => {
    fetch("/api/goals?userId=demo-user")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) setGoals(data.data);
      });
  }, []);

  // Fetch mood entries from backend on mount
  useEffect(() => {
    fetch("/api/mood/entries?userId=demo-user")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) setMoodEntries(data.data);
      });
  }, []);

  // Sample data
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Study for Calculus exam",
      priority: "High",
      completed: false,
      dueDate: "2024-01-18",
      aiSuggested: true,
    },
    {
      id: "2",
      title: "Do laundry",
      priority: "Medium",
      completed: false,
      aiSuggested: true,
    },
    {
      id: "3",
      title: "Call mom",
      priority: "Low",
      completed: true,
    },
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Master React Development",
      description: "Become proficient in React and modern web development",
      progress: 65,
      targetDate: "2024-06-01",
      category: "Career",
    },
    {
      id: "2",
      title: "Improve Mental Health",
      description: "Practice mindfulness and maintain better work-life balance",
      progress: 45,
      targetDate: "2024-03-01",
      category: "Wellness",
    },
  ]);

  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([
    { date: "2024-01-15", mood: "Stressed", energy: 3, notes: "Exam pressure" },
    { date: "2024-01-14", mood: "Happy", energy: 4 },
    { date: "2024-01-13", mood: "Neutral", energy: 3 },
    { date: "2024-01-12", mood: "Excited", energy: 5 },
    { date: "2024-01-11", mood: "Tired", energy: 2 },
    { date: "2024-01-10", mood: "Happy", energy: 4 },
    { date: "2024-01-09", mood: "Anxious", energy: 3 },
  ]);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Calculus Exam",
      date: "2024-01-18",
      time: "10:00 AM",
      type: "exam",
    },
    {
      id: "2",
      title: "Laundry Time",
      date: "2024-01-16",
      time: "6:00 PM",
      type: "ai-scheduled",
    },
    {
      id: "3",
      title: "Study Session",
      date: "2024-01-17",
      time: "2:00 PM",
      type: "personal",
    },
  ]);

  const [chatMessages, setChatMessages] = useState<
    {
      role: "user" | "ai";
      content: string;
      timestamp: Date;
    }[]
  >([
    {
      role: "ai",
      content: "Hi! I'm your AI mentor. How's your day going?",
      timestamp: new Date(),
    },
  ]);

  const openWindow = (windowId: string, iconPosition?: DOMRect | null) => {
    if (iconPosition) setLastDockIconPosition(iconPosition);
    setActiveWindows((prev) => {
      if (prev.includes(windowId)) return prev;
      return [...prev, windowId];
    });
  };

  const closeWindow = (windowId: string) => {
    setActiveWindows((prev) => prev.filter((id) => id !== windowId));
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const addTask = async (task: Omit<Task, "id">) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, userId: "demo-user" }),
      });
      if (!response.ok) throw new Error("Failed to add task");
      const result = await response.json();
      setTasks((prev) => [...prev, result.data]);
    } catch (err) {
      alert("Error adding task");
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const addGoal = async (goal: Omit<Goal, "id">) => {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...goal, userId: "demo-user" }),
      });
      if (!response.ok) throw new Error("Failed to add goal");
      const result = await response.json();
      setGoals((prev) => [...prev, result.data]);
    } catch (err) {
      alert("Error adding goal");
    }
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal))
    );
  };

  const addMoodEntry = async (entry: MoodEntry) => {
    try {
      const response = await fetch("/api/mood/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entry, userId: "demo-user" }),
      });
      if (!response.ok) throw new Error("Failed to add mood entry");
      const result = await response.json();
      setMoodEntries((prev) => [result.data, ...prev]);
    } catch (err) {
      alert("Error adding mood entry");
    }
  };

  const addCalendarEvent = (event: Omit<CalendarEvent, "id">) => {
    setCalendarEvents((prev) => [...prev, { ...event, id: generateId() }]);
  };

  const addChatMessage = (message: {
    role: "user" | "ai";
    content: string;
  }) => {
    setChatMessages((prev) => [...prev, { ...message, timestamp: new Date() }]);
  };

  return (
    <AppContext.Provider
      value={{
        activeWindows,
        darkMode,
        tasks,
        goals,
        moodEntries,
        calendarEvents,
        chatMessages,
        aiListening,
        aiSpeaking,
        openWindow,
        closeWindow,
        toggleDarkMode,
        addTask,
        updateTask,
        addGoal,
        updateGoal,
        addMoodEntry,
        addCalendarEvent,
        addChatMessage,
        setAIListening,
        setAISpeaking,
        lastDockIconPosition,
        setLastDockIconPosition,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
