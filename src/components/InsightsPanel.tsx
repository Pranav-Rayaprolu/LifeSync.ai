import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Heart,
  CheckSquare,
  BarChart3,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useApp } from "../context/AppContext";

interface InsightsPanelProps {
  embedded?: boolean;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ embedded = false }) => {
  const { tasks, goals, moodEntries, calendarEvents } = useApp();

  const getProductivityData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    return last7Days.map((date) => {
      const completedTasks = tasks.filter(
        (task) => task.completed && task.dueDate === date
      ).length;

      const totalTasks = tasks.filter((task) => task.dueDate === date).length;
      const productivity =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        productivity: Math.round(productivity),
        completed: completedTasks,
        total: totalTasks,
      };
    });
  };

  const getMoodDistribution = () => {
    const moodCounts = moodEntries.reduce(
      (acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const colors = {
      Excited: "#fbbf24",
      Happy: "#34d399",
      Neutral: "#9ca3af",
      Tired: "#a78bfa",
      Stressed: "#f87171",
      Anxious: "#fb923c",
      Sad: "#60a5fa",
    };

    return Object.entries(moodCounts).map(([mood, count]) => ({
      name: mood,
      value: count,
      color: colors[mood as keyof typeof colors] || "#9ca3af",
    }));
  };

  const getGoalStats = () => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter((goal) => goal.progress >= 100).length;
    const inProgressGoals = goals.filter(
      (goal) => goal.progress > 0 && goal.progress < 100
    ).length;
    const notStartedGoals = goals.filter((goal) => goal.progress === 0).length;

    return { totalGoals, completedGoals, inProgressGoals, notStartedGoals };
  };

  const getTaskStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const highPriorityTasks = tasks.filter(
      (task) => task.priority === "High" && !task.completed
    ).length;
    const aiSuggestedTasks = tasks.filter((task) => task.aiSuggested).length;

    return { totalTasks, completedTasks, highPriorityTasks, aiSuggestedTasks };
  };

  const generateInsights = () => {
    // This would typically call an AI service to generate new insights
    console.log("Generating new insights...");
  };

  const productivityScore = getProductivityData()[0].productivity;
  const weeklyTrends = [
    {
      title: "Task Completion",
      description: "You're completing tasks on time",
      type: "positive",
    },
    {
      title: "Mood Improvement",
      description: "Your mood is improving",
      type: "positive",
    },
    {
      title: "Goal Progress",
      description: "You're making progress towards your goals",
      type: "positive",
    },
  ];

  const aiRecommendations = [
    {
      title: "AI-Suggested Task",
      description: "Consider completing this task to improve productivity",
      confidence: 0.8,
    },
    {
      title: "High-Priority Task",
      description:
        "Focus on this high-priority task to make significant progress",
      confidence: 0.7,
    },
    {
      title: "New Task",
      description: "Add a new task to your schedule",
      confidence: 0.6,
    },
  ];

  const content = (
    <div className="flex flex-col h-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              AI Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Discover patterns and get personalized recommendations
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateInsights}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center space-x-3 shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh Insights</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Productivity Score */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                Productivity Score
              </h4>

              <div className="text-center">
                <div className="relative inline-block">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - productivityScore / 100)}`}
                      className="text-blue-500"
                      initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                      animate={{
                        strokeDashoffset:
                          2 * Math.PI * 56 * (1 - productivityScore / 100),
                      }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800 dark:text-white">
                        {productivityScore}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        out of 100
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-lg text-gray-700 dark:text-gray-300">
                  {productivityScore >= 80
                    ? "Excellent! Keep up the great work!"
                    : productivityScore >= 60
                      ? "Good progress! You're on the right track."
                      : productivityScore >= 40
                        ? "You're making progress. Keep going!"
                        : "Let's work on improving your productivity together."}
                </div>
              </div>
            </div>

            {/* Weekly Trends */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                Weekly Trends
              </h4>

              <div className="space-y-6">
                {weeklyTrends.map((trend, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                  >
                    <div
                      className={`p-3 rounded-xl ${trend.type === "positive" ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"}`}
                    >
                      {trend.type === "positive" ? (
                        <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 dark:text-white">
                        {trend.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {trend.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* AI Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                AI Recommendations
              </h4>

              <div className="space-y-6">
                {aiRecommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-blue-800 dark:text-blue-200 text-lg mb-2">
                          {recommendation.title}
                        </h5>
                        <p className="text-blue-700 dark:text-blue-300 mb-4 leading-relaxed">
                          {recommendation.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            Confidence:
                          </div>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < recommendation.confidence
                                    ? "bg-blue-500"
                                    : "bg-blue-200 dark:bg-blue-800"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                Performance Metrics
              </h4>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div>
                    <div className="font-semibold text-green-800 dark:text-green-200">
                      Task Completion
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-300">
                      This week
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                    85%
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div>
                    <div className="font-semibold text-blue-800 dark:text-blue-200">
                      Focus Time
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-300">
                      Average per day
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    6.2h
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div>
                    <div className="font-semibold text-purple-800 dark:text-purple-200">
                      Goal Progress
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-300">
                      Monthly average
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    72%
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div>
                    <div className="font-semibold text-orange-800 dark:text-orange-200">
                      Mood Score
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-300">
                      Weekly average
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                    7.8/10
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return <div className="max-w-7xl mx-auto">{content}</div>;
  }

  return <div className="max-w-7xl mx-auto">{content}</div>;
};

export default InsightsPanel;
