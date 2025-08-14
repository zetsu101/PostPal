"use client";

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80,
  className = "" 
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, threshold], [0, 1]);
  const scale = useTransform(y, [0, threshold], [0.8, 1]);
  const rotate = useTransform(y, [0, threshold], [0, 180]);

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > threshold && canRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    y.set(0);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 0) {
      y.set(info.offset.y);
      setCanRefresh(info.offset.y > threshold);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pull to refresh indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 z-10"
        style={{ opacity, y: -50 }}
      >
        <motion.div
          className="flex items-center gap-2 text-[#87CEFA]"
          style={{ scale, rotate }}
        >
          {isRefreshing ? (
            <div className="w-5 h-5 border-2 border-[#87CEFA] border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-lg">⬇️</span>
          )}
          <span className="text-sm font-medium">
            {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
          </span>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
}

interface SwipeableCardProps {
  children: ReactNode;
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
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, 200], [0.8, 0.8]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
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
    
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`relative ${className}`}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      style={{ x, y, rotate, opacity }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
      
      {/* Swipe indicators */}
      {isDragging && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-500 opacity-50">
            ←
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500 opacity-50">
            →
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface TouchFeedbackProps {
  children: ReactNode;
  onTap?: () => void;
  feedback?: 'ripple' | 'scale' | 'glow';
  className?: string;
}

export function TouchFeedback({ 
  children, 
  onTap, 
  feedback = 'ripple',
  className = "" 
}: TouchFeedbackProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [rippleId, setRippleId] = useState(0);

  const handleTap = (event: MouseEvent | TouchEvent | PointerEvent) => {
    if (feedback === 'ripple' && 'clientX' in event) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const newRipple = { id: rippleId, x, y };
      setRipples(prev => [...prev, newRipple]);
      setRippleId(prev => prev + 1);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }
    
    onTap?.();
  };

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      onTap={handleTap}
      whileTap={{ scale: feedback === 'scale' ? 0.95 : 1 }}
      whileHover={feedback === 'glow' ? { 
        boxShadow: "0 0 20px rgba(135, 206, 250, 0.4)" 
      } : {}}
    >
      {children}
      
      {/* Ripple effect */}
      {feedback === 'ripple' && ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute w-2 h-2 bg-[#87CEFA] rounded-full pointer-events-none"
          style={{
            left: ripple.x - 4,
            top: ripple.y - 4,
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 40, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}

interface MobileOptimizedListProps {
  items: Array<{ id: string | number; content: ReactNode }>;
  onItemPress?: (id: string | number) => void;
  className?: string;
}

export function MobileOptimizedList({ 
  items, 
  onItemPress, 
  className = "" 
}: MobileOptimizedListProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <TouchFeedback
            onTap={() => onItemPress?.(item.id)}
            feedback="ripple"
            className="w-full"
          >
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700 transition-colors">
              {item.content}
            </div>
          </TouchFeedback>
        </motion.div>
      ))}
    </div>
  );
}

// Mobile-specific utility hooks
export function useMobileGesture() {
  const [gesture, setGesture] = useState<string>('');
  
  const handleGesture = (direction: string) => {
    setGesture(direction);
    setTimeout(() => setGesture(''), 1000);
  };
  
  return { gesture, handleGesture };
}

export function useTouchFeedback() {
  const [isPressed, setIsPressed] = useState(false);
  
  const handlePressStart = () => setIsPressed(true);
  const handlePressEnd = () => setIsPressed(false);
  
  return { isPressed, handlePressStart, handlePressEnd };
}
