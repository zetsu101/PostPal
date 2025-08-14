import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

export default function Skeleton({
  className = '',
  variant = 'rounded',
  width,
  height,
  lines = 1,
  animated = true
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 rounded';
  const animationClasses = animated ? 'animate-pulse' : '';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return '';
      case 'rounded':
      default:
        return 'rounded-lg';
    }
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()} ${animationClasses} ${className}`}
            style={{
              width: width || '100%',
              height: height || '1rem'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${animationClasses} ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem'
      }}
    />
  );
}

// Specialized skeleton components for common use cases
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" className="mb-2" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="text" lines={3} className="mb-4" />
      <div className="flex gap-2">
        <Skeleton variant="rounded" width={80} height={32} />
        <Skeleton variant="rounded" width={80} height={32} />
      </div>
    </div>
  );
}

export function ChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
      <Skeleton variant="text" width="40%" className="mb-4" />
      <div className="w-full h-[250px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse mx-auto mb-3" />
          <Skeleton variant="text" width="120px" />
        </div>
      </div>
    </div>
  );
}

export function MetricSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="text" width="60px" />
      </div>
      <Skeleton variant="text" width="80%" className="mb-1" />
      <Skeleton variant="text" width="60%" />
    </div>
  );
}
