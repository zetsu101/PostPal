"use client";

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'search' | 'theme' | 'help';
}

export interface KeyboardShortcutGroup {
  name: string;
  shortcuts: KeyboardShortcut[];
}

class KeyboardShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private isHelpVisible = false;
  private listeners: Array<(visible: boolean) => void> = [];

  // Subscribe to help visibility changes
  subscribeToHelpVisibility(listener: (visible: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify listeners about help visibility changes
  private notifyHelpVisibilityChange() {
    this.listeners.forEach(listener => listener(this.isHelpVisible));
  }

  // Register a keyboard shortcut
  register(shortcut: KeyboardShortcut) {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  // Unregister a keyboard shortcut
  unregister(shortcut: KeyboardShortcut) {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.delete(key);
  }

  // Get all shortcuts grouped by category
  getShortcutsByCategory(): KeyboardShortcutGroup[] {
    const groups: KeyboardShortcutGroup[] = [];
    const categories = ['navigation', 'actions', 'search', 'theme', 'help'] as const;

    categories.forEach(category => {
      const shortcuts = Array.from(this.shortcuts.values()).filter(s => s.category === category);
      if (shortcuts.length > 0) {
        groups.push({
          name: this.getCategoryDisplayName(category),
          shortcuts: shortcuts.sort((a, b) => a.description.localeCompare(b.description))
        });
      }
    });

    return groups;
  }

  // Toggle help visibility
  toggleHelp() {
    this.isHelpVisible = !this.isHelpVisible;
    this.notifyHelpVisibilityChange();
  }

  // Get help visibility state
  isHelpOpen() {
    return this.isHelpVisible;
  }

  // Handle keyboard events
  handleKeyDown = (event: KeyboardEvent) => {
    // Don't trigger shortcuts if user is typing in an input
    if (this.isTypingInInput(event.target as HTMLElement)) {
      return;
    }

    const key = this.getEventKey(event);
    const shortcut = this.shortcuts.get(key);

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  };

  // Check if user is typing in an input field
  private isTypingInInput(element: HTMLElement | null): boolean {
    if (!element) return false;

    const tagName = element.tagName.toLowerCase();
    const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    const isContentEditable = element.contentEditable === 'true';

    return isInput || isContentEditable;
  }

  // Get shortcut key from event
  private getEventKey(event: KeyboardEvent): string {
    const parts = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    if (event.metaKey) parts.push('meta');
    
    parts.push(event.key.toLowerCase());
    
    return parts.join('+');
  }

  // Get shortcut key from shortcut object
  private getShortcutKey(shortcut: KeyboardShortcut): string {
    const parts = [];
    
    if (shortcut.ctrl) parts.push('ctrl');
    if (shortcut.shift) parts.push('shift');
    if (shortcut.alt) parts.push('alt');
    if (shortcut.meta) parts.push('meta');
    
    parts.push(shortcut.key.toLowerCase());
    
    return parts.join('+');
  }

  // Get display name for category
  private getCategoryDisplayName(category: string): string {
    const names: Record<string, string> = {
      navigation: 'Navigation',
      actions: 'Actions',
      search: 'Search',
      theme: 'Appearance',
      help: 'Help',
    };
    return names[category] || category;
  }

  // Format shortcut for display
  static formatShortcut(shortcut: KeyboardShortcut): string {
    const parts = [];
    
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.meta) parts.push('Cmd');
    
    // Capitalize the key
    const key = shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase();
    parts.push(key);
    
    return parts.join(' + ');
  }
}

// Create singleton instance
export const keyboardShortcutManager = new KeyboardShortcutManager();

// Export the class for use in components
export { KeyboardShortcutManager };

// Hook for using keyboard shortcuts in React components
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], dependencies: any[] = []) {
  useEffect(() => {
    // Register shortcuts
    shortcuts.forEach(shortcut => {
      keyboardShortcutManager.register(shortcut);
    });

    // Add event listener
    document.addEventListener('keydown', keyboardShortcutManager.handleKeyDown);

    return () => {
      // Unregister shortcuts
      shortcuts.forEach(shortcut => {
        keyboardShortcutManager.unregister(shortcut);
      });

      // Remove event listener
      document.removeEventListener('keydown', keyboardShortcutManager.handleKeyDown);
    };
  }, dependencies);
}

// Hook for help visibility
export function useKeyboardShortcutHelp() {
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = keyboardShortcutManager.subscribeToHelpVisibility(setIsHelpVisible);
    return unsubscribe;
  }, []);

  const toggleHelp = useCallback(() => {
    keyboardShortcutManager.toggleHelp();
  }, []);

  return {
    isHelpVisible,
    toggleHelp,
    shortcuts: keyboardShortcutManager.getShortcutsByCategory(),
  };
}

// Common shortcuts for the application
export function createAppShortcuts(router: ReturnType<typeof useRouter>) {
  return [
    // Navigation shortcuts
    {
      key: 'h',
      ctrl: true,
      description: 'Go to Home/Dashboard',
      action: () => router.push('/dashboard'),
      category: 'navigation' as const,
    },
    {
      key: 'c',
      ctrl: true,
      description: 'Create new post',
      action: () => router.push('/create'),
      category: 'navigation' as const,
    },
    {
      key: 'a',
      ctrl: true,
      description: 'Open Analytics',
      action: () => router.push('/analytics'),
      category: 'navigation' as const,
    },
    {
      key: 'k',
      ctrl: true,
      description: 'Open Calendar',
      action: () => router.push('/calendar'),
      category: 'navigation' as const,
    },
    {
      key: 'm',
      ctrl: true,
      description: 'Open Media Library',
      action: () => router.push('/media'),
      category: 'navigation' as const,
    },
    {
      key: 's',
      ctrl: true,
      description: 'Open Settings',
      action: () => router.push('/settings'),
      category: 'navigation' as const,
    },
    {
      key: 'b',
      ctrl: true,
      description: 'Open Billing',
      action: () => router.push('/billing'),
      category: 'navigation' as const,
    },
    {
      key: 't',
      ctrl: true,
      description: 'Open Team',
      action: () => router.push('/team'),
      category: 'navigation' as const,
    },

    // Action shortcuts
    {
      key: 'n',
      ctrl: true,
      description: 'New post (quick create)',
      action: () => router.push('/create'),
      category: 'actions' as const,
    },
    {
      key: 'r',
      ctrl: true,
      description: 'Refresh page',
      action: () => window.location.reload(),
      category: 'actions' as const,
    },
    {
      key: 'escape',
      description: 'Close modal/dialog',
      action: () => {
        // Close any open modals or dialogs
        const modals = document.querySelectorAll('[data-modal="true"]');
        modals.forEach(modal => {
          const closeButton = modal.querySelector('[data-close="true"]') as HTMLElement;
          if (closeButton) closeButton.click();
        });
      },
      category: 'actions' as const,
    },

    // Search shortcuts
    {
      key: '/',
      description: 'Focus search bar',
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="search" i], input[placeholder*="Search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      category: 'search' as const,
    },
    {
      key: 'f',
      ctrl: true,
      description: 'Find in page',
      action: () => {
        // Trigger browser's find functionality
        if (navigator.userAgent.includes('Firefox')) {
          // Firefox
          document.execCommand('find');
        } else {
          // Chrome, Safari, Edge
          document.execCommand('find');
        }
      },
      category: 'search' as const,
    },

    // Theme shortcuts
    {
      key: 'd',
      ctrl: true,
      shift: true,
      description: 'Toggle dark mode',
      action: () => {
        // Get current theme from localStorage
        const currentTheme = localStorage.getItem('theme') || 'system';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        
        // Trigger theme change event
        window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: newTheme } }));
      },
      category: 'theme' as const,
    },

    // Help shortcuts
    {
      key: '?',
      description: 'Show keyboard shortcuts help',
      action: () => keyboardShortcutManager.toggleHelp(),
      category: 'help' as const,
    },
  ];
}
