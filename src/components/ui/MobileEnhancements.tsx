"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, PanInfo, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

// Pull to Refresh Component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export function PullToRefresh({ onRefresh, children, threshold = 80 }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0 && containerRef.current?.scrollTop === 0) {
      e.preventDefault();
      const pullDistance = Math.min(distance * 0.5, threshold * 1.5);
      setPullDistance(pullDistance);
    }
  }, [isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    isPulling.current = false;
  }, [pullDistance, threshold, onRefresh, isRefreshing]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const rotation = useTransform(
    useMotionValue(pullDistance),
    [0, threshold],
    [0, 180]
  );

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull Indicator */}
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-2 text-gray-500"
        style={{ y: pullDistance - 60 }}
        animate={{ opacity: pullDistance > 20 ? 1 : 0 }}
      >
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : 0 }}
          transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
        >
          <RefreshCw className="w-5 h-5" />
        </motion.div>
        <span className="text-sm font-medium">
          {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
        </span>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: pullDistance }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Swipeable Card Component
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  className?: string;
}

export function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  onSwipeDown,
  threshold = 100,
  className = ""
}: SwipeableCardProps) {

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 });

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (info.offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    if (Math.abs(info.offset.y) > threshold) {
      if (info.offset.y > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (info.offset.y < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }
    
    // Reset position
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`cursor-grab active:cursor-grabbing ${className}`}
      drag="x"
      dragConstraints={{ left: -threshold, right: threshold, top: -threshold, bottom: threshold }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      style={{ x: xSpring, y: ySpring }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}

// Touch Feedback Component
interface TouchFeedbackProps {
  children: React.ReactNode;
  feedbackType?: 'ripple' | 'scale' | 'glow';
  className?: string;
}

export function TouchFeedback({ 
  children, 
  feedbackType = 'ripple',
  className = ""
}: TouchFeedbackProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isPressed, setIsPressed] = useState(false);

  const addRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsPressed(false)}
      onClick={feedbackType === 'ripple' ? addRipple : undefined}
    >
      {children}
      
      {/* Ripple Effect */}
      {feedbackType === 'ripple' && ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      
      {/* Scale Effect */}
      {feedbackType === 'scale' && (
        <motion.div
          className="absolute inset-0 bg-blue-500/10 rounded-lg pointer-events-none"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: isPressed ? 1 : 0, 
            opacity: isPressed ? 1 : 0 
          }}
          transition={{ duration: 0.2 }}
        />
      )}
      
      {/* Glow Effect */}
      {feedbackType === 'glow' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isPressed ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </div>
  );
}

// Mobile Optimized List Component
interface MobileOptimizedListProps {
  items: Array<{ id: string; content: React.ReactNode }>;
  onItemPress?: (id: string) => void;
  onItemDelete?: (id: string) => void;
  className?: string;
}

export function MobileOptimizedList({ 
  items, 
  onItemPress, 
  onItemDelete,
  className = ""
}: MobileOptimizedListProps) {


  const handleDelete = (id: string) => {
    setTimeout(() => {
      onItemDelete?.(id);
    }, 300);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <TouchFeedback feedbackType="ripple">
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={() => onItemPress?.(item.id)}
            >
              {item.content}
            </div>
          </TouchFeedback>
          
          {/* Swipe to Delete */}
          {onItemDelete && (
            <motion.button
              className="absolute right-0 top-0 h-full bg-red-500 text-white px-4 rounded-r-lg flex items-center"
              initial={{ x: 100 }}
              whileHover={{ x: 0 }}
              onClick={() => handleDelete(item.id)}
            >
              <span className="text-sm font-medium">Delete</span>
            </motion.button>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Mobile Navigation Component
interface MobileNavigationProps {
  items: Array<{ id: string; label: string; icon: React.ReactNode; onClick: () => void }>;
  activeItem?: string;
  className?: string;
}

export function MobileNavigation({ 
  items, 
  activeItem,
  className = ""
}: MobileNavigationProps) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 ${className}`}>
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <TouchFeedback key={item.id} feedbackType="scale">
            <button
              onClick={item.onClick}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                activeItem === item.id
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          </TouchFeedback>
        ))}
      </div>
    </div>
  );
}
