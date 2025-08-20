"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: Sun, color: 'text-yellow-500' },
    { value: 'dark', label: 'Dark', icon: Moon, color: 'text-blue-500' },
    { value: 'system', label: 'System', icon: Monitor, color: 'text-purple-500' },
  ] as const;

  return (
    <div className="relative group">
      <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <Palette className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
      
      {/* Theme Dropdown */}
      <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Choose Theme</h3>
        </div>
        
        <div className="p-2">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isActive = theme === themeOption.value;
            
            return (
              <motion.button
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`w-4 h-4 ${themeOption.color}`} />
                <span className="text-sm font-medium">{themeOption.label}</span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
        
        {/* Current Theme Indicator */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-500' : 'bg-yellow-500'}`} />
            <span>Current: {isDark ? 'Dark' : 'Light'} Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for mobile/compact spaces
export function CompactThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-blue-500" />
      )}
    </motion.button>
  );
}
