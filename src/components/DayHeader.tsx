import React from "react";
import { motion } from "framer-motion";
import { Calendar, Sun, Moon, CloudRain, Sparkles } from "lucide-react";

const DayHeader: React.FC = () => {
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getWeatherIcon = () => {
    // Mock weather - in real app this would come from an API
    const weather = ["sunny", "cloudy", "rainy"][Math.floor(Math.random() * 3)];
    switch (weather) {
      case "sunny":
        return <Sun className="w-6 h-6 text-yellow-500" />;
      case "rainy":
        return <CloudRain className="w-6 h-6 text-blue-500" />;
      default:
        return <Moon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTimeOfDay = () => {
    const hour = today.getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        type: "spring",
        damping: 20,
        stiffness: 300,
      }}
      className="fixed top-0 left-0 right-0 z-30 backdrop-blur-2xl bg-white/10 dark:bg-gray-900/10 border-b border-white/20 dark:border-gray-700/20"
      style={{
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Left section - Date and Weather */}
          <motion.div
            className="flex items-center space-x-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              className="flex items-center space-x-3 px-4 py-2 rounded-2xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", damping: 15, stiffness: 400 }}
            >
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {dateString}
              </span>
            </motion.div>

            <motion.div
              className="p-2 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", damping: 15, stiffness: 400 }}
            >
              {getWeatherIcon()}
            </motion.div>
          </motion.div>

          {/* Center section - Greeting */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center"
          >
            <motion.h1
              className="text-2xl font-bold text-gray-800 dark:text-white mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {getGreeting()}!
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 1 }}
                className="inline-block ml-2"
              >
                👋
              </motion.span>
            </motion.h1>
            <motion.p
              className="text-sm text-gray-600 dark:text-gray-300 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              Ready to make today productive?
            </motion.p>

            {/* Time-based decorative element */}
            <motion.div
              className="mt-2 flex justify-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right section - AI Badge */}
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg border border-white/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", damping: 15, stiffness: 400 }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800 dark:text-white">
                AI Assistant
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Always here to help
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default DayHeader;
