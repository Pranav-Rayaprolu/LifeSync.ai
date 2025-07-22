import React from "react";
import { motion } from "framer-motion";

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Enhanced base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900 dark:via-purple-900 dark:to-slate-900" />

      {/* Animated background orbs with enhanced effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 dark:from-blue-500/15 dark:to-purple-500/15 rounded-full blur-3xl"
          style={{
            filter: "blur(40px)",
            boxShadow: "0 0 100px rgba(59, 130, 246, 0.3)",
          }}
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-200/30 to-orange-200/30 dark:from-pink-500/15 dark:to-orange-500/15 rounded-full blur-3xl"
          style={{
            filter: "blur(35px)",
            boxShadow: "0 0 80px rgba(236, 72, 153, 0.3)",
          }}
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-green-200/30 to-blue-200/30 dark:from-green-500/15 dark:to-blue-500/15 rounded-full blur-3xl"
          style={{
            filter: "blur(30px)",
            boxShadow: "0 0 60px rgba(34, 197, 94, 0.3)",
          }}
        />

        {/* Additional floating elements */}
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, 30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/3 right-1/2 w-32 h-32 bg-gradient-to-r from-yellow-200/20 to-orange-200/20 dark:from-yellow-500/10 dark:to-orange-500/10 rounded-full blur-2xl"
        />

        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, -40, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-full blur-2xl"
        />
      </div>

      {/* Enhanced pattern overlay */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.1"
              />
            </pattern>
            <pattern
              id="dots"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.1" />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#grid)"
            className="text-gray-400 dark:text-gray-600"
          />
          <rect
            width="100%"
            height="100%"
            fill="url(#dots)"
            className="text-gray-300 dark:text-gray-700"
          />
        </svg>
      </div>

      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" opacity="0.4" />
        </svg>
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 dark:to-black/5" />
    </div>
  );
};

export default Background;
