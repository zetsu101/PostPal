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

type SafeMatchMedia = (query: string) => MediaQueryList;
type SafeAddEvent = (
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) => void;
type SafeRemoveEvent = SafeAddEvent;
type SafeSetTimeout = (handler: (...args: unknown[]) => void, timeout?: number, ...args: unknown[]) => number;

export const safeWindow = {
  location: isBrowser ? window.location : ({} as Location | null),
  // Bind window methods to avoid "Illegal invocation" in some browsers
  matchMedia: (isBrowser
    ? window.matchMedia.bind(window)
    : ((query: string) => ({
        media: query,
        matches: false,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      } as MediaQueryList))) as SafeMatchMedia,
  addEventListener: (isBrowser ? window.addEventListener.bind(window) : (() => {})) as SafeAddEvent,
  removeEventListener: (isBrowser ? window.removeEventListener.bind(window) : (() => {})) as SafeRemoveEvent,
  setTimeout: (isBrowser ? window.setTimeout.bind(window) : (() => 0)) as SafeSetTimeout,
  ServiceWorkerRegistration: (isBrowser ? (window as unknown as { ServiceWorkerRegistration?: typeof ServiceWorkerRegistration }).ServiceWorkerRegistration ?? null : null) as typeof ServiceWorkerRegistration | null,
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
