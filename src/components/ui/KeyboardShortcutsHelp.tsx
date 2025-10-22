"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Navigation, Zap, Search, Palette, HelpCircle } from 'lucide-react';
import { useKeyboardShortcutHelp, KeyboardShortcutManager } from '@/lib/keyboard-shortcuts';

const categoryIcons = {
  navigation: Navigation,
  actions: Zap,
  search: Search,
  theme: Palette,
  help: HelpCircle,
};

export default function KeyboardShortcutsHelp() {
  const { isHelpVisible, toggleHelp, shortcuts } = useKeyboardShortcutHelp();

  return (
    <AnimatePresence>
      {isHelpVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={toggleHelp}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Speed up your workflow with these shortcuts
                  </p>
                </div>
              </div>
              <button
                onClick={toggleHelp}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {shortcuts.length === 0 ? (
                <div className="text-center py-12">
                  <Keyboard className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No keyboard shortcuts are currently active
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {shortcuts.map((group) => {
                    const IconComponent = categoryIcons[group.name.toLowerCase() as keyof typeof categoryIcons] || Keyboard;
                    
                    return (
                      <div key={group.name} className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {group.name}
                          </h3>
                        </div>
                        
                        <div className="space-y-3">
                          {group.shortcuts.map((shortcut, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {shortcut.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 ml-4">
                                {KeyboardShortcutManager.formatShortcut(shortcut)
                                  .split(' + ')
                                  .map((key, keyIndex) => (
                                    <React.Fragment key={keyIndex}>
                                      {keyIndex > 0 && (
                                        <span className="text-gray-400 dark:text-gray-500 mx-1">+</span>
                                      )}
                                      <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 shadow-sm">
                                        {key}
                                      </kbd>
                                    </React.Fragment>
                                  ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span>💡</span>
                  <span>Press <kbd className="px-1 py-0.5 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded">?</kbd> anytime to toggle this help</span>
                </div>
                <button
                  onClick={toggleHelp}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
