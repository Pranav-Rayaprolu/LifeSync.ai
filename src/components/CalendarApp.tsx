import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const CalendarApp: React.FC = () => {
  const { calendarEvents, addCalendarEvent } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    type: "personal" as "class" | "exam" | "personal" | "ai-scheduled",
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    addCalendarEvent(newEvent);
    setNewEvent({ title: "", date: "", time: "", type: "personal" });
    setShowAddEvent(false);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "class":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
      case "exam":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300";
      case "personal":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300";
      case "ai-scheduled":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "class":
        return <Users className="w-3 h-3" />;
      case "exam":
        return <AlertCircle className="w-3 h-3" />;
      case "personal":
        return <CalendarIcon className="w-3 h-3" />;
      case "ai-scheduled":
        return <Sparkles className="w-3 h-3" />;
      default:
        return <CalendarIcon className="w-3 h-3" />;
    }
  };

  const days = getDaysInMonth(selectedDate);
  const currentMonth = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Calendar
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Plan your days and stay organized
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddEvent(true)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center space-x-3 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Event</span>
          </motion.button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setSelectedDate(
                new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth() - 1,
                  1
                )
              )
            }
            className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>

          <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
            {currentMonth}
          </h4>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setSelectedDate(
                new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth() + 1,
                  1
                )
              )
            }
            className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-8">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-6 max-w-5xl mx-auto">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2 max-w-5xl mx-auto">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[120px] p-3 border border-gray-200 dark:border-gray-700 rounded-xl ${
                day
                  ? "bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                  : "bg-gray-50 dark:bg-gray-900"
              }`}
            >
              {day && (
                <>
                  <div className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                    {day.getDate()}
                  </div>

                  {/* Events for this day */}
                  <div className="space-y-1">
                    {getEventsForDate(day)
                      .slice(0, 2)
                      .map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-2 rounded-lg ${getEventTypeColor(event.type)} truncate`}
                        >
                          {event.title}
                        </div>
                      ))}
                    {getEventsForDate(day).length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        +{getEventsForDate(day).length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  Add New Event
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddEvent(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />

                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                  className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />

                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, time: e.target.value })
                  }
                  className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />

                <select
                  value={newEvent.type}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, type: e.target.value as any })
                  }
                  className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                >
                  <option value="personal">Personal</option>
                  <option value="class">Class</option>
                  <option value="exam">Exam</option>
                  <option value="ai-scheduled">AI Scheduled</option>
                </select>

                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddEvent}
                    className="flex-1 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium text-lg"
                  >
                    Add Event
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddEvent(false)}
                    className="flex-1 p-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl transition-colors font-medium text-lg"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarApp;
