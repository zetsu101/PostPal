"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function MigrationBanner() {
  const [needsMigration, setNeedsMigration] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    try {
      const response = await fetch('/api/database/migrate');
      const data = await response.json();
      setNeedsMigration(data.needsMigration);
    } catch (error) {
      console.error('Failed to check migration status:', error);
    }
  };

  const handleMigration = async () => {
    setIsMigrating(true);
    setError(null);

    try {
      const response = await fetch('/api/database/migrate', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMigrationComplete(true);
        setNeedsMigration(false);
        
        // Hide banner after 3 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      } else {
        setError(data.error || 'Migration failed');
      }
    } catch (error) {
      setError('Failed to migrate data');
    } finally {
      setIsMigrating(false);
    }
  };

  const dismissBanner = () => {
    setIsVisible(false);
  };

  if (!isVisible || (!needsMigration && !migrationComplete)) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              {migrationComplete ? (
                <CheckCircle className="w-6 h-6 text-green-300" />
              ) : (
                <Database className="w-6 h-6" />
              )}
              
              <div className="flex-1">
                {migrationComplete ? (
                  <div>
                    <p className="font-semibold">Migration Complete!</p>
                    <p className="text-sm text-blue-100">
                      Your data has been successfully migrated to the database.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">Database Migration Available</p>
                    <p className="text-sm text-blue-100">
                      Migrate your data from localStorage to our secure database for better performance and data persistence.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {needsMigration && !migrationComplete && (
                <Button
                  onClick={handleMigration}
                  disabled={isMigrating}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {isMigrating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Migrate Now</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}

              {error && (
                <div className="flex items-center space-x-2 text-red-200">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                onClick={dismissBanner}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
