import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Sparkles, Bot, User } from "lucide-react";
import { useApp } from "../context/AppContext";

const AIChatWindow: React.FC = () => {
  const {
    chatMessages,
    addChatMessage,
    aiListening,
    setAIListening,
    addTask,
    addCalendarEvent,
    addMoodEntry,
    openWindow,
    closeWindow,
  } = useApp();

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [currentPendingAction, setCurrentPendingAction] = useState<any | null>(
    null
  );
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [actionQueue, setActionQueue] = useState<any[]>([]);
  const [currentAction, setCurrentAction] = useState<any | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const getPromptFor = (action: any): string => {
    switch (action.type) {
      case "task":
        return `add "${action.data.title}" to your tasks`;
      case "calendar":
        return `add "${action.data.title}" to your calendar`;
      case "mood":
        return `log your mood as "${action.data.mood}"`;
      case "goal":
        return `set a goal: "${action.data.title}"`;
      default:
        return "perform this action";
    }
  };

  const sendAIMessage = async (userMessage: string) => {
    setIsTyping(true);
    try {
      const response = await fetch("/api/agent/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo-user", message: userMessage }),
      });
      const data = await response.json();
      addChatMessage({
        role: "ai",
        content: data.data?.message || "Sorry, no response.",
      });
      if (data.data?.pendingConfirmations?.length) {
        setCurrentPendingAction(data.data.pendingConfirmations[0]);
        setPendingActions(data.data.pendingConfirmations.slice(1));
        addChatMessage({
          role: "ai",
          content: `Would you like me to ${getPromptFor(data.data.pendingConfirmations[0])}?`,
        });
        setIsTyping(false);
        return;
      }
    } catch (err) {
      addChatMessage({ role: "ai", content: "Error contacting AI agent." });
    }
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const confirmationWords = ["yes", "yep", "sure", "ok", "okay"];
    const isConfirmation = confirmationWords.includes(
      inputValue.trim().toLowerCase()
    );
    const rejectionWords = ["no", "nope", "not now", "skip"];
    const isRejection = rejectionWords.includes(
      inputValue.trim().toLowerCase()
    );
    addChatMessage({ role: "user", content: inputValue });
    if (currentPendingAction && isConfirmation) {
      // Execute the current action
      await fetch("/api/agent/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          action: currentPendingAction,
        }),
      });
      addChatMessage({
        role: "ai",
        content: `✅ Done! I added "${currentPendingAction.data.title}" to your ${currentPendingAction.type}.`,
      });
      // Move to next action
      if (pendingActions.length > 0) {
        const next = pendingActions[0];
        setCurrentPendingAction(next);
        setPendingActions(pendingActions.slice(1));
        addChatMessage({
          role: "ai",
          content: `Would you like me to ${getPromptFor(next)}?`,
        });
      } else {
        setCurrentPendingAction(null);
        addChatMessage({
          role: "ai",
          content: `🎉 All done! Let me know if you'd like to organize anything else.`,
        });
      }
      setInputValue("");
      return;
    }
    if (currentPendingAction && isRejection) {
      // Skip current action, move to next
      if (pendingActions.length > 0) {
        const next = pendingActions[0];
        setCurrentPendingAction(next);
        setPendingActions(pendingActions.slice(1));
        addChatMessage({
          role: "ai",
          content: `No problem! Would you like me to ${getPromptFor(next)}?`,
        });
      } else {
        setCurrentPendingAction(null);
        addChatMessage({
          role: "ai",
          content: `Okay, let me know if you want to do anything else!`,
        });
      }
      setInputValue("");
      return;
    }
    // If not a confirmation/rejection, send to LLM
    sendAIMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleListening = () => {
    setAIListening(!aiListening);
    if (!aiListening) {
      // Simulate voice input after 2 seconds
      setTimeout(() => {
        setInputValue(
          "I'm feeling overwhelmed. I have an exam Thursday and laundry's piling up."
        );
        setAIListening(false);
      }, 2000);
    }
  };

  const handleConfirmAction = async (action: any) => {
    // Confirm and execute the action
    await fetch("/api/agent/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "demo-user", action }),
    });
    // Open relevant window
    if (action.type === "calendar") {
      openWindow("calendar");
      setTimeout(() => closeWindow("calendar"), 3000);
    } else if (action.type === "task") {
      openWindow("tasks");
      setTimeout(() => closeWindow("tasks"), 3000);
    } else if (action.type === "goal") {
      openWindow("goals");
      setTimeout(() => closeWindow("goals"), 3000);
    } else if (action.type === "mood") {
      openWindow("mood");
      setTimeout(() => closeWindow("mood"), 3000);
    }
    addChatMessage({
      role: "ai",
      content: `Great! I've added your ${action.type}.`,
    });
    setPendingActions([]);
  };

  const handleRejectAction = () => {
    addChatMessage({
      role: "ai",
      content: "No problem! I won't take any action.",
    });
    setPendingActions([]);
  };

  return (
    <div className="flex h-full max-w-7xl mx-auto">
      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {chatMessages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-6 rounded-2xl ${
                  message.role === "user"
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white mr-auto"
                }`}
              >
                {message.role === "ai" && (
                  <div className="flex items-center space-x-3 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-semibold text-purple-500">
                      AI Assistant
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap text-lg leading-relaxed">
                  {message.content}
                </p>
                <p className="text-sm opacity-70 mt-3">
                  {typeof message.timestamp === "string"
                    ? new Date(message.timestamp).toLocaleTimeString()
                    : message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl">
                <div className="flex items-center space-x-3 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-semibold text-purple-500">
                    AI Assistant
                  </span>
                </div>
                <div className="flex space-x-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                    className="w-3 h-3 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                    className="w-3 h-3 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                    className="w-3 h-3 bg-gray-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-8 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50">
          <div className="max-w-4xl mx-auto flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or use voice input..."
                className="w-full p-4 pr-16 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg"
                rows={1}
                style={{ minHeight: "60px", maxHeight: "120px" }}
              />
              {aiListening && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full"
                />
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleListening}
              className={`p-4 rounded-2xl transition-colors ${
                aiListening
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}
            >
              {aiListening ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="p-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-2xl transition-colors disabled:cursor-not-allowed shadow-lg"
            >
              <Send className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Assistant Actions Panel */}
      <div className="w-96 border-l border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 p-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
          Quick Actions
        </h3>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openWindow("tasks")}
            className="w-full p-6 text-left bg-white dark:bg-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-600"
          >
            <div className="font-semibold text-gray-800 dark:text-white text-lg mb-2">
              Manage Tasks
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Add or edit your to-do items
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openWindow("calendar")}
            className="w-full p-6 text-left bg-white dark:bg-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-600"
          >
            <div className="font-semibold text-gray-800 dark:text-white text-lg mb-2">
              Schedule Events
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Plan your day and week
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openWindow("mood")}
            className="w-full p-6 text-left bg-white dark:bg-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-600"
          >
            <div className="font-semibold text-gray-800 dark:text-white text-lg mb-2">
              Track Mood
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Log how you're feeling
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openWindow("goals")}
            className="w-full p-6 text-left bg-white dark:bg-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-600"
          >
            <div className="font-semibold text-gray-800 dark:text-white text-lg mb-2">
              Set Goals
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Define and track objectives
            </div>
          </motion.button>
        </div>

        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 text-lg">
            💡 Tip
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            Try saying "I'm feeling overwhelmed with my exam and laundry" to see
            how I can help organize your tasks!
          </p>
        </div>
      </div>

      {/* Sequential confirmation UI for current action */}
      {currentPendingAction && (
        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 shadow-2xl rounded-2xl p-8 flex flex-col items-center space-y-4">
          <div className="text-lg font-semibold text-blue-700 dark:text-blue-200">
            {`Would you like me to ${getPromptFor(currentPendingAction)}?`}
          </div>
          <div className="flex space-x-4">
            <button
              className="px-6 py-2 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600"
              onClick={async () => {
                await fetch("/api/agent/execute", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId: "demo-user",
                    action: currentPendingAction,
                  }),
                });
                addChatMessage({
                  role: "ai",
                  content: `✅ Done! I added "${currentPendingAction.data.title}" to your ${currentPendingAction.type}.`,
                });
                if (pendingActions.length > 0) {
                  const next = pendingActions[0];
                  setCurrentPendingAction(next);
                  setPendingActions(pendingActions.slice(1));
                  addChatMessage({
                    role: "ai",
                    content: `Would you like me to ${getPromptFor(next)}?`,
                  });
                } else {
                  setCurrentPendingAction(null);
                  addChatMessage({
                    role: "ai",
                    content: `🎉 All done! Let me know if you'd like to organize anything else.`,
                  });
                }
              }}
            >
              Yes
            </button>
            <button
              className="px-6 py-2 rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white font-bold hover:bg-gray-400 dark:hover:bg-gray-600"
              onClick={() => {
                if (pendingActions.length > 0) {
                  const next = pendingActions[0];
                  setCurrentPendingAction(next);
                  setPendingActions(pendingActions.slice(1));
                  addChatMessage({
                    role: "ai",
                    content: `No problem! Would you like me to ${getPromptFor(next)}?`,
                  });
                } else {
                  setCurrentPendingAction(null);
                  addChatMessage({
                    role: "ai",
                    content: `Okay, let me know if you want to do anything else!`,
                  });
                }
              }}
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatWindow;
