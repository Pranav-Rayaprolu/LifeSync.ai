import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, X, AlertCircle, Clock, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

const TaskManager: React.FC = () => {
  const { tasks, addTask, updateTask } = useApp();
  const [newTask, setNewTask] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<
    "High" | "Medium" | "Low"
  >("Medium");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const handleAddTask = () => {
    if (!newTask.trim()) return;

    addTask({
      title: newTask,
      priority: selectedPriority,
      completed: false,
    });

    setNewTask("");
  };

  const toggleTask = (id: string, completed: boolean) => {
    updateTask(id, { completed });
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-500 bg-red-100 dark:bg-red-900/20";
      case "Medium":
        return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20";
      case "Low":
        return "text-green-500 bg-green-100 dark:bg-green-900/20";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-700";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return <AlertCircle className="w-4 h-4" />;
      case "Medium":
        return <Clock className="w-4 h-4" />;
      case "Low":
        return <Check className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto">
      {/* Header with filters */}
      <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Your Tasks
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Stay organized and productive
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {["all", "pending", "completed"].map((filterType) => (
              <motion.button
                key={filterType}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(filterType as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterType
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Add new task */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
              placeholder="Add a new task..."
              className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as any)}
            className="p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          >
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddTask}
            className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Tasks list */}
      <div className="flex-1 overflow-y-auto p-8">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="text-8xl mb-6">📝</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {filter === "completed"
                  ? "No completed tasks yet"
                  : "No tasks found"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === "completed"
                  ? "Complete some tasks to see them here"
                  : "Add your first task to get started"}
              </p>
            </motion.div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg ${
                    task.completed
                      ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-75"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                  }`}
                >
                  <div className="flex items-center space-x-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleTask(task.id, !task.completed)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        task.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400"
                      }`}
                    >
                      {task.completed && <Check className="w-5 h-5" />}
                    </motion.button>

                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <h4
                          className={`text-lg font-medium ${
                            task.completed
                              ? "text-gray-500 dark:text-gray-400 line-through"
                              : "text-gray-800 dark:text-white"
                          }`}
                        >
                          {task.title}
                        </h4>

                        {task.aiSuggested && (
                          <div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                              AI
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-6 mt-3">
                        <div
                          className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}
                        >
                          {getPriorityIcon(task.priority)}
                          <span>{task.priority}</span>
                        </div>

                        {task.dueDate && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateTask(task.id, { completed: true })}
                      className="opacity-0 group-hover:opacity-100 p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats footer */}
      <div className="p-8 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {tasks.filter((t) => !t.completed).length} pending,{" "}
            {tasks.filter((t) => t.completed).length} completed
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {tasks.filter((t) => t.aiSuggested).length} AI-suggested tasks
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
