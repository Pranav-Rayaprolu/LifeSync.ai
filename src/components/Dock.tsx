import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  CheckSquare,
  Calendar,
  Heart,
  Target,
  BarChart3,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const dockItems = [
  {
    id: "chat",
    icon: MessageCircle,
    label: "AI Chat",
    color: "from-blue-400 to-blue-600",
    glow: "shadow-blue-500/50",
  },
  {
    id: "tasks",
    icon: CheckSquare,
    label: "Tasks",
    color: "from-green-400 to-green-600",
    glow: "shadow-green-500/50",
  },
  {
    id: "calendar",
    icon: Calendar,
    label: "Calendar",
    color: "from-orange-400 to-orange-600",
    glow: "shadow-orange-500/50",
  },
  {
    id: "mood",
    icon: Heart,
    label: "Mood",
    color: "from-pink-400 to-pink-600",
    glow: "shadow-pink-500/50",
  },
  {
    id: "goals",
    icon: Target,
    label: "Goals",
    color: "from-purple-400 to-purple-600",
    glow: "shadow-purple-500/50",
  },
  {
    id: "insights",
    icon: BarChart3,
    label: "Insights",
    color: "from-indigo-400 to-indigo-600",
    glow: "shadow-indigo-500/50",
  },
];

export default function Dock() {
  const { openWindow, activeWindows } = useApp();
  const [visible, setVisible] = useState(true);
  const hideTimeout = useRef<number | null>(null);
  const iconRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lastMoveTime = useRef<number>(Date.now());

  // Auto-hide when mouse moves away from bottom with debounce
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMoveTime.current < 16) return; // Skip if less than ~60fps time has passed
      lastMoveTime.current = now;

      const fromBottom = window.innerHeight - e.clientY;
      if (fromBottom < 100) {
        setVisible(true);
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
      } else {
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        setVisible(false);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleMouseEnter = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setVisible(true);
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="dock"
          initial={{ opacity: 0, scaleY: 0.6, scaleX: 0.6, y: 50 }}
          animate={{ opacity: 1, scaleY: 1, scaleX: 1, y: 0 }}
          exit={{ opacity: 0, scaleY: 0.6, scaleX: 0.6, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 inset-x-0 z-50 flex justify-center pointer-events-none"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center justify-center gap-3 sm:gap-4 bg-white/10 dark:bg-gray-900/30 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 pointer-events-auto">
            {dockItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeWindows.includes(item.id);
              return (
                <motion.button
                  key={item.id}
                  ref={(el) => (iconRefs.current[item.id] = el)}
                  onClick={() => {
                    const rect =
                      iconRefs.current[item.id]?.getBoundingClientRect() ||
                      null;
                    openWindow(item.id, rect);
                  }}
                  whileHover={{ scale: 1.15, y: -10 }}
                  className="group relative flex flex-col items-center justify-end w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white transition-all duration-200 focus:outline-none"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <motion.div
                    className={`
                      w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${item.color}
                      flex items-center justify-center shadow-lg
                      ${isActive ? "ring-2 ring-white/60 ring-offset-2 ring-offset-transparent" : ""}
                      transition-all duration-300 ease-out
                      hover:shadow-xl ${item.glow}
                      relative overflow-hidden
                    `}
                    whileHover={{
                      boxShadow: `0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)`,
                    }}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white relative z-10" />
                  </motion.div>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 400,
                      }}
                    />
                  )}

                  {/* Tooltip */}
                  <span className="absolute bottom-14 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900/90 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap shadow-xl">
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
