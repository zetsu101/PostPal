"use client";
import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { safeLocalStorage, safeWindow, safeDocument } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = safeLocalStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (theme === 'system') {
      const systemTheme = safeWindow.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
      if (safeDocument.documentElement) {
        safeDocument.documentElement.classList.toggle('dark', systemTheme === 'dark');
      }
    } else {
      if (safeDocument.documentElement) {
        safeDocument.documentElement.classList.toggle('dark', theme === 'dark');
      }
    }

    safeLocalStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="relative">
      <motion.div
        className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {[
          { value: 'light' as Theme, icon: Sun, label: 'Light' },
          { value: 'system' as Theme, icon: Monitor, label: 'System' },
          { value: 'dark' as Theme, icon: Moon, label: 'Dark' }
        ].map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => handleThemeChange(value)}
            className={`relative p-2 rounded-md transition-all duration-200 ${
              theme === value
                ? 'text-[#87CEFA] bg-[#87CEFA]/10'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
            title={`Switch to ${label} theme`}
          >
            <Icon size={18} />
            {theme === value && (
              <motion.div
                className="absolute inset-0 bg-[#87CEFA]/10 rounded-md"
                layoutId="theme-indicator"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </motion.div>
    </div>
  );
}

// Hook for using theme in components
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = safeLocalStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const isDark = mounted && (
    theme === 'dark' || 
    (theme === 'system' && safeWindow.matchMedia?.('(prefers-color-scheme: dark)')?.matches)
  );

  return { theme, setTheme, isDark, mounted };
}
