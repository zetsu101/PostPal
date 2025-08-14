"use client";

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'tilt';
  interactive?: boolean;
  delay?: number;
}

export function InteractiveCard({ 
  children, 
  className = "", 
  onClick, 
  hoverEffect = 'lift',
  interactive = true,
  delay = 0 
}: InteractiveCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);
  
  const springConfig = { damping: 20, stiffness: 300 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const getHoverVariants = () => {
    switch (hoverEffect) {
      case 'lift':
        return {
          hover: { 
            y: -8, 
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            scale: 1.02
          }
        };
      case 'glow':
        return {
          hover: { 
            boxShadow: "0 0 30px rgba(135, 206, 250, 0.4)",
            scale: 1.02
          }
        };
      case 'scale':
        return {
          hover: { 
            scale: 1.05,
            boxShadow: "0 15px 35px rgba(0,0,0,0.1)"
          }
        };
      case 'tilt':
        return {
          hover: { 
            rotateX: springRotateX.get(),
            rotateY: springRotateY.get(),
            scale: 1.02
          }
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: delay * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={interactive && hoverEffect !== 'tilt' ? getHoverVariants().hover : {}}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={hoverEffect === 'tilt' ? { 
        perspective: 1000,
        transformStyle: 'preserve-3d',
        rotateX: springRotateX,
        rotateY: springRotateY
      } : {}}
    >
      {/* Background gradient overlay */}
      {interactive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#87CEFA]/5 to-[#40E0D0]/5 opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Subtle border animation */}
      {interactive && (
        <motion.div
          className="absolute inset-0 border-2 border-transparent rounded-xl"
          animate={{
            borderColor: isHovered 
              ? "rgba(135, 206, 250, 0.3)" 
              : "transparent"
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}

// Specialized card variants
export function MetricCard({ 
  title, 
  value, 
  change, 
  trend = 'up',
  className = "" 
}: {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  return (
    <InteractiveCard 
      className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm ${className}`}
      hoverEffect="lift"
    >
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {change && (
          <div className="flex items-center gap-1">
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {getTrendIcon()} {change}
            </span>
          </div>
        )}
      </div>
    </InteractiveCard>
  );
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  className = "" 
}: {
  icon: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <InteractiveCard 
      className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}
      hoverEffect="glow"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-[#87CEFA] to-[#40E0D0] rounded-2xl flex items-center justify-center mx-auto">
          <span className="text-2xl">{icon}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </InteractiveCard>
  );
}
