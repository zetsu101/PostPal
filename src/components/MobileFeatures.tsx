"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

interface OfflineData {
  isOnline: boolean;
  pendingActions: number;
  lastSync: string;
}

export default function MobileFeatures() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  });
  const [offlineData, setOfflineData] = useState<OfflineData>({
    isOnline: true,
    pendingActions: 0,
    lastSync: new Date().toISOString()
  });
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    // Check for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    });

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission({
        granted: Notification.permission === 'granted',
        denied: Notification.permission === 'denied',
        default: Notification.permission === 'default'
      });
    }

    // Monitor online/offline status
    const handleOnline = () => {
      setOfflineData(prev => ({ ...prev, isOnline: true }));
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setOfflineData(prev => ({ ...prev, isOnline: false }));
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial online status
    setOfflineData(prev => ({ ...prev, isOnline: navigator.onLine }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('PWA installed successfully');
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };



  const sendTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('PostPal', {
        body: 'Your post has been scheduled successfully! 📅',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'post-scheduled',
        requireInteraction: false,
        silent: false
      });
    }
  };

  const syncOfflineData = async () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        (registration as any).sync.register('background-sync');
        setOfflineData(prev => ({
          ...prev,
          pendingActions: 0,
          lastSync: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }
  };

  return (
    <>
      {/* PWA Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">📱</span>
              <div>
                <h3 className="font-semibold text-[#1F2937]">Install PostPal</h3>
                <p className="text-sm text-[#6B7280]">Get the app experience</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleInstallPWA}
                className="flex-1 px-3 py-2 bg-[#87CEFA] text-white rounded-lg text-sm font-medium hover:bg-[#5F9EC7] transition-colors"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="px-3 py-2 bg-gray-100 text-[#6B7280] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Banner */}
      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-0 left-0 right-0 z-40 bg-[#F59E0B] text-white p-4 shadow-lg"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📶</span>
                <div>
                                     <h3 className="font-semibold">You&apos;re Offline</h3>
                  <p className="text-sm opacity-90">
                    {offlineData.pendingActions > 0 
                      ? `${offlineData.pendingActions} actions pending sync`
                      : 'Working offline - changes will sync when connected'
                    }
                  </p>
                </div>
              </div>
              {offlineData.pendingActions > 0 && (
                <button
                  onClick={syncOfflineData}
                  className="px-4 py-2 bg-white text-[#F59E0B] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Sync Now
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Quick Actions */}
      <div className="fixed bottom-4 right-4 z-30">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] rounded-full shadow-lg flex items-center justify-center text-white text-2xl"
          onClick={() => window.location.href = '/create'}
        >
          ✏️
        </motion.button>
      </div>


    </>
  );
} 