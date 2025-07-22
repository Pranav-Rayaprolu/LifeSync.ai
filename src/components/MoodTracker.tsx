import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useApp } from "../context/AppContext";

const moodEmojis = {
  Excited: "🤩",
  Happy: "😊",
  Neutral: "😐",
  Tired: "😴",
  Stressed: "😰",
  Anxious: "😟",
  Sad: "😢",
};

const moodColors = {
  Excited: "from-yellow-400 to-orange-500",
  Happy: "from-green-400 to-blue-500",
  Neutral: "from-gray-400 to-gray-500",
  Tired: "from-purple-400 to-purple-600",
  Stressed: "from-red-400 to-red-600",
  Anxious: "from-orange-400 to-red-500",
  Sad: "from-blue-400 to-indigo-600",
};

const MoodTracker: React.FC = () => {
  const { moodEntries, addMoodEntry } = useApp();
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [energy, setEnergy] = useState(3);
  const [notes, setNotes] = useState("");
  const [showAddMood, setShowAddMood] = useState(false);
  const [modalMood, setModalMood] = useState<string>("");
  const [modalNote, setModalNote] = useState("");

  const handleSaveMood = () => {
    if (!selectedMood) return;
    addMoodEntry({
      date: new Date().toISOString(),
      mood: selectedMood,
      energy,
      notes: notes.trim() || undefined,
    });
    setSelectedMood("");
    setEnergy(3);
    setNotes("");
  };

  const handleModalSave = () => {
    if (!modalMood) return;
    addMoodEntry({
      date: new Date().toISOString(),
      mood: modalMood,
      energy,
      notes: modalNote.trim() || undefined,
    });
    setModalMood("");
    setModalNote("");
    setShowAddMood(false);
  };

  const getMostCommonMood = () => {
    const moodCounts = moodEntries.reduce(
      (counts, entry) => {
        counts[entry.mood] = (counts[entry.mood] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );
    const mostCommon = Object.entries(moodCounts).reduce((a, b) =>
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    );
    return mostCommon[0];
  };

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Mood Tracker
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your mood and mental state
          </p>
        </div>
        <button
          onClick={() => setShowAddMood(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Mood
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold mb-4 text-gray-800 dark:text-white">
              How are you feeling today?
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(moodEmojis).map(([mood, emoji]) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center text-sm ${
                    selectedMood === mood
                      ? "border-blue-500 bg-blue-100 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  {mood}
                </button>
              ))}
            </div>
            {selectedMood && (
              <div className="mt-4">
                <textarea
                  rows={3}
                  placeholder="Add a note (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
                />
                <button
                  onClick={handleSaveMood}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-xl w-full"
                >
                  Save Mood
                </button>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold mb-4 text-gray-800 dark:text-white">
              Recent Entries
            </h2>
            <div className="space-y-4">
              {moodEntries.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  No mood entries logged yet.
                </p>
              ) : (
                moodEntries.slice(0, 5).map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-xl"
                  >
                    <div className="text-2xl">
                      {moodEmojis[entry.mood as keyof typeof moodEmojis]}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 dark:text-white">
                        {entry.mood}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(entry.date).toLocaleString()}
                      </div>
                      {entry.notes && (
                        <p className="italic text-sm mt-1 text-gray-600 dark:text-gray-300">
                          "{entry.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold mb-4 text-gray-800 dark:text-white">
            Insights
          </h2>
          <div className="flex justify-between">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Most Common Mood
              </p>
              <p className="text-xl font-bold text-blue-500">
                {getMostCommonMood()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Entries
              </p>
              <p className="text-xl font-bold text-purple-500">
                {moodEntries.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddMood && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-md w-full shadow-xl"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Log Mood
                </h3>
                <button onClick={() => setShowAddMood(false)}>
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                {Object.entries(moodEmojis).map(([mood, emoji]) => (
                  <button
                    key={mood}
                    onClick={() => setModalMood(mood)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center text-sm ${
                      modalMood === mood
                        ? "border-blue-500 bg-blue-100 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    {mood}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                placeholder="Note (optional)"
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
              />
              <button
                onClick={handleModalSave}
                className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-xl"
              >
                Save Entry
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoodTracker;
