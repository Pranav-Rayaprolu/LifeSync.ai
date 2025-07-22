import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  Edit3,
  Trash2,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const categories = [
  "Career",
  "Health",
  "Wellness",
  "Education",
  "Personal",
  "Finance",
];

const GoalManager: React.FC = () => {
  const { goals, addGoal, updateGoal } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "Personal",
    targetDate: "",
  });

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;

    addGoal({
      title: newGoal.title,
      description: newGoal.description,
      progress: 0,
      targetDate: newGoal.targetDate,
      category: newGoal.category,
    });

    setNewGoal({
      title: "",
      description: "",
      category: "Personal",
      targetDate: "",
    });
    setShowAddForm(false);
  };

  const handleUpdateProgress = (id: string, progress: number) => {
    updateGoal(id, { progress: Math.max(0, Math.min(100, progress)) });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Career: "from-blue-400 to-blue-600",
      Health: "from-green-400 to-green-600",
      Wellness: "from-pink-400 to-pink-600",
      Education: "from-purple-400 to-purple-600",
      Personal: "from-orange-400 to-orange-600",
      Finance: "from-emerald-400 to-emerald-600",
    };
    return (
      colors[category as keyof typeof colors] || "from-gray-400 to-gray-600"
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80)
      return "text-green-600 bg-green-100 dark:bg-green-900/20";
    if (progress >= 50)
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
    return "text-red-600 bg-red-100 dark:bg-red-900/20";
  };

  const getTotalProgress = () => {
    if (goals.length === 0) return 0;
    const total = goals.reduce((sum, goal) => sum + goal.progress, 0);
    return Math.round(total / goals.length);
  };

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              Your Goals
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track your progress and stay motivated
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </motion.button>
        </div>

        {/* Add Goal Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Create New Goal
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                  placeholder="Enter goal title"
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newGoal.category}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, category: e.target.value })
                  }
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newGoal.description}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, description: e.target.value })
                }
                placeholder="Describe your goal"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none"
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={newGoal.targetDate}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, targetDate: e.target.value })
                }
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>

            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddGoal}
                className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                Create Goal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.length > 0 ? (
            goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Goal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryColor(goal.category)}`}
                      >
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {goal.category}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {goal.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {goal.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progress
                    </span>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-full ${getProgressColor(goal.progress)}`}
                    >
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-2 rounded-full bg-gradient-to-r ${getCategoryColor(goal.category)}`}
                    />
                  </div>
                </div>

                {/* Progress Controls */}
                <div className="flex items-center space-x-2 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      handleUpdateProgress(goal.id, goal.progress - 5)
                    }
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors"
                  >
                    -5%
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      handleUpdateProgress(goal.id, goal.progress + 5)
                    }
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                  >
                    +5%
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      handleUpdateProgress(goal.id, goal.progress + 10)
                    }
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                  >
                    +10%
                  </motion.button>
                </div>

                {/* Target Date */}
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                No goals yet
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                Create your first goal to start tracking progress
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 p-6">
        {/* Overall Progress */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">
              {getTotalProgress()}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Overall Progress
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getTotalProgress()}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
              />
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg mb-6">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Categories
          </h5>
          <div className="space-y-3">
            {categories.map((category) => {
              const categoryGoals = goals.filter(
                (goal) => goal.category === category
              );
              const count = categoryGoals.length;
              const averageProgress =
                count > 0
                  ? Math.round(
                      categoryGoals.reduce(
                        (sum, goal) => sum + goal.progress,
                        0
                      ) / count
                    )
                  : 0;

              return (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full bg-gradient-to-r ${getCategoryColor(category)}`}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {count} goals • {averageProgress}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-6 rounded-xl text-white">
          <div className="text-center">
            <div className="text-2xl mb-3">💪</div>
            <p className="text-sm font-medium mb-2">
              "Success is the progressive realization of predetermined goals."
            </p>
            <p className="text-xs opacity-80">- Earl Nightingale</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalManager;
