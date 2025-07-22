import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

const AIOrb: React.FC = () => {
  const { openWindow, aiListening, aiSpeaking, setAIListening } = useApp();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    openWindow("chat");
    setAIListening(!aiListening);
  };

  const getOrbState = () => {
    if (aiSpeaking) return "speaking";
    if (aiListening) return "listening";
    return "idle";
  };

  const orbVariants = {
    idle: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(147, 51, 234, 0.2)",
        "0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(147, 51, 234, 0.3)",
        "0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(147, 51, 234, 0.2)",
      ],
    },
    listening: {
      scale: [1, 1.1, 1],
      boxShadow: [
        "0 0 40px rgba(34, 197, 94, 0.6), 0 0 80px rgba(34, 197, 94, 0.3)",
        "0 0 60px rgba(34, 197, 94, 0.8), 0 0 120px rgba(34, 197, 94, 0.4)",
        "0 0 40px rgba(34, 197, 94, 0.6), 0 0 80px rgba(34, 197, 94, 0.3)",
      ],
    },
    speaking: {
      scale: [1, 1.15, 0.95, 1.05, 1],
      boxShadow: [
        "0 0 50px rgba(168, 85, 247, 0.7), 0 0 100px rgba(168, 85, 247, 0.4)",
        "0 0 80px rgba(168, 85, 247, 0.9), 0 0 160px rgba(168, 85, 247, 0.5)",
        "0 0 50px rgba(168, 85, 247, 0.7), 0 0 100px rgba(168, 85, 247, 0.4)",
      ],
    },
  };

  const pulseVariants = {
    idle: { scale: 1, opacity: 0.4 },
    listening: {
      scale: [1, 1.6, 1],
      opacity: [0.4, 0.2, 0.4],
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
    },
    speaking: {
      scale: [1, 2, 1.3, 1.8, 1],
      opacity: [0.4, 0.1, 0.3, 0.2, 0.4],
      transition: { repeat: Infinity, duration: 0.8, ease: "easeInOut" },
    },
  };

  const sparkleVariants = {
    idle: { opacity: 0.3, scale: 1 },
    listening: {
      opacity: [0.3, 0.8, 0.3],
      scale: [1, 1.2, 1],
      transition: { repeat: Infinity, duration: 1.2 },
    },
    speaking: {
      opacity: [0.3, 1, 0.3],
      scale: [1, 1.4, 1],
      transition: { repeat: Infinity, duration: 0.6 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: 100, y: 100 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 300, delay: 1 }}
      className="fixed bottom-24 right-8 z-40"
    >
      <div className="relative">
        {/* Enhanced Pulse rings */}
        <motion.div
          variants={pulseVariants}
          animate={getOrbState()}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/60 to-purple-500/60"
          style={{ filter: "blur(12px)" }}
        />
        <motion.div
          variants={pulseVariants}
          animate={getOrbState()}
          className="absolute inset-3 rounded-full bg-gradient-to-r from-blue-300/40 to-purple-400/40"
          style={{ filter: "blur(6px)" }}
        />

        {/* Sparkles effect */}
        <motion.div
          variants={sparkleVariants}
          animate={getOrbState()}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
        </motion.div>
        <motion.div
          variants={sparkleVariants}
          animate={getOrbState()}
          className="absolute -bottom-2 -left-2"
        >
          <Sparkles className="w-3 h-3 text-blue-300" />
        </motion.div>

        {/* Main orb */}
        <motion.button
          variants={orbVariants}
          animate={getOrbState()}
          transition={{
            repeat: Infinity,
            duration: aiSpeaking ? 0.6 : aiListening ? 1.2 : 2,
            ease: "easeInOut",
          }}
          whileHover={{
            scale: 1.15,
            transition: { type: "spring", damping: 15, stiffness: 400 },
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClick}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-500 dark:to-indigo-500 flex items-center justify-center shadow-2xl border-2 border-white/30 backdrop-blur-xl overflow-hidden"
          style={{
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.8 }}
          />

          {/* Inner glow */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-300/30 to-purple-400/30 blur-sm" />

          {/* Icon */}
          <div className="relative z-10">
            {aiListening ? (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                <Mic className="w-8 h-8 text-white" />
              </motion.div>
            ) : (
              <motion.div
                className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full" />
              </motion.div>
            )}
          </div>

          {/* Enhanced Status indicators */}
          <div className="absolute -top-2 -right-2">
            {aiListening && (
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg"
              />
            )}
            {aiSpeaking && (
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="w-4 h-4 bg-purple-400 rounded-full border-2 border-white shadow-lg"
              />
            )}
          </div>
        </motion.button>

        {/* Enhanced Tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10,
            scale: isHovered ? 1 : 0.9,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="absolute bottom-full mb-3 right-0 px-4 py-2 bg-gray-900/90 backdrop-blur-sm text-white text-sm rounded-xl whitespace-nowrap shadow-xl border border-white/10"
          style={{
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
          }}
        >
          {aiListening
            ? "Listening..."
            : aiSpeaking
              ? "Speaking..."
              : "Talk to AI"}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/90"></div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AIOrb;
