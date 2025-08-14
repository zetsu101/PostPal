// Utility functions for safe browser environment checks

export const isBrowser = typeof window !== 'undefined';

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (isBrowser && localStorage) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (isBrowser && localStorage) {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Silently fail in case of quota exceeded or other issues
      }
    }
  },
  removeItem: (key: string): void => {
    if (isBrowser && localStorage) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Silently fail
      }
    }
  }
};

export const safeWindow = {
  location: isBrowser ? window.location : null,
  matchMedia: isBrowser ? window.matchMedia : null,
  addEventListener: isBrowser ? window.addEventListener : null,
  removeEventListener: isBrowser ? window.removeEventListener : null,
  setTimeout: isBrowser ? window.setTimeout : null,
  ServiceWorkerRegistration: isBrowser ? window.ServiceWorkerRegistration : null
};

export const safeDocument = {
  documentElement: isBrowser ? document.documentElement : null,
  body: isBrowser ? document.body : null,
  querySelector: isBrowser ? document.querySelector : null,
  createElement: isBrowser ? document.createElement : null
};

export const safeNavigator = {
  onLine: isBrowser ? navigator.onLine : true,
  clipboard: isBrowser ? navigator.clipboard : null,
  serviceWorker: isBrowser ? navigator.serviceWorker : null
};
