"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutIndicatorProps {
  shortcut: string;
  description: string;
  visible?: boolean;
  duration?: number;
}

export default function KeyboardShortcutIndicator({
  shortcut,
  description,
  visible = true,
  duration = 3000,
}: KeyboardShortcutIndicatorProps) {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3 min-w-[200px]">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {description}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {shortcut.split(' + ').map((key, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <span className="text-gray-400 dark:text-gray-500 mx-1">+</span>
                    )}
                    <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300">
                      {key}
                    </kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for showing keyboard shortcut indicators
export function useKeyboardShortcutIndicator() {
  const [indicator, setIndicator] = useState<{
    shortcut: string;
    description: string;
    visible: boolean;
  }>({
    shortcut: '',
    description: '',
    visible: false,
  });

  const showIndicator = (shortcut: string, description: string) => {
    setIndicator({
      shortcut,
      description,
      visible: true,
    });
  };

  const Indicator = () => (
    <KeyboardShortcutIndicator
      shortcut={indicator.shortcut}
      description={indicator.description}
      visible={indicator.visible}
    />
  );

  return {
    showIndicator,
    Indicator,
  };
}
