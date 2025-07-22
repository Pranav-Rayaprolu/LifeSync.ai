import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Dock from "./components/Dock";
import AIOrb from "./components/AIOrb";
import AIChatWindow from "./components/AIChatWindow";
import TaskManager from "./components/TaskManager";
import CalendarApp from "./components/CalendarApp";
import MoodTracker from "./components/MoodTracker";
import GoalManager from "./components/GoalManager";
import InsightsPanel from "./components/InsightsPanel";
import DayHeader from "./components/DayHeader";
import Background from "./components/Background";
import { AppProvider, useApp } from "./context/AppContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const fetchData = async (endpoint: string) => {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error("Failed to fetch " + endpoint);
  return res.json();
};

const AppContent: React.FC = () => {
  const {
    activeWindows,
    darkMode,
    toggleDarkMode,
    closeWindow,
    lastDockIconPosition,
  } = useApp();
  const [showInsights, setShowInsights] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [moods, setMoods] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowInsights(scrollPosition > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const tasksRes = await fetchData("/tasks");
        setTasks(tasksRes.data || []);
        const goalsRes = await fetchData("/goals");
        setGoals(goalsRes.data || []);
        const moodsRes = await fetchData("/mood/entries");
        setMoods(moodsRes.data || []);
      } catch (err: any) {
        setError(err.message);
      }
    })();
  }, []);

  const renderActiveWindow = (windowId: string) => {
    switch (windowId) {
      case "tasks":
        return <TaskManager key="tasks" />;
      case "calendar":
        return <CalendarApp key="calendar" />;
      case "mood":
        return <MoodTracker key="mood" />;
      case "goals":
        return <GoalManager key="goals" />;
      case "insights":
        return <InsightsPanel key="insights" />;
      case "chat":
        return <AIChatWindow key="chat" />;
      default:
        return null;
    }
  };

  const getWindowTitle = (windowId: string) => {
    switch (windowId) {
      case "tasks":
        return "Task Manager";
      case "calendar":
        return "Calendar";
      case "mood":
        return "Mood Tracker";
      case "goals":
        return "Goal Manager";
      case "insights":
        return "Insights";
      case "chat":
        return "AI Assistant";
      default:
        return "App";
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${darkMode ? "dark" : ""}`}
    >
      <Background />

      <div className="relative min-h-screen">
        <DayHeader />

        {/* Main Content Area */}
        <div className="pt-20 pb-32 px-4">
          {/* Full Screen Windows */}
          <AnimatePresence mode="wait">
            {activeWindows.map((windowId) => {
              // Genie animation: calculate initial/final transform from dock icon
              let initial = {
                opacity: 0,
                scaleX: 0.3,
                scaleY: 0.3,
                x: 0,
                y: 100,
                transformOrigin: "50% 100%",
              };
              let animate = {
                opacity: 1,
                scaleX: 1,
                scaleY: 1,
                x: 0,
                y: 0,
                transformOrigin: "50% 50%",
              };
              let exit = {
                opacity: 0,
                scaleX: 0.3,
                scaleY: 0.3,
                x: 0,
                y: 100,
                transformOrigin: "50% 100%",
              };
              if (lastDockIconPosition) {
                // Calculate the dock icon's center relative to the viewport
                const iconCenterX =
                  lastDockIconPosition.left + lastDockIconPosition.width / 2;
                const iconCenterY =
                  lastDockIconPosition.top + lastDockIconPosition.height / 2;
                // Center of the window (assume viewport center)
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                const windowCenterX = viewportWidth / 2;
                const windowCenterY = viewportHeight / 2;
                // Offset from icon to window center
                const offsetX = iconCenterX - windowCenterX;
                const offsetY = iconCenterY - windowCenterY;
                initial = {
                  opacity: 0,
                  scaleX: 0.3,
                  scaleY: 0.3,
                  x: offsetX,
                  y: offsetY,
                  transformOrigin: "50% 100%",
                };
                animate = {
                  opacity: 1,
                  scaleX: 1,
                  scaleY: 1,
                  x: 0,
                  y: 0,
                  transformOrigin: "50% 50%",
                };
                exit = {
                  opacity: 0,
                  scaleX: 0.3,
                  scaleY: 0.3,
                  x: offsetX,
                  y: offsetY,
                  transformOrigin: "50% 100%",
                };
              }
              return (
                <motion.div
                  key={windowId}
                  initial={initial}
                  animate={animate}
                  exit={exit}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-6"
                  style={{ transformOrigin: initial.transformOrigin }}
                >
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  />
                  {/* Window Container */}
                  <motion.div
                    layout
                    className="relative w-full h-full max-w-7xl max-h-[95vh] mx-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden"
                    style={{
                      boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {/* Enhanced Title Bar */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-md">
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-all duration-200 shadow-sm"
                          />
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-all duration-200 shadow-sm"
                          />
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-all duration-200 shadow-sm"
                          />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-wide">
                          {getWindowTitle(windowId)}
                        </h2>
                      </div>
                      <div className="flex items-center space-x-3">
                        <motion.button
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgba(0,0,0,0.1)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgba(0,0,0,0.1)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                            />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgba(239,68,68,0.1)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => closeWindow(windowId)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        >
                          <svg
                            className="w-5 h-5 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                    {/* Window Content */}
                    <div className="h-full overflow-hidden">
                      {renderActiveWindow(windowId)}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Insights Panel */}
          <AnimatePresence>
            {showInsights && (
              <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                  duration: 0.5,
                }}
                className="mt-12"
              >
                <InsightsPanel embedded />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced Dark Mode Toggle */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleDarkMode}
          className="fixed top-6 right-6 z-40 p-4 rounded-2xl backdrop-blur-xl bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-700/30 shadow-xl hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-300"
          style={{
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          }}
        >
          <motion.div
            animate={{ rotate: darkMode ? 180 : 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl"
          >
            {darkMode ? "🌙" : "☀️"}
          </motion.div>
        </motion.button>

        {/* AI Orb */}
        <AIOrb />

        {/* Dock */}
        <Dock />

        <div
          style={{
            padding: 16,
            background: "#f9f9f9",
            margin: 16,
            borderRadius: 8,
          }}
        >
          <h2>Backend Connection Test</h2>
          {error && <div style={{ color: "red" }}>Error: {error}</div>}
          <div>
            <strong>Tasks:</strong> {tasks.length} loaded
          </div>
          <div>
            <strong>Goals:</strong> {goals.length} loaded
          </div>
          <div>
            <strong>Mood Entries:</strong> {moods.length} loaded
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
