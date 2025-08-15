"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface EnhancedLoadingProps {
  type?: 'pulse' | 'wave' | 'dots' | 'spinner' | 'progress';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export function EnhancedLoading({ 
  type = 'pulse', 
  size = 'md', 
  text,
  showProgress = false,
  progress = 0,
  className = ""
}: EnhancedLoadingProps) {
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    if (showProgress && progress > 0) {
      const timer = setTimeout(() => {
        setCurrentProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress, showProgress]);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const renderLoader = () => {
    switch (type) {
      case 'pulse':
        return (
          <motion.div
            className={`${sizeClasses[size]} bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] rounded-full`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        );

      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={`${sizeClasses.sm} bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] rounded-full`}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`${sizeClasses.sm} bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] rounded-full`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        );

      case 'spinner':
        return (
          <motion.div
            className={`${sizeClasses[size]} border-2 border-gray-200 border-t-[#87CEFA] rounded-full`}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        );

      case 'progress':
        return (
          <div className="w-full max-w-xs">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${currentProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            {showProgress && (
              <motion.p
                className="text-center mt-2 text-sm text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {Math.round(currentProgress)}%
              </motion.p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {renderLoader()}
      
      {text && (
        <motion.p
          className={`text-gray-600 text-center ${textSizes[size]}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// Specialized loading components
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center space-y-6">
        <motion.div
          className="w-20 h-20 bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] rounded-3xl mx-auto"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl">📱</span>
          </div>
        </motion.div>
        
        <div className="space-y-2">
          <motion.h2
            className="text-xl font-semibold text-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading PostPal...
          </motion.h2>
          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Preparing your social media dashboard
          </motion.p>
        </div>
        
        <EnhancedLoading type="dots" size="md" />
      </div>
    </div>
  );
}

export function ContentLoading({ message = "Loading content..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4">
        <EnhancedLoading type="wave" size="lg" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export function SkeletonLoading({ 
  lines = 3, 
  className = "" 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-gray-200 rounded animate-pulse"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        />
      ))}
    </div>
  );
}
