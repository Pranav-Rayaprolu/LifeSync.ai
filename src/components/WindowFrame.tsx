import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Square } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface WindowFrameProps {
  title: string;
  windowId: string;
  children: ReactNode;
  width?: string;
  height?: string;
  className?: string;
}

const WindowFrame: React.FC<WindowFrameProps> = ({ 
  title, 
  windowId, 
  children, 
  width = 'w-full max-w-4xl', 
  height = 'h-full max-h-[80vh]',
  className = ''
}) => {
  const { closeWindow } = useApp();

  return (
    <motion.div
      layout
      className={`${width} ${height} ${className} backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden`}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => closeWindow(windowId)}
              className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors"
            />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <Square className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => closeWindow(windowId)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </div>
      </div>
      
      {/* Content */}
      <div className="h-full overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
};

export default WindowFrame;